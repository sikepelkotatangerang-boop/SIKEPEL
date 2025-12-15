import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    // Test query
    const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
    
    // Count tables
    const kelurahanCount = await db.query('SELECT COUNT(*) FROM kelurahan');
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const documentsCount = await db.query('SELECT COUNT(*) FROM documents');

    return NextResponse.json({
      success: true,
      message: '✅ Database connected successfully!',
      data: {
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].pg_version,
        tables: {
          kelurahan: kelurahanCount.rows[0].count,
          users: usersCount.rows[0].count,
          documents: documentsCount.rows[0].count,
        }
      }
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '❌ Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
