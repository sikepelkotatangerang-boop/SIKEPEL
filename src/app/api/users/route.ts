import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import bcrypt from 'bcrypt';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin check from session
    const users = await UserModel.getAll();
    
    // Remove password hashes from response
    const usersWithoutPassword = users.map(({ password_hash, ...user }) => user);
    
    return NextResponse.json({
      success: true,
      users: usersWithoutPassword,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, kelurahan_id } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await UserModel.getByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await UserModel.create({
      email,
      password_hash,
      name,
      role,
      kelurahan_id: kelurahan_id || null,
    });

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = newUser;

    return NextResponse.json({
      success: true,
      user: userResponse,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/users?id=1 - Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, kelurahan_id, is_active } = body;

    // Check if user exists
    const existingUser = await UserModel.getById(parseInt(id));
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (kelurahan_id !== undefined) updateData.kelurahan_id = kelurahan_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Hash new password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await UserModel.update(parseInt(id), updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users?id=1 - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Soft delete (set is_active = false)
    const success = await UserModel.delete(parseInt(id));

    if (!success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
