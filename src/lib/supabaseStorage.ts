import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Storage Helper
 * Untuk upload, download, dan manage file di Supabase Storage
 */

// Initialize Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local');
  }

  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Upload file ke Supabase Storage
 * @param fileBuffer - Buffer dari file
 * @param fileName - Nama file
 * @param bucketName - Nama bucket (default: 'documents')
 * @param contentType - MIME type (default: 'application/pdf')
 * @returns Object dengan fileId dan publicUrl
 */
export async function uploadToSupabase(
  fileBuffer: Buffer,
  fileName: string,
  bucketName: string = 'documents',
  contentType: string = 'application/pdf'
): Promise<{ fileId: string; publicUrl: string }> {
  try {
    const supabase = getSupabaseClient();

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: contentType,
        upsert: false, // Jangan overwrite jika sudah ada
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log('Uploaded to Supabase Storage:', publicUrl);

    return {
      fileId: data.path, // Path di Supabase Storage
      publicUrl: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw new Error(`Failed to upload to Supabase Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download file dari Supabase Storage
 * @param fileName - Nama file
 * @param bucketName - Nama bucket (default: 'documents')
 * @returns Buffer dari file
 */
export async function downloadFromSupabase(
  fileName: string,
  bucketName: string = 'documents'
): Promise<Buffer> {
  try {
    const supabase = getSupabaseClient();

    console.log('Downloading from Supabase:', { fileName, bucketName });

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      console.error('Supabase download error:', error);
      throw new Error(`Failed to download from Supabase: ${JSON.stringify(error)}`);
    }

    if (!data) {
      throw new Error('No data returned from Supabase download');
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('Downloaded successfully, size:', buffer.length, 'bytes');
    return buffer;
  } catch (error) {
    console.error('Error downloading from Supabase:', error);
    throw new Error(`Failed to download from Supabase Storage: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
}

/**
 * Delete file dari Supabase Storage
 * @param fileName - Nama file
 * @param bucketName - Nama bucket (default: 'documents')
 */
export async function deleteFromSupabase(
  fileName: string,
  bucketName: string = 'documents'
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw new Error(`Failed to delete from Supabase: ${error.message}`);
    }

    console.log('Deleted from Supabase Storage:', fileName);
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    throw new Error(`Failed to delete from Supabase Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file metadata dari Supabase Storage
 * @param fileName - Nama file
 * @param bucketName - Nama bucket (default: 'documents')
 */
export async function getFileMetadataSupabase(
  fileName: string,
  bucketName: string = 'documents'
) {
  try {
    const supabase = getSupabaseClient();

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      name: fileName,
      publicUrl: publicUrl,
      bucket: bucketName,
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List semua file di bucket
 * @param bucketName - Nama bucket (default: 'documents')
 * @param folder - Folder path (optional)
 */
export async function listFilesSupabase(
  bucketName: string = 'documents',
  folder?: string
) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create bucket jika belum ada
 * @param bucketName - Nama bucket
 * @param isPublic - Apakah bucket public (default: true)
 */
export async function createBucketIfNotExists(
  bucketName: string = 'documents',
  isPublic: boolean = true
) {
  try {
    const supabase = getSupabaseClient();

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (!bucketExists) {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf'],
      });

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`);
      }

      console.log('Created bucket:', bucketName);
      return data;
    }

    console.log('Bucket already exists:', bucketName);
    return null;
  } catch (error) {
    console.error('Error creating bucket:', error);
    throw new Error(`Failed to create bucket: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
