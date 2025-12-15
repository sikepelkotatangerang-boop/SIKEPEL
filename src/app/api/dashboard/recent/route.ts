import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelurahanId = searchParams.get('kelurahan_id');
    const limit = searchParams.get('limit') || '10';

    const whereClause = kelurahanId ? 'WHERE da.kelurahan_id = $1' : '';
    const params = kelurahanId ? [kelurahanId, limit] : [limit];
    const limitParam = kelurahanId ? '$2' : '$1';

    // Get recent documents from document_archives
    const query = `
      SELECT 
        da.id,
        da.nomor_surat,
        da.jenis_dokumen,
        da.nama_subjek,
        da.tanggal_surat,
        da.created_at,
        k.nama as kelurahan_nama
      FROM document_archives da
      LEFT JOIN kelurahan k ON da.kelurahan_id = k.id
      ${whereClause}
      ORDER BY da.created_at DESC
      LIMIT ${limitParam}
    `;

    const result = await db.query<any>(query, params);

    return NextResponse.json({
      success: true,
      documents: result.rows,
    });
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
