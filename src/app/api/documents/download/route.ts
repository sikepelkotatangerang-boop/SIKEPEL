import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API untuk download file PDF dari Supabase Storage
 * Menggunakan public URL redirect untuk bucket public
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const bucket = searchParams.get('bucket') || 'documents';

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'fileName parameter is required' },
        { status: 400 }
      );
    }

    console.log('Download request:', { fileName, bucket });

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);

    // Redirect to public URL
    return NextResponse.redirect(publicUrl, 302);

  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to download file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
