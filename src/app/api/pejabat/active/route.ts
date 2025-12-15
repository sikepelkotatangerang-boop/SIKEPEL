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

// GET /api/pejabat/active - Get active pejabat for current user's kelurahan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const kelurahanIdParam = searchParams.get('kelurahanId'); // Optional: untuk admin yang pilih kelurahan

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    // Get user's kelurahan_id and role
    const userResult = await db.query<{ kelurahan_id: number | null; role: string }>(
      'SELECT kelurahan_id, role FROM users WHERE id = $1',
      [parseInt(userId)]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { kelurahan_id: kelurahanId, role } = userResult.rows[0];

    let pejabatResult;

    // Admin: jika ada kelurahanId dari parameter, gunakan itu (dari pilihan dashboard)
    // Jika tidak, tampilkan semua pejabat
    if (role === 'admin') {
      if (kelurahanIdParam) {
        // Admin memilih kelurahan tertentu di dashboard
        pejabatResult = await db.query<Pejabat>(
          `SELECT p.*, k.nama as kelurahan_nama
           FROM pejabat p
           LEFT JOIN kelurahan k ON p.kelurahan_id = k.id
           WHERE p.kelurahan_id = $1 AND p.is_active = true
           ORDER BY p.created_at DESC`,
          [parseInt(kelurahanIdParam)]
        );
      } else {
        // Admin tanpa pilihan kelurahan, tampilkan semua
        pejabatResult = await db.query<Pejabat>(
          `SELECT p.*, k.nama as kelurahan_nama
           FROM pejabat p
           LEFT JOIN kelurahan k ON p.kelurahan_id = k.id
           WHERE p.is_active = true
           ORDER BY k.nama ASC, p.created_at DESC`
        );
      }
    } else {
      // Staff hanya melihat pejabat dari kelurahan mereka
      if (!kelurahanId) {
        return NextResponse.json(
          { error: 'User tidak memiliki kelurahan. Hubungi admin untuk mengatur kelurahan Anda.' },
          { status: 400 }
        );
      }

      pejabatResult = await db.query<Pejabat>(
        `SELECT p.*, k.nama as kelurahan_nama
         FROM pejabat p
         LEFT JOIN kelurahan k ON p.kelurahan_id = k.id
         WHERE p.kelurahan_id = $1 AND p.is_active = true
         ORDER BY p.created_at DESC`,
        [kelurahanId]
      );
    }

    if (pejabatResult.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Tidak ada pejabat penandatangan yang terdaftar untuk kelurahan Anda. Hubungi admin untuk menambahkan data pejabat.',
          kelurahan_id: kelurahanId
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pejabat: pejabatResult.rows,
    });
  } catch (error) {
    console.error('Error fetching active pejabat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
