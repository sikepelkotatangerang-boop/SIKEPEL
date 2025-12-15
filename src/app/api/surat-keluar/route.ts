import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * API untuk mendapatkan daftar Surat Keluar dari tabel documents
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const kelurahanId = searchParams.get('kelurahanId');
    const status = searchParams.get('status') || 'active';
    
    const offset = (page - 1) * limit;

    // Build query
    let whereConditions = ["jenis_dokumen = 'Surat Keluar'", 'status = $1'];
    let queryParams: any[] = [status];
    let paramIndex = 2;

    if (kelurahanId) {
      whereConditions.push(`kelurahan_id = $${paramIndex}`);
      queryParams.push(parseInt(kelurahanId));
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        nomor_surat ILIKE $${paramIndex} OR 
        perihal ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM documents
      WHERE ${whereClause}
    `;
    
    console.log('Count Query:', countQuery);
    console.log('Query Params:', queryParams);
    
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    console.log('Total Surat Keluar found:', total);

    // Get documents
    const documentsQuery = `
      SELECT 
        id,
        nomor_surat,
        jenis_dokumen,
        tanggal_surat,
        perihal,
        sifat,
        jumlah_lampiran,
        tujuan,
        storage_bucket_url,
        nama_pejabat,
        nip_pejabat,
        jabatan,
        status,
        created_at,
        updated_at
      FROM documents
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    console.log('Documents Query:', documentsQuery);
    console.log('Final Query Params:', queryParams);
    
    const documentsResult = await db.query(documentsQuery, queryParams);

    console.log('Surat Keluar fetched:', documentsResult.rows.length);

    return NextResponse.json({
      success: true,
      data: documentsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching Surat Keluar:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Surat Keluar', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
