import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import db from '@/lib/db';
import ConvertAPI from 'convertapi';
import { uploadToSupabase } from '@/lib/supabaseStorage';
import { getSetting } from '@/lib/utils/settings';

/**
 * API untuk memproses Surat Pengantar Nikah (N1):
 * 1. Generate DOCX dari template N1.docx
 * 2. Convert DOCX ke PDF menggunakan ConvertAPI
 * 3. Upload PDF ke Supabase Storage
 * 4. Simpan metadata ke database
 * 5. Return PDF untuk download
 */
export async function POST(request: NextRequest) {
  let tempDocxPath: string | null = null;
  let tempPdfPath: string | null = null;

  try {
    const body = await request.json();
    const { formData, userId, includePernyataan } = body;

    console.log('Processing Pengantar Nikah with ConvertAPI...');
    console.log('Include Pernyataan:', includePernyataan);
    console.log('Form data received:', JSON.stringify(formData, null, 2));

    // Validasi data
    if (!formData.nama_pemohon || !formData.nik_pemohon) {
      return NextResponse.json(
        { error: 'Data pemohon tidak lengkap' },
        { status: 400 }
      );
    }

    // Validasi ConvertAPI
    const convertApiSecret = await getSetting('CONVERTAPI_SECRET') || process.env.CONVERTAPI_SECRET;
    if (!convertApiSecret) {
      return NextResponse.json(
        { error: 'ConvertAPI tidak dikonfigurasi. Hubungi administrator.' },
        { status: 500 }
      );
    }

    // Get kelurahan ID
    let kelurahanId: number | null = null;
    if (userId) {
      try {
        const userResult = await db.query<{ kelurahan_id: number }>(
          'SELECT kelurahan_id FROM users WHERE id = $1 LIMIT 1',
          [userId]
        );
        if (userResult.rows.length > 0) {
          kelurahanId = userResult.rows[0].kelurahan_id;
        }
      } catch (dbError) {
        console.error('Error fetching user kelurahan:', dbError);
      }
    }

    // Load the template N1.docx
    const templatePath = join(process.cwd(), 'public', 'template', 'N1.docx');
    console.log('Template path:', templatePath);

    let content;
    try {
      content = readFileSync(templatePath, 'binary');
      console.log('Template N1.docx loaded successfully, size:', content.length);
    } catch (fileError) {
      console.error('Error reading template file:', fileError);
      return NextResponse.json(
        { error: 'Template file N1.docx tidak ditemukan. Hubungi administrator.' },
        { status: 500 }
      );
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function () {
        return '';
      },
    });

    // Format tanggal
    const formatTanggal = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
    };

    const tanggalSurat = formatTanggal(new Date().toISOString());

    // Determine jabatan display logic
    const isLurah = formData.jabatan?.toLowerCase().trim() === 'lurah';
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : (formData.jabatan || '');

    // Kelurahan in uppercase
    const kelurahanUpper = (formData.kelurahan || 'Cibodas').toUpperCase();

    // Prepare data for template - sesuai dengan placeholder di N1.docx
    const templateData = {
      // Header
      kelurahan: kelurahanUpper,

      // Nomor Surat
      nomor_surat: formData.nomor_surat || '',

      // Data Pemohon
      nama_pemohon: formData.nama_pemohon || '',
      nik_pemohon: formData.nik_pemohon || '',
      kelamin_pemohon: formData.kelamin_pemohon || '',
      tempat_lahir_pemohon: formData.tempat_lahir_pemohon || '',
      tanggal_lahir_pemohon: formatTanggal(formData.tanggal_lahir_pemohon),
      negara_pemohon: formData.negara_pemohon || 'Indonesia',
      agama_pemohon: formData.agama_pemohon || '',
      pekerjaan_pemohon: formData.pekerjaan_pemohon || '',
      alamat_pemohon: formData.alamat_pemohon || '',
      rt_pemohon: formData.rt_pemohon || '',
      rw_pemohon: formData.rw_pemohon || '',

      // Status Perkawinan (support both underscore and hyphen format)
      status_jika_laki_laki: formData.status_jika_laki_laki || '',
      'status_jika_laki-laki': formData.status_jika_laki_laki || '',
      status_jika_perempuan: formData.status_jika_perempuan || '',

      // Data Bapak
      nama_bapak: formData.nama_bapak || '',
      nik_bapak: formData.nik_bapak || '',
      tempat_lahir_bapak: formData.tempat_lahir_bapak || '',
      tanggal_lahir_bapak: formatTanggal(formData.tanggal_lahir_bapak),
      negara_bapak: formData.negara_bapak || 'Indonesia',
      agama_bapak: formData.agama_bapak || '',
      pekerjaan_bapak: formData.pekerjaan_bapak || '',
      alamat_bapak: formData.alamat_bapak || '',

      // Data Ibu
      nama_ibu: formData.nama_ibu || '',
      nik_ibu: formData.nik_ibu || '',
      tempat_lahir_ibu: formData.tempat_lahir_ibu || '',
      tanggal_lahir_ibu: formatTanggal(formData.tanggal_lahir_ibu),
      negara_ibu: formData.negara_ibu || 'Indonesia',
      agama_ibu: formData.agama_ibu || '',
      pekerjaan_ibu: formData.pekerjaan_ibu || '',
      alamat_ibu: formData.alamat_ibu || '',

      // Tanggal dan Pejabat
      tanggal_surat: tanggalSurat,
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
    };

    console.log('Template data prepared:', JSON.stringify(templateData, null, 2));

    // Set the template data
    doc.setData(templateData);

    try {
      doc.render();
      console.log('Template rendered successfully');
    } catch (error) {
      console.error('Error rendering template:', error);
      return NextResponse.json(
        { error: 'Gagal mengisi template dokumen' },
        { status: 500 }
      );
    }

    // Generate DOCX buffer
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Save DOCX to temporary file
    tempDocxPath = join(tmpdir(), `pengantar_nikah_${Date.now()}.docx`);
    writeFileSync(tempDocxPath, docxBuffer);
    console.log('Temporary DOCX saved:', tempDocxPath);

    // Convert DOCX to PDF using ConvertAPI
    console.log('Starting ConvertAPI conversion...');
    const convertapi = new ConvertAPI(convertApiSecret);

    try {
      const convertResult = await convertapi.convert('pdf', {
        File: tempDocxPath,
      }, 'docx');
      console.log('ConvertAPI conversion successful');

      // Save PDF to temporary file
      tempPdfPath = join(tmpdir(), `pengantar_nikah_${Date.now()}.pdf`);
      await convertResult.file.save(tempPdfPath);
      console.log('PDF generated with ConvertAPI:', tempPdfPath);
    } catch (convertError) {
      console.error('ConvertAPI error:', convertError);
      throw new Error(`ConvertAPI failed: ${convertError instanceof Error ? convertError.message : 'Unknown error'}`);
    }

    // Read PDF buffer
    const pdfBuffer = readFileSync(tempPdfPath);
    console.log('PDF N1 buffer size:', pdfBuffer.length, 'bytes');

    // Upload to Supabase Storage
    const jenisSuratFolder = 'pengantar-nikah';
    const fileName = `${jenisSuratFolder}/${formData.nama_pemohon.replace(/\s+/g, '_')}_N1_${Date.now()}.pdf`;
    let supabaseFileId: string | null = null;
    let supabasePublicUrl: string | null = null;

    try {
      const uploadResult = await uploadToSupabase(
        pdfBuffer,
        fileName,
        'pdf_surat',
        'application/pdf'
      );

      supabaseFileId = uploadResult.fileId;
      supabasePublicUrl = uploadResult.publicUrl;

      console.log('Uploaded N1 to Supabase Storage:', supabasePublicUrl);
    } catch (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      throw new Error('Failed to upload PDF to Supabase Storage');
    }

    // Process PERNYATAANNIKAH.docx if requested
    let pernyataanPdfBuffer: Buffer | null = null;
    let pernyataanFileName: string | null = null;
    let tempPernyataanDocxPath: string | null = null;
    let tempPernyataanPdfPath: string | null = null;

    if (includePernyataan) {
      console.log('Processing PERNYATAANNIKAH.docx...');

      try {
        // Load PERNYATAANNIKAH template
        const pernyataanTemplatePath = join(process.cwd(), 'public', 'template', 'PERNYATAANNIKAH.docx');
        const pernyataanContent = readFileSync(pernyataanTemplatePath, 'binary');

        const pernyataanZip = new PizZip(pernyataanContent);
        const pernyataanDoc = new Docxtemplater(pernyataanZip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: function () { return ''; },
        });

        // Prepare data for PERNYATAANNIKAH template
        const pernyataanData = {
          nama_pemohon: formData.nama_pemohon || '',
          nik_pemohon: formData.nik_pemohon || '',
          tempat_lahir_pemohon: formData.tempat_lahir_pemohon || '',
          tanggal_lahir_pemohon: formatTanggal(formData.tanggal_lahir_pemohon),
          kelamin_pemohon: formData.kelamin_pemohon || '',
          agama_pemohon: formData.agama_pemohon || '',
          pekerjaan_pemohon: formData.pekerjaan_pemohon || '',
          negara_pemohon: formData.negara_pemohon || 'Indonesia',
          alamat_pemohon: formData.alamat_pemohon || '',
          rt_pemohon: formData.rt_pemohon || '',
          rw_pemohon: formData.rw_pemohon || '',
          kelurahan_pemohon: (formData.kelurahan_pemohon || 'Cibodas').toUpperCase(),
          kecamatan_pemohon: (formData.kecamatan_pemohon || 'Tangerang').toUpperCase(),
          nama_bapak: formData.nama_bapak || '',
          kelurahan: kelurahanUpper,
          tanggal_surat: tanggalSurat,
        };

        pernyataanDoc.setData(pernyataanData);
        pernyataanDoc.render();

        // Generate DOCX buffer
        const pernyataanDocxBuffer = pernyataanDoc.getZip().generate({
          type: 'nodebuffer',
          compression: 'DEFLATE',
        });

        // Save to temp file
        tempPernyataanDocxPath = join(tmpdir(), `pernyataan_nikah_${Date.now()}.docx`);
        writeFileSync(tempPernyataanDocxPath, pernyataanDocxBuffer);
        console.log('Temporary PERNYATAANNIKAH DOCX saved:', tempPernyataanDocxPath);

        // Convert to PDF
        const pernyataanConvertResult = await convertapi.convert('pdf', {
          File: tempPernyataanDocxPath,
        }, 'docx');

        tempPernyataanPdfPath = join(tmpdir(), `pernyataan_nikah_${Date.now()}.pdf`);
        await pernyataanConvertResult.file.save(tempPernyataanPdfPath);
        console.log('PERNYATAANNIKAH PDF generated:', tempPernyataanPdfPath);

        // Read PDF buffer
        pernyataanPdfBuffer = readFileSync(tempPernyataanPdfPath);
        console.log('PDF PERNYATAANNIKAH buffer size:', pernyataanPdfBuffer.length, 'bytes');

        // Upload to Supabase
        pernyataanFileName = `${jenisSuratFolder}/${formData.nama_pemohon.replace(/\s+/g, '_')}_Pernyataan_${Date.now()}.pdf`;
        const pernyataanUploadResult = await uploadToSupabase(
          pernyataanPdfBuffer,
          pernyataanFileName,
          'pdf_surat',
          'application/pdf'
        );
        console.log('Uploaded PERNYATAANNIKAH to Supabase Storage:', pernyataanUploadResult.publicUrl);

        // Save to database
        const pernyataanArchiveQuery = `
          INSERT INTO document_archives (
            nomor_surat, jenis_dokumen, tanggal_surat, perihal,
            nik_subjek, nama_subjek, alamat_subjek,
            data_detail,
            pejabat_id, nama_pejabat, nip_pejabat, jabatan_pejabat,
            google_drive_id, google_drive_url,
            file_name, file_size, mime_type,
            kelurahan_id, created_by, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
          ) RETURNING id
        `;

        const alamatLengkap = `${formData.alamat_pemohon}, RT ${formData.rt_pemohon}/RW ${formData.rw_pemohon}, ${formData.kelurahan}`;

        const pernyataanArchiveValues = [
          formData.nomor_surat + '-PERNYATAAN',
          'Surat Pernyataan Belum Menikah',
          new Date(),
          'Surat Pernyataan Belum Menikah (Lampiran Pengantar Nikah)',
          formData.nik_pemohon,
          formData.nama_pemohon,
          alamatLengkap,
          JSON.stringify({ related_to: 'Pengantar Nikah' }),
          formData.pejabat_id || null,
          formData.nama_pejabat,
          formData.nip_pejabat,
          formData.jabatan,
          pernyataanUploadResult.fileId,
          pernyataanUploadResult.publicUrl,
          pernyataanFileName,
          pernyataanPdfBuffer.length,
          'application/pdf',
          kelurahanId,
          userId || null,
          'active'
        ];

        await db.query(pernyataanArchiveQuery, pernyataanArchiveValues);
        console.log('PERNYATAANNIKAH saved to database');

      } catch (pernyataanError) {
        console.error('Error processing PERNYATAANNIKAH:', pernyataanError);
        // Continue even if pernyataan fails
      } finally {
        // Cleanup pernyataan temp files
        try {
          if (tempPernyataanDocxPath) unlinkSync(tempPernyataanDocxPath);
          if (tempPernyataanPdfPath) unlinkSync(tempPernyataanPdfPath);
        } catch (cleanupError) {
          console.error('Error cleaning up pernyataan temp files:', cleanupError);
        }
      }
    }

    // Save to database
    console.log('Saving to database...');
    try {
      const insertArchiveQuery = `
        INSERT INTO document_archives (
          nomor_surat, jenis_dokumen, tanggal_surat, perihal,
          nik_subjek, nama_subjek, alamat_subjek,
          data_detail,
          pejabat_id, nama_pejabat, nip_pejabat, jabatan_pejabat,
          google_drive_id, google_drive_url,
          file_name, file_size, mime_type,
          kelurahan_id, created_by, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING id
      `;

      const alamatLengkap = `${formData.alamat_pemohon}, RT ${formData.rt_pemohon}/RW ${formData.rw_pemohon}, ${formData.kelurahan}`;

      const dataDetail = {
        tempat_lahir_pemohon: formData.tempat_lahir_pemohon,
        tanggal_lahir_pemohon: formData.tanggal_lahir_pemohon,
        kelamin_pemohon: formData.kelamin_pemohon,
        agama_pemohon: formData.agama_pemohon,
        pekerjaan_pemohon: formData.pekerjaan_pemohon,
        negara_pemohon: formData.negara_pemohon,
        status_jika_laki_laki: formData.status_jika_laki_laki,
        status_jika_perempuan: formData.status_jika_perempuan,
        nik_bapak: formData.nik_bapak,
        nama_bapak: formData.nama_bapak,
        tempat_lahir_bapak: formData.tempat_lahir_bapak,
        tanggal_lahir_bapak: formData.tanggal_lahir_bapak,
        agama_bapak: formData.agama_bapak,
        pekerjaan_bapak: formData.pekerjaan_bapak,
        negara_bapak: formData.negara_bapak,
        alamat_bapak: formData.alamat_bapak,
        nik_ibu: formData.nik_ibu,
        nama_ibu: formData.nama_ibu,
        tempat_lahir_ibu: formData.tempat_lahir_ibu,
        tanggal_lahir_ibu: formData.tanggal_lahir_ibu,
        agama_ibu: formData.agama_ibu,
        pekerjaan_ibu: formData.pekerjaan_ibu,
        negara_ibu: formData.negara_ibu,
        alamat_ibu: formData.alamat_ibu,
      };

      console.log('💾 Saving Pengantar Nikah to database with nomor_surat:', formData.nomor_surat);

      const archiveValues = [
        formData.nomor_surat,
        'Pengantar Nikah',
        new Date(),
        'Surat Pengantar Pernikahan',
        formData.nik_pemohon,
        formData.nama_pemohon,
        alamatLengkap,
        JSON.stringify(dataDetail),
        formData.pejabat_id || null,
        formData.nama_pejabat,
        formData.nip_pejabat,
        formData.jabatan,
        supabaseFileId,
        supabasePublicUrl,
        fileName,
        pdfBuffer.length,
        'application/pdf',
        kelurahanId,
        userId || null,
        'active'
      ];

      const archiveResult = await db.query(insertArchiveQuery, archiveValues);
      console.log('Saved to document_archives, ID:', archiveResult.rows[0].id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database save fails
    }

    // Return response based on number of documents
    if (includePernyataan && pernyataanPdfBuffer) {
      console.log('Returning JSON with 2 PDF buffers...');

      // Return JSON with both PDFs as base64
      return NextResponse.json({
        success: true,
        documents: [
          {
            name: `N1_${formData.nama_pemohon.replace(/\s+/g, '_')}.pdf`,
            data: pdfBuffer.toString('base64'),
            type: 'application/pdf'
          },
          {
            name: `Pernyataan_${formData.nama_pemohon.replace(/\s+/g, '_')}.pdf`,
            data: pernyataanPdfBuffer.toString('base64'),
            type: 'application/pdf'
          }
        ]
      });
    } else {
      // Return single PDF
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

  } catch (error) {
    console.error('Error processing Pengantar Nikah:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat memproses dokumen',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temporary files
    try {
      if (tempDocxPath) unlinkSync(tempDocxPath);
      if (tempPdfPath) unlinkSync(tempPdfPath);
      console.log('Temporary files cleaned up');
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }
  }
}
