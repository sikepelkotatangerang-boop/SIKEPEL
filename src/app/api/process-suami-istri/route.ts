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
 * API untuk membaca placeholder dari template KETERANGANSUAMIISTRI.docx
 * Endpoint ini digunakan untuk development - melihat field apa saja yang ada di template
 */
export async function GET(request: NextRequest) {
  try {
    // Load the template
    const templatePath = join(process.cwd(), 'public', 'template', 'KETERANGANSUAMIISTRI.docx');
    console.log('Loading template from:', templatePath);

    const content = readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    // Extract XML content to find placeholders
    const doc = zip.file('word/document.xml');
    if (!doc) {
      throw new Error('Could not find document.xml in template');
    }

    const xmlContent = doc.asText();

    // Find all placeholders in format {placeholder_name}
    const placeholderRegex = /\{([^}]+)\}/g;
    const matches = xmlContent.matchAll(placeholderRegex);
    const placeholders = new Set<string>();

    for (const match of matches) {
      placeholders.add(match[1]);
    }

    const placeholderList = Array.from(placeholders).sort();

    console.log('Found placeholders:', placeholderList);

    return NextResponse.json({
      success: true,
      template: 'KETERANGANSUAMIISTRI.docx',
      placeholders: placeholderList,
      count: placeholderList.length,
      message: 'Use these placeholders to create the form fields'
    });

  } catch (error) {
    console.error('Error reading template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * API untuk memproses Surat Keterangan Suami Istri:
 * 1. Generate DOCX dari template
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

    // Validasi data pejabat
    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
      return NextResponse.json(
        { error: 'Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.' },
        { status: 400 }
      );
    }

    // Validasi data suami istri
    if (!formData.nama_suami || !formData.nama_istri) {
      return NextResponse.json(
        { error: 'Data suami dan istri harus dilengkapi' },
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
    const templatePath = join(process.cwd(), 'public', 'template', 'KETERANGANSUAMIISTRI.docx');
    const content = readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function () {
        return '';
      },
    });

    // Format tanggal to Indonesian format
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

      // Data Suami
      nama_suami: formData.nama_suami || '',
      tempat_lahir_suami: formData.tempat_lahir_suami || '',
      tanggal_lahir_suami: formatTanggal(formData.tanggal_lahir_suami),
      agama_suami: formData.agama_suami || '',
      pekerjaan_suami: formData.pekerjaan_suami || '',
      negara_suami: formData.negara_suami || 'Indonesia',
      alamat_suami: formData.alamat_suami || '',
      rt_suami: formData.rt_suami || '',
      rw_suami: formData.rw_suami || '',
      kel_suami: formData.kel_suami || '',
      kec_suami: formData.kec_suami || '',
      kota_suami: formData.kota_suami || '',

      // Data Istri
      nama_istri: formData.nama_istri || '',
      tempat_lahir_istri: formData.tempat_lahir_istri || '',
      tanggal_lahir_istri: formatTanggal(formData.tanggal_lahir_istri),
      agama_istri: formData.agama_istri || '',
      pekerjaan_istri: formData.pekerjaan_istri || '',
      negara_istri: formData.negara_istri || 'Indonesia',
      alamat_istri: formData.alamat_istri || '',
      rt_istri: formData.rt_istri || '',
      rw_istri: formData.rw_istri || '',
      kel_istri: formData.kel_istri || '',
      kec_istri: formData.kec_istri || '',
      kota_istri: formData.kota_istri || '',

      // Data Pernikahan
      tanggal_pernikahan: formatTanggal(formData.tanggal_pernikahan),
      keterangan_akta_perkawinan: formData.keterangan_akta_perkawinan || '',

      // Keperluan
      peruntukan: formData.peruntukan || '',
      pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '',

      // Data Kelurahan & Pejabat
      kelurahan: (formData.kelurahan || 'Cibodas').toUpperCase(),
      alamat_kelurahan: alamatKelurahan,
      kecamatan: formData.kec_suami || formData.kecamatan || '',
      kota_kabupaten: formData.kota_suami || formData.kota_kabupaten || '',
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    console.log('Rendering document...');
    doc.render(templateData);

    // Generate DOCX
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log('DOCX generated, size:', docxBuffer.length, 'bytes');

    // Save DOCX to temporary file
    tempDocxPath = join(tmpdir(), `suami_istri_${Date.now()}.docx`);
    writeFileSync(tempDocxPath, docxBuffer);
    console.log('Temporary DOCX saved:', tempDocxPath);

    // Convert DOCX to PDF using ConvertAPI
    console.log('Converting DOCX to PDF...');
    const convertapi = new ConvertAPI(convertApiSecret);
    const result = await convertapi.convert('pdf', { File: tempDocxPath }, 'docx');

    // Save PDF to temporary file
    tempPdfPath = join(tmpdir(), `suami_istri_${Date.now()}.pdf`);
    await result.files[0].save(tempPdfPath);
    console.log('PDF saved to:', tempPdfPath);

    // Read PDF buffer
    const pdfBuffer = readFileSync(tempPdfPath);
    console.log('PDF buffer size:', pdfBuffer.length, 'bytes');

    // Upload PDF to Supabase Storage (bucket: pdf_surat, folder: suami-istri)
    const jenisSuratFolder = 'suami-istri';
    const fileName = `${jenisSuratFolder}/${formData.nama_suami.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

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

    // Save to database
    try {
      // 1. Save to document_archives (universal table)
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

      const alamatLengkapSuami = `${formData.alamat_suami}, RT ${formData.rt_suami}/RW ${formData.rw_suami}, ${formData.kel_suami}, ${formData.kec_suami}, ${formData.kota_suami}`;

      const dataDetail = {
        // Data Suami
        nama_suami: formData.nama_suami,
        tempat_lahir_suami: formData.tempat_lahir_suami,
        tanggal_lahir_suami: formData.tanggal_lahir_suami,
        agama_suami: formData.agama_suami,
        pekerjaan_suami: formData.pekerjaan_suami,
        negara_suami: formData.negara_suami,
        alamat_suami: alamatLengkapSuami,

        // Data Istri
        nama_istri: formData.nama_istri,
        tempat_lahir_istri: formData.tempat_lahir_istri,
        tanggal_lahir_istri: formData.tanggal_lahir_istri,
        agama_istri: formData.agama_istri,
        pekerjaan_istri: formData.pekerjaan_istri,
        negara_istri: formData.negara_istri,
        alamat_istri: `${formData.alamat_istri}, RT ${formData.rt_istri}/RW ${formData.rw_istri}, ${formData.kel_istri}, ${formData.kec_istri}, ${formData.kota_istri}`,

        // Data Pernikahan
        tanggal_pernikahan: formData.tanggal_pernikahan,
        keterangan_akta_perkawinan: formData.keterangan_akta_perkawinan,

        // Keperluan
        peruntukan: formData.peruntukan,
        pengantar_rt: formData.pengantar_rt
      };

      const archiveValues = [
        formData.nomor_surat,
        'Surat Keterangan Suami Istri',
        new Date(),
        `Surat Keterangan Suami Istri untuk ${formData.peruntukan}`,
        null, // nik_subjek (tidak ada NIK untuk pasangan)
        `${formData.nama_suami} & ${formData.nama_istri}`,
        alamatLengkapSuami,
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
    console.error('Error processing Suami Istri:', error);
    return NextResponse.json(
      {
        error: 'Failed to process Suami Istri document',
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
