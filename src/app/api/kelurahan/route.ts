import { NextRequest, NextResponse } from 'next/server';
import { KelurahanModel } from '@/lib/models/kelurahan';

// GET /api/kelurahan - Get all kelurahan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const nama = searchParams.get('nama');

    // Get specific kelurahan by ID
    if (id) {
      const kelurahan = await KelurahanModel.getById(parseInt(id));
      if (!kelurahan) {
        return NextResponse.json(
          { error: 'Kelurahan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(kelurahan);
    }

    // Get specific kelurahan by nama
    if (nama) {
      const kelurahan = await KelurahanModel.getByNama(nama);
      if (!kelurahan) {
        return NextResponse.json(
          { error: 'Kelurahan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(kelurahan);
    }

    // Get all kelurahan
    const kelurahanList = await KelurahanModel.getAll();
    return NextResponse.json(kelurahanList);
  } catch (error) {
    console.error('Error fetching kelurahan:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/kelurahan - Create new kelurahan (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['nama', 'nama_lengkap', 'alamat', 'kecamatan', 'kota', 'nama_lurah', 'nip_lurah'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    const kelurahan = await KelurahanModel.create(body);
    return NextResponse.json(kelurahan, { status: 201 });
  } catch (error) {
    console.error('Error creating kelurahan:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/kelurahan - Update kelurahan (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kelurahan ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const kelurahan = await KelurahanModel.update(parseInt(id), body);

    if (!kelurahan) {
      return NextResponse.json(
        { error: 'Kelurahan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(kelurahan);
  } catch (error) {
    console.error('Error updating kelurahan:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/kelurahan - Delete kelurahan (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kelurahan ID is required' },
        { status: 400 }
      );
    }

    const success = await KelurahanModel.delete(parseInt(id));

    if (!success) {
      return NextResponse.json(
        { error: 'Kelurahan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Kelurahan deleted successfully' });
  } catch (error) {
    console.error('Error deleting kelurahan:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
