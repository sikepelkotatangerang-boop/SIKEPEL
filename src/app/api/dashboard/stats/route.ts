import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelurahanId = searchParams.get('kelurahan_id');

    const whereClause = kelurahanId ? 'WHERE kelurahan_id = $1' : '';
    const params = kelurahanId ? [kelurahanId] : [];

    // Get stats from document_archives
    const statsQuery = `
      SELECT 
        COUNT(*) as total_dokumen,
        COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days') as dokumen_minggu_ini,
        COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days') as dokumen_bulan_ini,
        COUNT(DISTINCT jenis_dokumen) as jenis_dokumen
      FROM document_archives
      ${whereClause}
    `;

    const result = await db.queryOne<any>(statsQuery, params);

    const stats = {
      total_dokumen: parseInt(result?.total_dokumen || '0'),
      dokumen_minggu_ini: parseInt(result?.dokumen_minggu_ini || '0'),
      dokumen_bulan_ini: parseInt(result?.dokumen_bulan_ini || '0'),
      jenis_dokumen: parseInt(result?.jenis_dokumen || '0'),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
