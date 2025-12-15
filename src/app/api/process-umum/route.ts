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
 * API untuk memproses Surat Keterangan Umum:
 * 1. Generate DOCX dari template UMUM.docx
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
    const { formData, userId } = body;

    console.log('Processing Umum for user:', userId);
    console.log('Form data received:', JSON.stringify(formData, null, 2));

    // Validasi data pejabat (NIP bisa kosong)
    if (!formData.nama_pejabat || !formData.jabatan) {
      return NextResponse.json(
        { error: 'Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.' },
        { status: 400 }
      );
    }

    // Validasi ConvertAPI
    const convertApiSecret = await getSetting('CONVERTAPI_SECRET') || process.env.CONVERTAPI_SECRET;
    if (!convertApiSecret) {
      return NextResponse.json(
        { error: 'ConvertAPI secret not configured' },
        { status: 500 }
      );
    }

    // Get alamat kelurahan from database
    let alamatKelurahan = formData.alamat_kelurahan || '';
    let kelurahanId: number | null = null;

    if (formData.kelurahan) {
      try {
        const kelurahanResult = await db.query<{ id: number; alamat: string }>(
          'SELECT id, alamat FROM kelurahan WHERE LOWER(nama) = LOWER($1) LIMIT 1',
          [formData.kelurahan]
        );

        if (kelurahanResult.rows.length > 0) {
          alamatKelurahan = kelurahanResult.rows[0].alamat;
          kelurahanId = kelurahanResult.rows[0].id;
        }
      } catch (dbError) {
        console.error('Error fetching kelurahan:', dbError);
      }
    }

    // Load the template
    const templatePath = join(process.cwd(), 'public', 'template', 'UMUM.docx');
    console.log('Template path:', templatePath);

    let content;
    try {
      content = readFileSync(templatePath, 'binary');
      console.log('Template loaded successfully, size:', content.length);
    } catch (fileError) {
      console.error('Error reading template file:', fileError);
      return NextResponse.json(
        { error: 'Template file UMUM.docx tidak ditemukan. Hubungi administrator.' },
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

    const isLurah = formData.jabatan?.toLowerCase().trim() === 'lurah';
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : formData.jabatan || '';

    // Prepare data for template
    const templateData = {
      nomor_surat: formData.nomor_surat,
      tanggal_surat: formatTanggal(new Date().toISOString()),
      pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '',

      // Data Pemohon
      nik_pemohon: formData.nik_pemohon,
      nama_pemohon: formData.nama_pemohon,
      tempat_lahir: formData.tempat_lahir,
      tanggal_lahir: formatTanggal(formData.tanggal_lahir),
      kelamin_pemohon: formData.kelamin_pemohon,
      agama: formData.agama,
      pekerjaan: formData.pekerjaan,
      perkawinan: formData.perkawinan,
      negara: formData.negara,

      // Alamat
      alamat: formData.alamat,
      rt: formData.rt,
      rw: formData.rw,
      kelurahan: formData.kelurahan,
      kecamatan: formData.kecamatan,
      kota_kabupaten: formData.kota_kabupaten,
      alamat_kelurahan: alamatKelurahan,

      // Keperluan
      keperluan: formData.peruntukan || '',
      peruntukan: formData.peruntukan || '',

      // Data Pejabat
      nama_pejabat: formData.nama_pejabat,
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    console.log('Template data prepared:', JSON.stringify(templateData, null, 2));

    // Set the template data
    doc.setData(templateData);

    try {
      doc.render();
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
    tempDocxPath = join(tmpdir(), `umum_${Date.now()}.docx`);
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
      tempPdfPath = join(tmpdir(), `umum_${Date.now()}.pdf`);
      await convertResult.file.save(tempPdfPath);
      console.log('PDF generated with ConvertAPI:', tempPdfPath);
    } catch (convertError) {
      console.error('ConvertAPI error:', convertError);
      throw new Error(`ConvertAPI failed: ${convertError instanceof Error ? convertError.message : 'Unknown error'}`);
    }

    // Read PDF buffer
    const pdfBuffer = readFileSync(tempPdfPath);

    // Upload to Supabase Storage (bucket: pdf_surat, folder: umum)
    const jenisSuratFolder = 'umum';
    const fileName = `${jenisSuratFolder}/${formData.nama_pemohon.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
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

      console.log('Uploaded to Supabase Storage:', supabasePublicUrl);
    } catch (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      throw new Error('Failed to upload PDF to Supabase Storage');
    }

    // For database compatibility (use same column names)
    const googleDriveId: string | null = supabaseFileId;
    const googleDriveUrl: string | null = supabasePublicUrl;

    // Save to database (document_archives table - same as SKTM)
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

      const alamatLengkap = `${formData.alamat}, RT ${formData.rt}/RW ${formData.rw}, ${formData.kelurahan}, ${formData.kecamatan}, ${formData.kota_kabupaten}`;

      const dataDetail = {
        tempat_lahir: formData.tempat_lahir,
        tanggal_lahir: formData.tanggal_lahir,
        kelamin_pemohon: formData.kelamin_pemohon,
        agama: formData.agama,
        pekerjaan: formData.pekerjaan,
        perkawinan: formData.perkawinan,
        negara: formData.negara,
        rt: formData.rt,
        rw: formData.rw,
        kelurahan: formData.kelurahan,
        kecamatan: formData.kecamatan,
        kota_kabupaten: formData.kota_kabupaten,
        keperluan: formData.peruntukan,
        peruntukan: formData.peruntukan,
        pengantar_rt: formData.pengantar_rt
      };

      const archiveValues = [
        formData.nomor_surat,
        'Surat Keterangan Umum',
        new Date(),
        `Surat Keterangan Umum`,
        formData.nik_pemohon,
        formData.nama_pemohon,
        alamatLengkap,
        JSON.stringify(dataDetail),
        formData.pejabat_id || null,
        formData.nama_pejabat,
        formData.nip_pejabat,
        formData.jabatan,
        googleDriveId,
        googleDriveUrl,
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
      console.error('Error saving to database:', dbError);
      // Continue even if database save fails
    }

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error processing Umum:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to process document',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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
