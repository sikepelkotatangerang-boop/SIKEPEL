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
 * API untuk generate Surat Keterangan Belum Memiliki Rumah menggunakan ConvertAPI:
 * 1. Load template BELUMRUMAH.docx
 * 2. Fill template dengan data form
 * 3. Convert DOCX ke PDF menggunakan ConvertAPI
 * 4. Upload PDF ke Supabase Storage (GRATIS - 1GB free tier)
 * 5. Simpan metadata ke database
 * 6. Return PDF untuk download
 */
export async function POST(request: NextRequest) {
  let tempDocxPath: string | null = null;
  let tempPdfPath: string | null = null;

  try {
    const body = await request.json();
    const { formData, userId } = body;

    console.log('Generating Surat Belum Rumah with ConvertAPI...');

    // Validasi data pejabat
    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
      return NextResponse.json(
        { error: 'Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.' },
        { status: 400 }
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
    const templatePath = join(process.cwd(), 'public', 'template', 'BELUMRUMAH.docx');
    console.log('Loading template from:', templatePath);
    const content = readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function () {
        return '';
      },
    });

    // Format tanggal lahir to Indonesian format
    const formatTanggal = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
    };

    const getBulanRomawi = () => {
      const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      return bulanRomawi[new Date().getMonth()];
    };

    const isLurah = formData.jabatan?.toLowerCase().trim() === 'lurah';
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : formData.jabatan || '';

    // Prepare template data
    const templateData = {
      nomor_surat: formData.nomor_surat || '',
      tanggal_surat: formatTanggal(new Date().toISOString()),
      tahun_surat: new Date().getFullYear().toString(),
      bulan_romawi: getBulanRomawi(),
      nik_pemohon: formData.nik_pemohon || '',
      nama_pemohon: formData.nama_pemohon || '',
      tempat_lahir: formData.tempat_lahir || '',
      tanggal_lahir: formatTanggal(formData.tanggal_lahir),
      kelamin_pemohon: formData.kelamin_pemohon || '',
      agama: formData.agama || '',
      pekerjaan: formData.pekerjaan || '',
      perkawinan: formData.perkawinan || '',
      negara: formData.negara || 'Indonesia',
      alamat: formData.alamat || '',
      rt: formData.rt || '',
      rw: formData.rw || '',
      kelurahan: (formData.kelurahan || 'Cibodas').toUpperCase(),
      alamat_kelurahan: alamatKelurahan,
      kecamatan: formData.kecamatan || '',
      kota_kabupaten: formData.kota_kabupaten || '',
      peruntukan: formData.peruntukan || '',
      pengantar_rt: formData.pengantar_rt || '',
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    console.log('Template Data:', JSON.stringify(templateData, null, 2));

    // Render the document
    try {
      doc.render(templateData);
    } catch (renderError: any) {
      console.error('Render Error:', renderError);
      if (renderError.properties && renderError.properties.errors) {
        console.error('Detailed Errors:', JSON.stringify(renderError.properties.errors, null, 2));
      }
      throw new Error(`Template render error: ${renderError.message}`);
    }

    // Generate the DOCX document
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log('DOCX Buffer size:', docxBuffer.length, 'bytes');

    // Convert DOCX to PDF using ConvertAPI
    const convertApiSecret = await getSetting('CONVERTAPI_SECRET') || process.env.CONVERTAPI_SECRET;

    if (!convertApiSecret) {
      console.error('CONVERTAPI_SECRET not found in environment variables');
      return NextResponse.json(
        { error: 'ConvertAPI not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Save DOCX to temporary file
    tempDocxPath = join(tmpdir(), `belum_rumah_${Date.now()}.docx`);

    try {
      console.log('Saving temporary DOCX file...');
      writeFileSync(tempDocxPath, docxBuffer);
      console.log('Temporary DOCX saved:', tempDocxPath);

      console.log('Initializing ConvertAPI...');
      const convertapi = new ConvertAPI(convertApiSecret);

      console.log('Converting DOCX to PDF...');
      const result = await convertapi.convert(
        'pdf',
        { File: tempDocxPath },
        'docx'
      );

      console.log('Conversion successful, saving PDF...');
      tempPdfPath = join(tmpdir(), `belum_rumah_${Date.now()}.pdf`);
      await result.files[0].save(tempPdfPath);
      console.log('PDF saved to:', tempPdfPath);

      // Read PDF file
      const pdfBuffer = readFileSync(tempPdfPath);
      console.log('PDF buffer obtained successfully, size:', pdfBuffer.length, 'bytes');

      // Upload PDF to Supabase Storage (GRATIS!)
      const fileName = `belum-rumah/${Date.now()}_${formData.nama_pemohon.replace(/\s+/g, '_')}.pdf`;

      let supabaseFileId: string | null = null;
      let supabasePublicUrl: string | null = null;

      try {
        const uploadResult = await uploadToSupabase(
          pdfBuffer,
          fileName,
          'documents', // bucket name
          'application/pdf'
        );

        supabaseFileId = uploadResult.fileId;
        supabasePublicUrl = uploadResult.publicUrl;

        console.log('Uploaded to Supabase Storage:', supabasePublicUrl);
      } catch (uploadError) {
        console.error('Error uploading to Supabase Storage:', uploadError);
        console.log('Continuing without Supabase upload...');
      }

      // Save to database (document_archives table)
      try {
        const insertArchiveQuery = `
          INSERT INTO document_archives (
            nomor_surat, jenis_dokumen, tanggal_surat, perihal,
            nik_subjek, nama_subjek, alamat_subjek,
            data_detail,
            pejabat_id, nama_pejabat, nip_pejabat, jabatan_pejabat,
            storage_path, storage_url,
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
          peruntukan: formData.peruntukan,
          pengantar_rt: formData.pengantar_rt
        };

        const archiveValues = [
          formData.nomor_surat,
          'Belum Memiliki Rumah',
          new Date(),
          `Surat Keterangan Belum Memiliki Rumah untuk ${formData.peruntukan}`,
          formData.nik_pemohon,
          formData.nama_pemohon,
          alamatLengkap,
          JSON.stringify(dataDetail),
          formData.pejabat_id || null,
          formData.nama_pejabat,
          formData.nip_pejabat,
          formData.jabatan,
          supabaseFileId, // storage_path (Supabase file path)
          supabasePublicUrl, // storage_url (Supabase public URL)
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

      // Return the PDF document
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });

    } catch (convertError: any) {
      console.error('Error converting to PDF with ConvertAPI:', convertError);

      if (convertError.response) {
        console.error('ConvertAPI Response Error:', JSON.stringify(convertError.response, null, 2));
      }
      if (convertError.message) {
        console.error('ConvertAPI Error Message:', convertError.message);
      }

      throw new Error(`ConvertAPI conversion failed: ${convertError.message}`);
    }

  } catch (error) {
    console.error('Error generating Belum Rumah document:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate document',
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
