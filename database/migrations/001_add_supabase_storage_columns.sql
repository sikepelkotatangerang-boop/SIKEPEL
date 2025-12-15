-- Migration: Add Supabase Storage Columns to document_archives
-- Date: 2025-10-15
-- Description: Add storage_path and storage_url columns for Supabase Storage integration
-- Option: 2 (Backward Compatible - Keep Google Drive columns)

-- ============================================================================
-- STEP 1: Add new columns for Supabase Storage
-- ============================================================================

-- Add storage_path column (Supabase file path)
ALTER TABLE document_archives 
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Add storage_url column (Supabase public URL)
ALTER TABLE document_archives 
  ADD COLUMN IF NOT EXISTS storage_url TEXT;

-- ============================================================================
-- STEP 2: Add column comments for documentation
-- ============================================================================

COMMENT ON COLUMN document_archives.storage_path IS 'Supabase Storage file path (e.g., belum-rumah/1729123456789_Budi_Santoso.pdf)';
COMMENT ON COLUMN document_archives.storage_url IS 'Supabase Storage public URL for direct download';
COMMENT ON COLUMN document_archives.google_drive_id IS 'Legacy Google Drive file ID (deprecated, kept for backward compatibility)';
COMMENT ON COLUMN document_archives.google_drive_url IS 'Legacy Google Drive URL (deprecated, kept for backward compatibility)';

-- ============================================================================
-- STEP 3: Create indexes for better query performance
-- ============================================================================

-- Index for storage_url (most commonly used for downloads)
CREATE INDEX IF NOT EXISTS idx_document_archives_storage_url 
  ON document_archives(storage_url);

-- Index for storage_path (used for file management)
CREATE INDEX IF NOT EXISTS idx_document_archives_storage_path 
  ON document_archives(storage_path);

-- Composite index for common queries (jenis + created_at)
CREATE INDEX IF NOT EXISTS idx_document_archives_jenis_created 
  ON document_archives(jenis_dokumen, created_at DESC);

-- Composite index for status queries
CREATE INDEX IF NOT EXISTS idx_document_archives_status_created 
  ON document_archives(status, created_at DESC);

-- ============================================================================
-- STEP 4: Update table statistics for query optimizer
-- ============================================================================

ANALYZE document_archives;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'document_archives'
  AND column_name IN ('storage_path', 'storage_url', 'google_drive_id', 'google_drive_url')
ORDER BY column_name;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'document_archives'
  AND indexname LIKE '%storage%'
ORDER BY indexname;

-- Count existing documents
SELECT 
  COUNT(*) as total_documents,
  COUNT(storage_url) as with_supabase,
  COUNT(google_drive_url) as with_google_drive,
  COUNT(*) - COUNT(storage_url) - COUNT(google_drive_url) as without_storage
FROM document_archives;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

-- Uncomment below to rollback this migration:
/*
DROP INDEX IF EXISTS idx_document_archives_storage_url;
DROP INDEX IF EXISTS idx_document_archives_storage_path;
DROP INDEX IF EXISTS idx_document_archives_jenis_created;
DROP INDEX IF EXISTS idx_document_archives_status_created;

ALTER TABLE document_archives DROP COLUMN IF EXISTS storage_path;
ALTER TABLE document_archives DROP COLUMN IF EXISTS storage_url;

ANALYZE document_archives;
*/

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '✅ Added columns: storage_path, storage_url';
  RAISE NOTICE '✅ Created indexes for better performance';
  RAISE NOTICE '✅ Backward compatible with Google Drive columns';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Test document generation';
  RAISE NOTICE '2. Verify storage_path and storage_url are populated';
  RAISE NOTICE '3. Test download from Daftar Surat page';
END $$;
