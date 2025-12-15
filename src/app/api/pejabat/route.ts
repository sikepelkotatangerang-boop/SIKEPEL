import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface Pejabat {
  id: number;
  kelurahan_id: number;
  nama: string;
  nip: string | null;
  jabatan: string;
  is_active: boolean;
  created_at: Date;
}

// GET /api/pejabat - Get all pejabat or by kelurahan_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelurahanId = searchParams.get('kelurahan_id');

    let query = `
      SELECT p.*, k.nama as kelurahan_nama
      FROM pejabat p
      LEFT JOIN kelurahan k ON p.kelurahan_id = k.id
      WHERE p.is_active = true
    `;
    const params: any[] = [];

    if (kelurahanId) {
      query += ' AND p.kelurahan_id = $1';
      params.push(parseInt(kelurahanId));
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query<Pejabat>(query, params);

    return NextResponse.json({
      success: true,
      pejabat: result.rows,
    });
  } catch (error) {
    console.error('Error fetching pejabat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/pejabat - Create new pejabat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kelurahan_id, nama, nip, jabatan } = body;

    // Validate
    if (!kelurahan_id || !nama || !jabatan) {
      return NextResponse.json(
        { error: 'kelurahan_id, nama, and jabatan are required' },
        { status: 400 }
      );
    }

    const result = await db.query<Pejabat>(
      `INSERT INTO pejabat (kelurahan_id, nama, nip, jabatan)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [kelurahan_id, nama, nip || null, jabatan]
    );

    return NextResponse.json({
      success: true,
      pejabat: result.rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pejabat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/pejabat?id=1 - Update pejabat
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Pejabat ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nama, nip, jabatan, is_active } = body;

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (nama !== undefined) {
      updates.push(`nama = $${paramIndex++}`);
      params.push(nama);
    }
    if (nip !== undefined) {
      updates.push(`nip = $${paramIndex++}`);
      params.push(nip || null);
    }
    if (jabatan !== undefined) {
      updates.push(`jabatan = $${paramIndex++}`);
      params.push(jabatan);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(parseInt(id));
    const result = await db.query<Pejabat>(
      `UPDATE pejabat 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pejabat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pejabat: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating pejabat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/pejabat?id=1 - Delete pejabat (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Pejabat ID required' },
        { status: 400 }
      );
    }

    const result = await db.query(
      'UPDATE pejabat SET is_active = false WHERE id = $1',
      [parseInt(id)]
    );

    if ((result.rowCount || 0) === 0) {
      return NextResponse.json(
        { error: 'Pejabat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pejabat deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pejabat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
