import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Test API untuk cek data Surat Keluar di database
 */
export async function GET() {
  try {
    // Query langsung tanpa filter kompleks
    const query = `
      SELECT 
        id,
        nomor_surat,
        jenis_dokumen,
        tanggal_surat,
        perihal,
        status,
        kelurahan_id,
        created_by,
        created_at,
        google_drive_url
      FROM document_archives
      WHERE jenis_dokumen = 'Surat Keluar'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const result = await db.query(query);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      documents: result.rows,
      message: result.rows.length === 0 
        ? 'Tidak ada data Surat Keluar di database' 
        : `Ditemukan ${result.rows.length} dokumen Surat Keluar`
    });

  } catch (error) {
    console.error('Test query error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
