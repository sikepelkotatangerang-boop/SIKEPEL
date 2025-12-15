import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/cookie (for now, from query param)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user with kelurahan data
    const user = await UserModel.getByIdWithKelurahan(parseInt(userId));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password hash
    const { password_hash, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
