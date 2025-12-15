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
 * API untuk memproses Surat Pindah Keluar:
 * 1. Generate DOCX dari template F-103.docx
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

    console.log('📥 Processing Pindah Keluar for:', formData?.nama_pemohon);

    if (!formData) {
      return NextResponse.json(
        { error: 'Data form tidak ditemukan' },
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

    // Get kelurahan_id from database (like SKTM)
    let kelurahanId: number | null = null;

    if (formData.kel_asal) {
      try {
        const kelurahanResult = await db.query<{ id: number }>(
          'SELECT id FROM kelurahan WHERE LOWER(nama) = LOWER($1) LIMIT 1',
          [formData.kel_asal]
        );

        if (kelurahanResult.rows.length > 0) {
          kelurahanId = kelurahanResult.rows[0].id;
        }
      } catch (dbError) {
        console.error('Error fetching kelurahan:', dbError);
      }
    }

    // Load template F-103.docx
    console.log('📄 Loading template F-103.docx...');
    const templatePath = join(process.cwd(), 'public', 'template', 'F-103.docx');
    const content = readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function () {
        return '';
      },
    });

    // Get family members for template
    const anggotaKeluarga = formData.anggota_keluarga || [];
    const firstAnggota = anggotaKeluarga[0] || {
      no_urut: '1',
      nik: '',
      nama: '',
      shdk: '',
    };

    // Helper function untuk singkatan SHDK
    const getShdkSingkatan = (shdk: string): string => {
      const shdkMap: { [key: string]: string } = {
        'Kepala Keluarga': 'KEP-KELG',
        'Suami': 'SUAMI',
        'Istri': 'ISTRI',
        'Anak': 'ANAK',
        'Menantu': 'MENANTU',
        'Cucu': 'CUCU',
        'Orang Tua': 'ORTU',
        'Mertua': 'MERTUA',
        'Famili Lain': 'FAMILI LAIN',
        'Pembantu': 'PEMBANTU',
      };
      return shdkMap[shdk] || shdk.toUpperCase();
    };

    // OPSI: Gabungkan semua nama anggota keluarga
    // Format untuk menampilkan semua anggota dalam field terpisah
    const allNoUrutAnggota = anggotaKeluarga.map((a: any, i: number) => `${i + 1}`).join('\n');
    const allNamaAnggota = anggotaKeluarga.map((a: any) => a.nama).join('\n');
    const allNikAnggota = anggotaKeluarga.map((a: any) => a.nik).join('\n'); // Tanpa koma, pakai line break
    const allShdkAnggota = anggotaKeluarga.map((a: any) => getShdkSingkatan(a.shdk)).join('\n');

    // Helper format tanggal Indonesia
    const formatTanggal = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Prepare template data
    // Note: Template F-103.docx uses specific placeholder names
    const templateData = {
      tanggal_surat: formatTanggal(formData.tanggal_surat),
      no_kk_pemohon: formData.no_kk_pemohon || '',
      nama_pemohon: formData.nama_pemohon || '',
      nik_pemohon: formData.nik_pemohon || '',
      no_hp_pemohon: formData.no_hp_pemohon || '',
      email_pemohon: formData.email_pemohon || '',
      // Alamat asal
      alamat_asal: formData.alamat_asal || '',
      rt_asal: formData.rt_asal || '',
      rw_asal: formData.rw_asal || '',
      kel_asal: formData.kel_asal || '',
      kec_asal: formData.kec_asal || '',
      kota_asal: formData.kota_asal || '',
      provinsi_asal: formData.provinsi_asal || '',
      pos_asal: formData.pos_asal || '',
      // Alamat pindah
      no_klasifikasi_pindah: formData.no_klasifikasi_pindah || '',
      alamat_pindah: formData.alamat_pindah || '',
      rt_pindah: formData.rt_pindah || '',
      rw_pindah: formData.rw_pindah || '',
      kel_pindah: formData.kel_pindah || '',
      kec_pindah: formData.kec_pindah || '',
      'kota/kab_pindah': formData.kota_kab_pindah || '',
      provinsi_pindah: formData.provinsi_pindah || '',
      pos_pindah: formData.pos_pindah || '',
      // Jenis pindah
      no_alasan_pindah: formData.no_alasan_pindah || '',
      no_jenis_pindah: formData.no_jenis_pindah || '',
      no_anggota_pindah: formData.no_anggota_pindah || '',
      no_keluarga_pindah: formData.no_keluarga_pindah || '',

      // Anggota keluarga yang pindah
      // Template F-103 hanya punya 1 baris, ada 2 opsi:

      // OPSI 1: Tampilkan anggota pertama saja (default)
      // no_urut_anggota_pindah: firstAnggota.no_urut || '1',
      // nik_anggota_pindah: firstAnggota.nik || '',
      // nama_anggota_pindah: firstAnggota.nama || '',
      // shdk_anggota_pindah: firstAnggota.shdk || '',

      // OPSI 2: Tampilkan semua anggota (AKTIF)
      // Setiap field dipisahkan dengan line break (\n)
      no_urut_anggota_pindah: allNoUrutAnggota || firstAnggota.no_urut || '1',
      nama_anggota_pindah: allNamaAnggota || firstAnggota.nama || '',
      nik_anggota_pindah: allNikAnggota || firstAnggota.nik || '',
      shdk_anggota_pindah: allShdkAnggota || firstAnggota.shdk || '',
    };

    // Render document
    console.log('🔄 Rendering document...');
    doc.render(templateData);

    // Generate DOCX
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log('📦 DOCX generated, size:', docxBuffer.length, 'bytes');

    // Save DOCX to temporary file
    tempDocxPath = join(tmpdir(), `pindah_keluar_${Date.now()}.docx`);
    writeFileSync(tempDocxPath, docxBuffer);
    console.log('💾 Temporary DOCX saved:', tempDocxPath);

    // Convert DOCX to PDF using ConvertAPI
    console.log('🚀 Converting DOCX to PDF with ConvertAPI...');
    let convertResult;
    try {
      const convertapi = new ConvertAPI(convertApiSecret);
      convertResult = await convertapi.convert('pdf', { File: tempDocxPath }, 'docx');
      console.log('✅ ConvertAPI conversion successful');
    } catch (convertError) {
      console.error('❌ ConvertAPI conversion failed:', convertError);
      throw new Error('Failed to convert DOCX to PDF with ConvertAPI');
    }

    // Save PDF to temporary file
    tempPdfPath = join(tmpdir(), `pindah_keluar_${Date.now()}.pdf`);
    await convertResult.files[0].save(tempPdfPath);
    console.log('✅ PDF saved to temp file:', tempPdfPath);

    // Read PDF buffer
    const pdfBuffer = readFileSync(tempPdfPath);
    console.log('📄 PDF buffer size:', pdfBuffer.length, 'bytes');

    // Upload PDF to Supabase Storage (bucket: pdf_surat, folder: pindah-keluar)
    const jenisSuratFolder = 'pindah-keluar';
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

      console.log('☁️ Uploaded to Supabase Storage:', supabasePublicUrl);
    } catch (uploadError) {
      console.error('❌ Error uploading to Supabase:', uploadError);
      throw new Error('Failed to upload PDF to Supabase Storage');
    }

    // For database compatibility
    const googleDriveId: string | null = supabaseFileId;
    const googleDriveUrl: string | null = supabasePublicUrl;

    // Save to database (document_archives table)
    // HANYA SAVE JIKA CONVERTAPI BERHASIL
    console.log('💾 Saving to database...');
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
        ) RETURNING id, nomor_surat, jenis_dokumen, created_at
      `;

      const alamatAsal = `${formData.alamat_asal}, RT ${formData.rt_asal}/RW ${formData.rw_asal}, ${formData.kel_asal}, ${formData.kec_asal}, ${formData.kota_asal}`;
      const alamatTujuan = `${formData.alamat_pindah}, RT ${formData.rt_pindah}/RW ${formData.rw_pindah}, ${formData.kel_pindah}, ${formData.kec_pindah}, ${formData.kota_kab_pindah}`;

      const dataDetail = {
        no_kk_pemohon: formData.no_kk_pemohon,
        nik_pemohon: formData.nik_pemohon,
        no_hp_pemohon: formData.no_hp_pemohon,
        email_pemohon: formData.email_pemohon,
        jenis_permohonan: formData.jenis_permohonan,
        alamat_asal: alamatAsal,
        alamat_pindah: alamatTujuan,
        no_klasifikasi_pindah: formData.no_klasifikasi_pindah,
        no_alasan_pindah: formData.no_alasan_pindah,
        no_jenis_pindah: formData.no_jenis_pindah,
        no_anggota_pindah: formData.no_anggota_pindah,
        no_keluarga_pindah: formData.no_keluarga_pindah,
        anggota_keluarga: formData.anggota_keluarga, // Semua anggota tersimpan
        anggota_count: formData.anggota_keluarga?.length || 0
      };

      const archiveValues = [
        formData.nama_pemohon || '-', // nomor_surat: gunakan nama pemohon
        'Surat Pindah Keluar',
        new Date(formData.tanggal_surat || new Date()),
        `Surat Pindah Keluar - ${formData.jenis_permohonan}`,
        formData.nik_pemohon || '',
        formData.nama_pemohon || '',
        alamatAsal,
        JSON.stringify(dataDetail),
        null, // pejabat_id - Form Pindah Keluar belum ada field pejabat
        null, // nama_pejabat
        null, // nip_pejabat
        null, // jabatan_pejabat
        googleDriveId,
        googleDriveUrl,
        fileName,
        pdfBuffer.length,
        'application/pdf',
        kelurahanId || null, // kelurahan_id
        userId || null,
        'active'
      ];

      console.log('📝 Executing database insert with', archiveValues.length, 'parameters');

      const archiveResult = await db.query(insertArchiveQuery, archiveValues);
      const savedDoc = archiveResult.rows[0];

      console.log('✅ Successfully saved to database:');
      console.log('   - Document ID:', savedDoc.id);
      console.log('   - Nomor Surat:', savedDoc.nomor_surat);
      console.log('   - Jenis Dokumen:', savedDoc.jenis_dokumen);
      console.log('   - Nama Subjek:', formData.nama_pemohon);
      console.log('   - Kelurahan ID:', kelurahanId);
      console.log('   - Created At:', savedDoc.created_at);
      console.log('   - File URL:', googleDriveUrl);
      console.log('   - Anggota Keluarga:', formData.anggota_keluarga?.length || 0, 'orang');
    } catch (dbError) {
      console.error('❌ Error saving to database:', dbError);
      console.error('   - Kelurahan ID:', kelurahanId);
      console.error('   - User ID:', userId);
      // Throw error karena database save penting
      throw new Error(`Failed to save document to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName.split('/').pop()}"`,
      },
    });

  } catch (error) {
    console.error('❌ Error processing Pindah Keluar:', error);
    return NextResponse.json(
      {
        error: 'Failed to process Pindah Keluar document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temporary files
    try {
      if (tempDocxPath) unlinkSync(tempDocxPath);
      if (tempPdfPath) unlinkSync(tempPdfPath);
      console.log('🧹 Temporary files cleaned up');
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }
  }
}
