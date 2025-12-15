import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import db from '@/lib/db';
import { uploadToSupabase } from '@/lib/supabaseStorage';

/**
 * API untuk memproses SKTM menggunakan Puppeteer:
 * 1. Generate HTML dari template
 * 2. Convert HTML ke PDF menggunakan Puppeteer
 * 3. Upload PDF ke Supabase Storage
 * 4. Simpan metadata ke database
 * 5. Return PDF untuk download
 */
export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const body = await request.json();
    const { formData, userId } = body;

    console.log('Processing SKTM with Puppeteer...');

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
      desil: formData.desil || '',
      peruntukan: formData.peruntukan || '',
      pengantar_rt: formData.pengantar_rt || '',
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    // Generate HTML (call preview API)
    console.log('Generating HTML...');
    const htmlResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/preview-sktm-html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!htmlResponse.ok) {
      throw new Error('Failed to generate HTML');
    }

    const htmlContent = await htmlResponse.text();
    console.log('HTML generated, length:', htmlContent.length);

    // Launch Puppeteer
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    console.log('Generating PDF...');
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false, // Use format instead of CSS @page
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      scale: 1, // 100% scale
    });

    // Convert Uint8Array to Buffer
    const pdfBuffer = Buffer.from(pdfUint8Array);
    console.log('PDF generated, size:', pdfBuffer.length, 'bytes');

    // Close browser
    await browser.close();
    browser = null;

    // Upload PDF to Supabase Storage
    const fileName = `SKTM_${formData.nama_pemohon.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    
    let supabaseFileId: string | null = null;
    let supabasePublicUrl: string | null = null;
    
    try {
      const uploadResult = await uploadToSupabase(
        pdfBuffer,
        fileName,
        'documents',
        'application/pdf'
      );
      
      supabaseFileId = uploadResult.fileId;
      supabasePublicUrl = uploadResult.publicUrl;
      
      console.log('Uploaded to Supabase Storage:', supabasePublicUrl);
    } catch (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      throw new Error('Failed to upload PDF to Supabase Storage');
    }
    
    // For database compatibility
    const googleDriveId: string | null = supabaseFileId;
    const googleDriveUrl: string | null = supabasePublicUrl;

    // Save to database (both sktm_documents and document_archives)
    try {
      // 1. Save to sktm_documents (specific table)
      const insertSKTMQuery = `
        INSERT INTO sktm_documents (
          nomor_surat, tanggal_surat,
          nik_pemohon, nama_pemohon, tempat_lahir, tanggal_lahir,
          kelamin_pemohon, agama, pekerjaan, perkawinan, negara,
          alamat, rt, rw, kelurahan, kecamatan, kota_kabupaten,
          desil, peruntukan, pengantar_rt,
          pejabat_id, nama_pejabat, nip_pejabat, jabatan,
          google_drive_id, google_drive_url,
          file_name, file_size, mime_type,
          kelurahan_id, created_by, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        ) RETURNING id
      `;

      const sktmValues = [
        formData.nomor_surat,
        new Date(),
        formData.nik_pemohon,
        formData.nama_pemohon,
        formData.tempat_lahir,
        formData.tanggal_lahir ? new Date(formData.tanggal_lahir) : null,
        formData.kelamin_pemohon,
        formData.agama,
        formData.pekerjaan,
        formData.perkawinan,
        formData.negara,
        formData.alamat,
        formData.rt,
        formData.rw,
        formData.kelurahan,
        formData.kecamatan,
        formData.kota_kabupaten,
        formData.desil,
        formData.peruntukan,
        formData.pengantar_rt,
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

      const dbResult = await db.query(insertSKTMQuery, sktmValues);
      console.log('Saved to sktm_documents, ID:', dbResult.rows[0].id);

      // 2. Save to document_archives (universal table)
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
        desil: formData.desil,
        peruntukan: formData.peruntukan,
        pengantar_rt: formData.pengantar_rt
      };

      const archiveValues = [
        formData.nomor_surat,
        'SKTM',
        new Date(),
        `Surat Keterangan Tidak Mampu untuk ${formData.peruntukan}`,
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
    console.error('Error processing SKTM:', error);
    
    // Close browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process SKTM document', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
