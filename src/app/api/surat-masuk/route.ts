import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { uploadToSupabase } from '@/lib/supabaseStorage';

/**
 * GET - Fetch list of surat masuk
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const kelurahanId = searchParams.get('kelurahanId');
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;

    // Build query
    let whereConditions = ['1=1'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (kelurahanId) {
      whereConditions.push(`kelurahan_id = $${paramIndex}`);
      queryParams.push(parseInt(kelurahanId));
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        nomor_surat ILIKE $${paramIndex} OR 
        asal_surat ILIKE $${paramIndex} OR
        perihal ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM surat_masuk
      WHERE ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get documents
    const documentsQuery = `
      SELECT 
        id,
        nomor_surat,
        tanggal_masuk,
        tanggal_surat,
        asal_surat,
        perihal,
        disposisi,
        file_url,
        file_name,
        status,
        created_at
      FROM surat_masuk
      WHERE ${whereClause}
      ORDER BY tanggal_masuk DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const documentsResult = await db.query(documentsQuery, queryParams);

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
    console.error('Error fetching surat masuk:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch surat masuk', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new surat masuk
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const nomor_surat = formData.get('nomor_surat') as string;
    const tanggal_masuk = formData.get('tanggal_masuk') as string;
    const tanggal_surat = formData.get('tanggal_surat') as string;
    const asal_surat = formData.get('asal_surat') as string;
    const perihal = formData.get('perihal') as string;
    const disposisi = formData.get('disposisi') as string || null;
    const kelurahanId = formData.get('kelurahanId') as string;
    const userId = formData.get('userId') as string;
    const file = formData.get('file') as File | null;

    console.log('='.repeat(80));
    console.log('📥 Creating Surat Masuk...');
    console.log('Nomor Surat:', nomor_surat);
    console.log('Asal Surat:', asal_surat);
    console.log('Has File:', !!file);
    console.log('='.repeat(80));

    // Validate required fields
    if (!nomor_surat || !tanggal_masuk || !tanggal_surat || !asal_surat || !perihal) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;

    // Upload file to Supabase if provided
    if (file) {
      try {
        console.log('Uploading file to Supabase...');
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('File type:', file.type);

        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `surat-masuk/${nomor_surat.replace(/\//g, '_')}_${timestamp}_${sanitizedFileName}`;

        const uploadResult = await uploadToSupabase(
          buffer,
          storagePath,
          'pdf_surat',
          file.type
        );

        fileUrl = uploadResult.publicUrl;
        fileName = file.name;
        fileSize = file.size;

        console.log('✅ File uploaded:', fileUrl);
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Gagal upload file' },
          { status: 500 }
        );
      }
    }

    // Save to database
    console.log('Saving to database...');
    const insertQuery = `
      INSERT INTO surat_masuk (
        nomor_surat, tanggal_masuk, tanggal_surat, asal_surat, perihal, disposisi,
        file_url, file_name, file_size,
        kelurahan_id, created_by, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING id
    `;

    const values = [
      nomor_surat,
      new Date(tanggal_masuk),
      new Date(tanggal_surat),
      asal_surat,
      perihal,
      disposisi,
      fileUrl,
      fileName,
      fileSize,
      kelurahanId ? parseInt(kelurahanId) : null,
      userId ? parseInt(userId) : null,
      'pending'
    ];

    const result = await db.query(insertQuery, values);
    const savedId = result.rows[0].id;

    console.log('='.repeat(80));
    console.log('✅ SURAT MASUK SAVED SUCCESSFULLY');
    console.log('ID:', savedId);
    console.log('Nomor Surat:', nomor_surat);
    console.log('File URL:', fileUrl || 'No file');
    console.log('='.repeat(80));

    return NextResponse.json({
      success: true,
      message: 'Surat masuk berhasil ditambahkan',
      data: {
        id: savedId,
        nomor_surat,
        file_url: fileUrl,
      },
    });

  } catch (error) {
    console.error('='.repeat(80));
    console.error('❌ ERROR CREATING SURAT MASUK');
    console.error('Error:', error);
    console.error('='.repeat(80));
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal menambahkan surat masuk', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
