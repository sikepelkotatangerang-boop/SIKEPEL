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
 * API untuk memproses Formulir KTP:
 * 1. Generate DOCX dari template PENGANTARKTP.docx
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

    console.log('Processing Formulir KTP for user:', userId);
    console.log('Form data received:', JSON.stringify(formData, null, 2));

    // Validasi data pemohon
    if (!formData.nama || !formData.nik || !formData.nomor_kk) {
      return NextResponse.json(
        { error: 'Data pemohon tidak lengkap. Mohon isi semua field yang diperlukan.' },
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

    // Get kelurahan ID from user (for database storage)
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

    // Load the template
    const templatePath = join(process.cwd(), 'public', 'template', 'PENGANTARKTP.docx');
    console.log('Template path:', templatePath);

    let content;
    try {
      content = readFileSync(templatePath, 'binary');
      console.log('Template loaded successfully, size:', content.length);
    } catch (fileError) {
      console.error('Error reading template file:', fileError);
      return NextResponse.json(
        { error: 'Template file PENGANTARKTP.docx tidak ditemukan. Hubungi administrator.' },
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

    // Prepare data for template (sesuai placeholder template PENGANTARKTP.docx)
    // Convert nama to uppercase
    const namaUpperCase = (formData.nama || '').toUpperCase();

    const templateData = {
      nama: namaUpperCase,
      nik: formData.nik || '',
      nomor_kk: formData.nomor_kk || '',
      nomor_handphone: formData.nomor_handphone || '',
      email: formData.email || '',
    };

    console.log('Template data prepared:', JSON.stringify(templateData, null, 2));

    // Set the template data
    doc.setData(templateData);

    try {
      doc.render();
    } catch (error) {
      console.error('Error rendering template:', error);
      return NextResponse.json(
        {
          error: 'Gagal mengisi template. Pastikan semua placeholder di template sesuai dengan data form.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Generate DOCX buffer
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Save DOCX to temp file
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    tempDocxPath = join(tmpdir(), `pengantar_ktp_${timestamp}_${randomStr}.docx`);
    writeFileSync(tempDocxPath, docxBuffer);
    console.log('DOCX saved to:', tempDocxPath);

    // Convert DOCX to PDF using ConvertAPI
    console.log('Converting DOCX to PDF with ConvertAPI...');
    const convertapi = new ConvertAPI(convertApiSecret);

    let pdfBuffer: Buffer;
    try {
      const result = await convertapi.convert('pdf', {
        File: tempDocxPath,
      }, 'docx');

      // Save PDF to temp file first
      tempPdfPath = join(tmpdir(), `pengantar_ktp_${timestamp}.pdf`);
      await result.files[0].save(tempPdfPath);
      pdfBuffer = readFileSync(tempPdfPath);
      console.log('PDF generated successfully, size:', pdfBuffer.length);
    } catch (convertError) {
      console.error('ConvertAPI error:', convertError);
      return NextResponse.json(
        {
          error: 'Gagal mengkonversi dokumen ke PDF. Silakan coba lagi.',
          details: convertError instanceof Error ? convertError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Upload PDF to Supabase Storage
    console.log('Uploading PDF to Supabase Storage...');
    const fileName = `pengantar_ktp_${formData.nama?.replace(/\s+/g, '_') || 'document'}_${timestamp}.pdf`;
    const filePath = `pengantar-ktp/${fileName}`;

    let uploadResult: { fileId: string; publicUrl: string };
    try {
      uploadResult = await uploadToSupabase(pdfBuffer, filePath);
      console.log('PDF uploaded to Supabase:', uploadResult.publicUrl);
    } catch (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        {
          error: 'Gagal mengupload dokumen ke storage. Silakan coba lagi.',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Save to database
    console.log('Saving to database...');
    try {
      const insertArchiveQuery = `
        INSERT INTO document_archives (
          nomor_surat, jenis_dokumen, tanggal_surat, perihal,
          nik_subjek, nama_subjek, alamat_subjek,
          data_detail,
          google_drive_id, google_drive_url,
          file_name, file_size, mime_type,
          kelurahan_id, created_by, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING id
      `;

      const dataDetail = {
        nomor_kk: formData.nomor_kk,
        nomor_handphone: formData.nomor_handphone,
        email: formData.email
      };

      const archiveValues = [
        'F-1.02', // Nomor formulir standar
        'Formulir KTP',
        new Date(),
        'Formulir Permohonan KTP',
        formData.nik || '',
        namaUpperCase, // Use uppercase nama
        '', // alamat_subjek - tidak ada di form
        JSON.stringify(dataDetail),
        null, // google_drive_id (using Supabase now)
        uploadResult.publicUrl, // google_drive_url (repurposed for Supabase URL)
        fileName,
        pdfBuffer.length,
        'application/pdf',
        kelurahanId,
        userId || null,
        'active'
      ];

      const archiveResult = await db.query(insertArchiveQuery, archiveValues);
      console.log('Document saved to database successfully, ID:', archiveResult.rows[0].id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Gagal menyimpan data ke database. Silakan coba lagi.',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Clean up temp files
    if (tempDocxPath) {
      try {
        unlinkSync(tempDocxPath);
        console.log('Temp DOCX file deleted');
      } catch (cleanupError) {
        console.error('Error deleting temp DOCX:', cleanupError);
      }
    }

    // Return PDF for download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error processing Pengantar KTP:', error);

    // Clean up temp files on error
    if (tempDocxPath) {
      try {
        unlinkSync(tempDocxPath);
      } catch (cleanupError) {
        console.error('Error deleting temp DOCX:', cleanupError);
      }
    }

    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat memproses dokumen',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
