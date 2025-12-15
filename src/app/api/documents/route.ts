import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * API untuk mendapatkan daftar semua dokumen surat
 * Support filtering dan pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const jenisDokumen = searchParams.get('jenisDokumen') || '';
    const kelurahanId = searchParams.get('kelurahanId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'active';
    
    const offset = (page - 1) * limit;

    // Build query with table alias 'da' to avoid ambiguous column names
    let whereConditions = ['da.status = $1'];
    let queryParams: any[] = [status];
    let paramIndex = 2;

    if (jenisDokumen) {
      whereConditions.push(`da.jenis_dokumen = $${paramIndex}`);
      queryParams.push(jenisDokumen);
      paramIndex++;
    }

    if (kelurahanId) {
      whereConditions.push(`da.kelurahan_id = $${paramIndex}`);
      queryParams.push(parseInt(kelurahanId));
      paramIndex++;
    }

    if (userId) {
      whereConditions.push(`da.created_by = $${paramIndex}`);
      queryParams.push(parseInt(userId));
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        da.nama_subjek ILIKE $${paramIndex} OR 
        da.nik_subjek ILIKE $${paramIndex} OR 
        da.nomor_surat ILIKE $${paramIndex} OR
        da.perihal ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM document_archives da
      ${whereClause}
    `;
    
    console.log('Count Query:', countQuery);
    console.log('Query Params:', queryParams);
    
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    console.log('Total documents found:', total);

    // Get documents
    const documentsQuery = `
      SELECT 
        da.*,
        u.name as created_by_name,
        k.nama as kelurahan_nama,
        p.nama as pejabat_nama
      FROM document_archives da
      LEFT JOIN users u ON da.created_by = u.id
      LEFT JOIN kelurahan k ON da.kelurahan_id = k.id
      LEFT JOIN pejabat p ON da.pejabat_id = p.id
      ${whereClause}
      ORDER BY da.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    console.log('Documents Query:', documentsQuery);
    console.log('Final Query Params:', queryParams);
    
    const documentsResult = await db.query(documentsQuery, queryParams);

    console.log('Documents fetched:', documentsResult.rows.length);

    // Parse data_detail JSON and add compatibility fields
    const documents = documentsResult.rows.map(doc => ({
      ...doc,
      data_detail: typeof doc.data_detail === 'string' 
        ? JSON.parse(doc.data_detail) 
        : doc.data_detail,
      // Add storage_url alias for backward compatibility
      storage_url: doc.google_drive_url || doc.storage_url,
      storage_path: doc.file_name || doc.storage_path,
    }));
    
    console.log('Sample document:', documents[0] ? {
      id: documents[0].id,
      jenis_dokumen: documents[0].jenis_dokumen,
      nama_subjek: documents[0].nama_subjek,
      storage_url: documents[0].storage_url,
      google_drive_url: documents[0].google_drive_url,
    } : 'No documents');

    return NextResponse.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch documents', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * API untuk mendapatkan detail dokumen berdasarkan ID
 */
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        da.*,
        u.name as created_by_name,
        u.email as created_by_email,
        k.nama as kelurahan_nama,
        k.alamat as kelurahan_alamat,
        p.nama as pejabat_nama,
        p.nip as pejabat_nip,
        p.jabatan as pejabat_jabatan
      FROM document_archives da
      LEFT JOIN users u ON da.created_by = u.id
      LEFT JOIN kelurahan k ON da.kelurahan_id = k.id
      LEFT JOIN pejabat p ON da.pejabat_id = p.id
      WHERE da.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Parse data_detail JSON
    const document = {
      ...result.rows[0],
      data_detail: typeof result.rows[0].data_detail === 'string'
        ? JSON.parse(result.rows[0].data_detail)
        : result.rows[0].data_detail
    };

    return NextResponse.json({
      success: true,
      data: document,
    });

  } catch (error) {
    console.error('Error fetching document detail:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch document detail', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * API untuk mendapatkan statistik dokumen
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelurahanId = searchParams.get('kelurahanId');
    const userId = searchParams.get('userId');

    let whereConditions = ["status = 'active'"];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (kelurahanId) {
      whereConditions.push(`kelurahan_id = $${paramIndex}`);
      queryParams.push(parseInt(kelurahanId));
      paramIndex++;
    }

    if (userId) {
      whereConditions.push(`created_by = $${paramIndex}`);
      queryParams.push(parseInt(userId));
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const statsQuery = `
      SELECT 
        COUNT(*) as total_documents,
        COUNT(DISTINCT jenis_dokumen) as total_jenis,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_count,
        COUNT(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_count,
        COUNT(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_count
      FROM document_archives
      WHERE ${whereClause}
    `;

    const statsResult = await db.query(statsQuery, queryParams);

    // Get count per jenis dokumen
    const jenisQuery = `
      SELECT 
        jenis_dokumen,
        COUNT(*) as count
      FROM document_archives
      WHERE ${whereClause}
      GROUP BY jenis_dokumen
      ORDER BY count DESC
    `;

    const jenisResult = await db.query(jenisQuery, queryParams);

    return NextResponse.json({
      success: true,
      stats: statsResult.rows[0],
      byJenis: jenisResult.rows,
    });

  } catch (error) {
    console.error('Error fetching document stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch document stats', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
