-- ============================================================================
-- VERIFICATION & MONITORING QUERIES FOR SUPABASE STORAGE
-- ============================================================================
-- Purpose: Verify migration and monitor Supabase Storage integration
-- Date: 2025-10-15
-- ============================================================================

-- ============================================================================
-- 1. VERIFY SCHEMA CHANGES
-- ============================================================================

-- Check if new columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'document_archives'
  AND column_name IN ('storage_path', 'storage_url', 'google_drive_id', 'google_drive_url')
ORDER BY column_name;

-- Expected result: 4 rows showing all columns

-- ============================================================================
-- 2. CHECK INDEXES
-- ============================================================================

-- List all indexes on document_archives table
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'document_archives'
ORDER BY indexname;

-- ============================================================================
-- 3. COUNT DOCUMENTS BY STORAGE TYPE
-- ============================================================================

SELECT 
  CASE 
    WHEN storage_url IS NOT NULL THEN '✅ Supabase Storage'
    WHEN google_drive_url IS NOT NULL THEN '⚠️ Google Drive (Legacy)'
    ELSE '❌ No Storage'
  END as storage_type,
  COUNT(*) as document_count,
  ROUND(AVG(file_size) / 1024.0 / 1024.0, 2) as avg_size_mb,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb
FROM document_archives
GROUP BY storage_type
ORDER BY document_count DESC;

-- ============================================================================
-- 4. VIEW RECENT DOCUMENTS WITH STORAGE INFO
-- ============================================================================

SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  CASE 
    WHEN storage_url IS NOT NULL THEN '✅ Supabase'
    WHEN google_drive_url IS NOT NULL THEN '⚠️ Google Drive'
    ELSE '❌ No Storage'
  END as storage_status,
  storage_path,
  LEFT(storage_url, 50) || '...' as storage_url_preview,
  file_name,
  ROUND(file_size / 1024.0 / 1024.0, 2) as size_mb,
  created_at
FROM document_archives
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- 5. CHECK SUPABASE STORAGE DOCUMENTS ONLY
-- ============================================================================

SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  storage_path,
  storage_url,
  file_name,
  ROUND(file_size / 1024.0 / 1024.0, 2) as size_mb,
  created_at
FROM document_archives
WHERE storage_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 6. FIND DOCUMENTS WITHOUT STORAGE
-- ============================================================================

SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  file_name,
  created_at
FROM document_archives
WHERE storage_url IS NULL 
  AND google_drive_url IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 7. STORAGE USAGE BY JENIS DOKUMEN
-- ============================================================================

SELECT 
  jenis_dokumen,
  COUNT(*) as total_documents,
  COUNT(storage_url) as with_supabase,
  COUNT(google_drive_url) - COUNT(storage_url) as with_google_drive_only,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb,
  ROUND(AVG(file_size) / 1024.0 / 1024.0, 2) as avg_size_mb
FROM document_archives
GROUP BY jenis_dokumen
ORDER BY total_documents DESC;

-- ============================================================================
-- 8. STORAGE USAGE BY DATE (LAST 30 DAYS)
-- ============================================================================

SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_docs,
  COUNT(storage_url) as supabase_docs,
  COUNT(google_drive_url) - COUNT(storage_url) as google_drive_docs,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb
FROM document_archives
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================================================
-- 9. CHECK SPECIFIC DOCUMENT (Replace ID)
-- ============================================================================

-- Replace 123 with actual document ID
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  nik_subjek,
  storage_path,
  storage_url,
  google_drive_id,
  google_drive_url,
  file_name,
  file_size,
  mime_type,
  created_at,
  updated_at
FROM document_archives
WHERE id = 123;  -- Change this ID

-- ============================================================================
-- 10. VALIDATE SUPABASE URLs
-- ============================================================================

-- Check if all Supabase URLs are valid format
SELECT 
  id,
  nomor_surat,
  storage_url,
  CASE 
    WHEN storage_url LIKE 'https://%.supabase.co/storage/v1/object/public/documents/%' THEN '✅ Valid'
    ELSE '❌ Invalid'
  END as url_validity
FROM document_archives
WHERE storage_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- 11. MIGRATION PROGRESS
-- ============================================================================

-- Show migration progress (how many docs migrated to Supabase)
SELECT 
  'Total Documents' as metric,
  COUNT(*) as count
FROM document_archives
UNION ALL
SELECT 
  'With Supabase Storage' as metric,
  COUNT(*) as count
FROM document_archives
WHERE storage_url IS NOT NULL
UNION ALL
SELECT 
  'With Google Drive Only' as metric,
  COUNT(*) as count
FROM document_archives
WHERE google_drive_url IS NOT NULL AND storage_url IS NULL
UNION ALL
SELECT 
  'Without Any Storage' as metric,
  COUNT(*) as count
FROM document_archives
WHERE storage_url IS NULL AND google_drive_url IS NULL
UNION ALL
SELECT 
  'Migration Progress (%)' as metric,
  ROUND(
    (COUNT(CASE WHEN storage_url IS NOT NULL THEN 1 END)::NUMERIC / 
     NULLIF(COUNT(*), 0) * 100), 
    2
  ) as count
FROM document_archives;

-- ============================================================================
-- 12. STORAGE SIZE SUMMARY
-- ============================================================================

SELECT 
  'Total Storage Used' as metric,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) || ' MB' as value
FROM document_archives
WHERE storage_url IS NOT NULL
UNION ALL
SELECT 
  'Average File Size' as metric,
  ROUND(AVG(file_size) / 1024.0 / 1024.0, 2) || ' MB' as value
FROM document_archives
WHERE storage_url IS NOT NULL
UNION ALL
SELECT 
  'Largest File' as metric,
  ROUND(MAX(file_size) / 1024.0 / 1024.0, 2) || ' MB' as value
FROM document_archives
WHERE storage_url IS NOT NULL
UNION ALL
SELECT 
  'Smallest File' as metric,
  ROUND(MIN(file_size) / 1024.0 / 1024.0, 2) || ' MB' as value
FROM document_archives
WHERE storage_url IS NOT NULL AND file_size > 0;

-- ============================================================================
-- 13. FIND DUPLICATE FILES (Same storage_path)
-- ============================================================================

SELECT 
  storage_path,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::TEXT, ', ') as document_ids
FROM document_archives
WHERE storage_path IS NOT NULL
GROUP BY storage_path
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================================================
-- 14. RECENT ACTIVITY (Last 24 hours)
-- ============================================================================

SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  CASE 
    WHEN storage_url IS NOT NULL THEN '✅ Supabase'
    ELSE '⚠️ Other'
  END as storage,
  created_at,
  AGE(NOW(), created_at) as age
FROM document_archives
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ============================================================================
-- 15. EXPORT DATA FOR BACKUP (CSV Format)
-- ============================================================================

-- Copy this result to CSV for backup
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  tanggal_surat,
  nama_subjek,
  nik_subjek,
  storage_path,
  storage_url,
  file_name,
  file_size,
  created_at
FROM document_archives
WHERE storage_url IS NOT NULL
ORDER BY created_at DESC;

-- ============================================================================
-- END OF VERIFICATION QUERIES
-- ============================================================================

-- To run specific query, copy and paste it to your SQL client
-- Recommended: Run queries 1-4 first to verify migration success
