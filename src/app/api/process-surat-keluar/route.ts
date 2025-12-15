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
 * API untuk memproses Surat Keluar:
 * 1. Generate DOCX dari template SURATKELUAR.docx
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

    console.log('='.repeat(80));
    console.log('🚀 Processing Surat Keluar with ConvertAPI...');
    console.log('User ID:', userId);
    console.log('Nomor Surat:', formData.nomor_surat);
    console.log('Perihal:', formData.perihal);
    console.log('='.repeat(80));

    // Validasi data
    if (!formData.nomor_surat || !formData.perihal) {
      return NextResponse.json(
        { error: 'Data surat tidak lengkap' },
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

    // Determine which template to use based on data_acara
    const hasDataAcara = formData.data_acara && formData.data_acara.trim() !== '';
    const templateFileName = hasDataAcara ? 'SURATKELUARACARA.docx' : 'SURATKELUAR.docx';
    const templatePath = join(process.cwd(), 'public', 'template', templateFileName);

    console.log('Data acara filled:', hasDataAcara);
    console.log('Using template:', templateFileName);
    console.log('Template path:', templatePath);

    let content;
    try {
      content = readFileSync(templatePath, 'binary');
      console.log(`Template ${templateFileName} loaded successfully, size:`, content.length);
    } catch (fileError) {
      console.error('Error reading template file:', fileError);
      return NextResponse.json(
        { error: `Template file ${templateFileName} tidak ditemukan. Hubungi administrator.` },
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

    const tanggalSurat = formatTanggal(formData.tanggal_surat || new Date().toISOString());

    // Kelurahan in uppercase
    const kelurahanUpper = (formData.kelurahan || 'Cibodas').toUpperCase();

    // Determine jabatan display logic
    // If jabatan = "LURAH" → {jabatan} = empty, {jabatan_detail} = "LURAH"
    // If jabatan = other → {jabatan} = "a.n LURAH", {jabatan_detail} = actual jabatan
    const isLurah = formData.jabatan?.toLowerCase().includes('lurah') &&
      !formData.jabatan?.toLowerCase().includes('sekretaris') &&
      !formData.jabatan?.toLowerCase().includes('camat');
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : (formData.jabatan || '');

    // Format tujuan with numbering if multiple recipients
    let tujuanFormatted = formData.tujuan || '';
    if (tujuanFormatted) {
      const tujuanList = tujuanFormatted.split('\n').filter((t: string) => t.trim() !== '');
      if (tujuanList.length > 1) {
        // Multiple recipients - add numbering
        tujuanFormatted = tujuanList.map((t: string, i: number) => `${i + 1}. ${t.trim()}`).join('\n');
      }
      // Single recipient - no numbering needed
    }

    // Prepare data for template
    // SURATKELUAR.docx uses {data_acara} (combined string) - 15 placeholders
    // SURATKELUARACARA.docx uses {hari_acara}, {tanggal_acara}, {waktu_acara}, {tempat_acara} (separate fields) - 18 placeholders
    const templateData: any = {
      nomor_surat: formData.nomor_surat || '',
      tanggal_surat: tanggalSurat,
      perihal: formData.perihal || '',
      sifat: formData.sifat || 'Biasa',
      jumlah_lampiran: formData.jumlah_lampiran || '0',
      tujuan: tujuanFormatted,
      isi_surat: formData.isi_surat || '',
      akhiran: formData.akhiran || 'Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
      kelurahan: kelurahanUpper,
      alamat_kelurahan: formData.alamat_kelurahan || '',
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    // Add template-specific fields
    if (hasDataAcara) {
      // SURATKELUARACARA.docx - separate fields (18 placeholders total)
      templateData.hari_acara = formData.hari_acara || '';
      templateData.tanggal_acara = formData.tanggal_acara ? formatTanggal(formData.tanggal_acara) : '';
      templateData.waktu_acara = formData.waktu_acara || '';
      templateData.tempat_acara = formData.tempat_acara || '';
    } else {
      // SURATKELUAR.docx - combined data_acara field (15 placeholders total)
      templateData.data_acara = formData.data_acara || '';
    }

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
    tempDocxPath = join(tmpdir(), `surat_keluar_${Date.now()}.docx`);
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
      tempPdfPath = join(tmpdir(), `surat_keluar_${Date.now()}.pdf`);
      await convertResult.file.save(tempPdfPath);
      console.log('PDF generated with ConvertAPI:', tempPdfPath);
    } catch (convertError) {
      console.error('ConvertAPI error:', convertError);
      throw new Error(`ConvertAPI failed: ${convertError instanceof Error ? convertError.message : 'Unknown error'}`);
    }

    // Read PDF buffer
    const pdfBuffer = readFileSync(tempPdfPath);
    console.log('PDF buffer size:', pdfBuffer.length, 'bytes');

    // Upload to Supabase Storage
    const jenisSuratFolder = 'surat-keluar';
    const fileName = `${jenisSuratFolder}/${formData.nomor_surat.replace(/\//g, '_')}_${Date.now()}.pdf`;
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

    // Save to database (documents table)
    console.log('Saving to documents table...');
    console.log('Kelurahan ID:', kelurahanId);
    console.log('User ID:', userId);

    const insertDocumentQuery = `
      INSERT INTO documents (
        nomor_surat, jenis_dokumen, tanggal_surat, perihal,
        sifat, jumlah_lampiran, tujuan, isi_surat, akhiran,
        hari_acara, tanggal_acara, waktu_acara, tempat_acara, data_acara,
        nama_pejabat, nip_pejabat, jabatan,
        storage_bucket_url, file_name, file_size, mime_type,
        kelurahan_id, created_by, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      ) RETURNING id
    `;

    const documentValues = [
      formData.nomor_surat,
      'Surat Keluar',
      new Date(formData.tanggal_surat),
      formData.perihal,
      formData.sifat || 'Biasa',
      parseInt(formData.jumlah_lampiran || '0'),
      tujuanFormatted,  // Use formatted tujuan with numbering
      formData.isi_surat || '',
      formData.akhiran || '',
      formData.hari_acara || null,
      formData.tanggal_acara || null,
      formData.waktu_acara || null,
      formData.tempat_acara || null,
      formData.data_acara || null,
      formData.nama_pejabat,
      formData.nip_pejabat,
      formData.jabatan,
      supabasePublicUrl,
      fileName,
      pdfBuffer.length,
      'application/pdf',
      kelurahanId,
      userId || null,
      'active'
    ];

    console.log('Document values:', documentValues);

    let savedDocumentId: number | null = null;
    try {
      const documentResult = await db.query(insertDocumentQuery, documentValues);
      savedDocumentId = documentResult.rows[0].id;
      console.log('✅ Successfully saved to documents table, ID:', savedDocumentId);
      console.log('='.repeat(80));
      console.log('✅ SURAT KELUAR PROCESSING COMPLETE');
      console.log('Document ID:', savedDocumentId);
      console.log('Nomor Surat:', formData.nomor_surat);
      console.log('Storage Bucket URL:', supabasePublicUrl);
      console.log('='.repeat(80));
    } catch (dbError) {
      console.error('='.repeat(80));
      console.error('❌ DATABASE SAVE ERROR');
      console.error('Error:', dbError);
      console.error('Error details:', dbError instanceof Error ? dbError.message : 'Unknown error');
      console.error('⚠️ Document was uploaded to Supabase but NOT saved to database!');
      console.error('Storage Bucket URL:', supabasePublicUrl);
      console.error('='.repeat(80));
      // Don't throw error, but log it clearly
    }

    // Return PDF
    console.log('📄 Returning PDF to client...');
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Document-Id': savedDocumentId?.toString() || 'not-saved',
        'X-Supabase-Url': supabasePublicUrl || '',
      },
    });

  } catch (error) {
    console.error('Error processing Surat Keluar:', error);

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
