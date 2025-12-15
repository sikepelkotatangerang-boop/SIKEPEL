import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * API untuk testing - cek data di database
 */
export async function GET(request: NextRequest) {
  try {
    // Test 1: Cek koneksi database
    const testQuery = await db.query('SELECT NOW()');
    
    // Test 2: Cek jumlah data di document_archives
    const countQuery = await db.query('SELECT COUNT(*) as total FROM document_archives');
    const totalDocs = countQuery.rows[0]?.total || 0;
    
    // Test 3: Ambil 5 dokumen terakhir
    const docsQuery = await db.query(`
      SELECT 
        id, nomor_surat, jenis_dokumen, nama_subjek, 
        status, created_at, file_name
      FROM document_archives 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    // Test 4: Cek status dokumen
    const statusQuery = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM document_archives 
      GROUP BY status
    `);
    
    // Test 5: Cek tabel sktm_documents
    const sktmCountQuery = await db.query('SELECT COUNT(*) as total FROM sktm_documents');
    const totalSktm = sktmCountQuery.rows[0]?.total || 0;
    
    return NextResponse.json({
      success: true,
      database_connected: true,
      current_time: testQuery.rows[0].now,
      document_archives: {
        total: totalDocs,
        recent_documents: docsQuery.rows,
        by_status: statusQuery.rows
      },
      sktm_documents: {
        total: totalSktm
      }
    });
    
  } catch (error) {
    console.error('Error testing database:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
