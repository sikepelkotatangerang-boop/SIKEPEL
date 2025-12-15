# Database Migration: Google Drive → Supabase Storage

## 📋 Overview

Dokumen ini menjelaskan cara migrasi database dari Google Drive ke Supabase Storage untuk menyimpan link PDF dokumen.

---

## 🔄 Schema Changes

### Before (Google Drive):
```sql
CREATE TABLE document_archives (
  ...
  google_drive_id TEXT,
  google_drive_url TEXT,
  ...
);
```

### After (Supabase Storage):
```sql
CREATE TABLE document_archives (
  ...
  storage_path TEXT,      -- Supabase Storage file path
  storage_url TEXT,       -- Supabase Storage public URL
  google_drive_id TEXT,   -- Legacy (untuk backward compatibility)
  google_drive_url TEXT,  -- Legacy (untuk backward compatibility)
  ...
);
```

---

## 📝 Migration Script

### Option 1: Rename Existing Columns (Recommended)

Jika Anda ingin mengganti Google Drive dengan Supabase Storage sepenuhnya:

```sql
-- Step 1: Rename columns
ALTER TABLE document_archives 
  RENAME COLUMN google_drive_id TO storage_path;

ALTER TABLE document_archives 
  RENAME COLUMN google_drive_url TO storage_url;

-- Step 2: Add comments
COMMENT ON COLUMN document_archives.storage_path IS 'Supabase Storage file path (e.g., belum-rumah/1729123456789_Budi_Santoso.pdf)';
COMMENT ON COLUMN document_archives.storage_url IS 'Supabase Storage public URL (e.g., https://xxxxx.supabase.co/storage/v1/object/public/documents/...)';

-- Step 3: Update existing data (set NULL untuk data lama)
UPDATE document_archives 
SET storage_path = NULL, storage_url = NULL
WHERE storage_url LIKE '%drive.google.com%';

-- Step 4: Verify
SELECT 
  id, 
  nomor_surat, 
  storage_path, 
  storage_url,
  file_name
FROM document_archives 
ORDER BY created_at DESC 
LIMIT 10;
```

### Option 2: Add New Columns (Backward Compatible)

Jika Anda ingin keep Google Drive data dan tambah Supabase Storage:

```sql
-- Step 1: Add new columns
ALTER TABLE document_archives 
  ADD COLUMN storage_path TEXT,
  ADD COLUMN storage_url TEXT;

-- Step 2: Add comments
COMMENT ON COLUMN document_archives.storage_path IS 'Supabase Storage file path';
COMMENT ON COLUMN document_archives.storage_url IS 'Supabase Storage public URL';
COMMENT ON COLUMN document_archives.google_drive_id IS 'Legacy Google Drive file ID (deprecated)';
COMMENT ON COLUMN document_archives.google_drive_url IS 'Legacy Google Drive URL (deprecated)';

-- Step 3: Create index for faster queries
CREATE INDEX idx_document_archives_storage_url ON document_archives(storage_url);
CREATE INDEX idx_document_archives_storage_path ON document_archives(storage_path);

-- Step 4: Verify
SELECT 
  id, 
  nomor_surat, 
  storage_path, 
  storage_url,
  google_drive_id,
  google_drive_url,
  file_name
FROM document_archives 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🔍 Verify Migration

### Check Column Exists:
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'document_archives'
  AND column_name IN ('storage_path', 'storage_url', 'google_drive_id', 'google_drive_url')
ORDER BY column_name;
```

### Check Data:
```sql
-- Count documents with Supabase Storage
SELECT COUNT(*) as supabase_count
FROM document_archives
WHERE storage_url IS NOT NULL;

-- Count documents with Google Drive (legacy)
SELECT COUNT(*) as google_drive_count
FROM document_archives
WHERE google_drive_url IS NOT NULL 
  AND storage_url IS NULL;

-- Count documents without any storage
SELECT COUNT(*) as no_storage_count
FROM document_archives
WHERE storage_url IS NULL 
  AND google_drive_url IS NULL;
```

### Sample Data:
```sql
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  storage_path,
  storage_url,
  file_name,
  created_at
FROM document_archives
WHERE storage_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📊 Data Format

### storage_path Format:
```
{jenis-surat}/{timestamp}_{nama_pemohon}.pdf
```

**Examples:**
```
belum-rumah/1729123456789_Budi_Santoso.pdf
sktm/1729123456790_Ahmad_Yani.pdf
suami-istri/1729123456791_Siti_Aminah.pdf
belum-menikah/1729123456792_Dewi_Lestari.pdf
usaha/1729123456793_Joko_Widodo.pdf
```

### storage_url Format:
```
https://{project-id}.supabase.co/storage/v1/object/public/documents/{storage_path}
```

**Example:**
```
https://abcdefghijklmnop.supabase.co/storage/v1/object/public/documents/belum-rumah/1729123456789_Budi_Santoso.pdf
```

---

## 🔄 Rollback Plan

Jika ada masalah, Anda bisa rollback:

### Option 1 Rollback (Rename Back):
```sql
-- Rollback: Rename back to Google Drive
ALTER TABLE document_archives 
  RENAME COLUMN storage_path TO google_drive_id;

ALTER TABLE document_archives 
  RENAME COLUMN storage_url TO google_drive_url;
```

### Option 2 Rollback (Drop New Columns):
```sql
-- Rollback: Drop new columns
ALTER TABLE document_archives 
  DROP COLUMN storage_path,
  DROP COLUMN storage_url;
```

---

## 🧪 Testing

### 1. Test Insert New Document:
```sql
-- Insert test document with Supabase Storage
INSERT INTO document_archives (
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nik_subjek, nama_subjek, alamat_subjek,
  storage_path, storage_url,
  file_name, file_size, mime_type,
  status, created_at
) VALUES (
  '470/TEST/001/X/2025',
  'Test Document',
  CURRENT_DATE,
  'Test Supabase Storage Integration',
  '3201234567890123',
  'Test User',
  'Jl. Test No. 123',
  'test/1729123456789_Test_User.pdf',
  'https://xxxxx.supabase.co/storage/v1/object/public/documents/test/1729123456789_Test_User.pdf',
  'test_1729123456789.pdf',
  123456,
  'application/pdf',
  'active',
  NOW()
) RETURNING id, nomor_surat, storage_path, storage_url;
```

### 2. Test Query:
```sql
-- Query test document
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  storage_path,
  storage_url,
  file_name
FROM document_archives
WHERE nomor_surat = '470/TEST/001/X/2025';
```

### 3. Test Update:
```sql
-- Update test document
UPDATE document_archives
SET storage_url = 'https://xxxxx.supabase.co/storage/v1/object/public/documents/test/updated.pdf'
WHERE nomor_surat = '470/TEST/001/X/2025'
RETURNING id, storage_url;
```

### 4. Test Delete:
```sql
-- Delete test document
DELETE FROM document_archives
WHERE nomor_surat = '470/TEST/001/X/2025';
```

---

## 📈 Performance Optimization

### Add Indexes:
```sql
-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_document_archives_storage_url 
  ON document_archives(storage_url);

CREATE INDEX IF NOT EXISTS idx_document_archives_storage_path 
  ON document_archives(storage_path);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_document_archives_jenis_created 
  ON document_archives(jenis_dokumen, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_archives_status_created 
  ON document_archives(status, created_at DESC);
```

### Analyze Table:
```sql
-- Update statistics for query planner
ANALYZE document_archives;
```

---

## 🔒 Security

### Row Level Security (RLS):

Jika menggunakan Supabase Database (bukan Neon):

```sql
-- Enable RLS
ALTER TABLE document_archives ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY "Users can view own documents"
  ON document_archives
  FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON document_archives
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Admins can see all documents
CREATE POLICY "Admins can view all documents"
  ON document_archives
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

---

## 📝 Application Code Changes

### API Route (Already Updated):
```typescript
// src/app/api/generate-belum-rumah/route.ts
const archiveValues = [
  // ...
  supabaseFileId,    // storage_path
  supabasePublicUrl, // storage_url
  // ...
];
```

### Frontend (Already Updated):
```typescript
// src/app/daftar-surat/page.tsx
interface Document {
  // ...
  storage_path: string | null;
  storage_url: string | null;
  // ...
}

// Download handler
const handleDownload = async (doc: Document) => {
  if (doc.storage_url) {
    // Download from Supabase Storage
    window.open(doc.storage_url, '_blank');
  }
};
```

---

## 🎯 Migration Checklist

- [ ] **Backup Database** - Export current data
- [ ] **Run Migration Script** - Option 1 or Option 2
- [ ] **Verify Schema** - Check columns exist
- [ ] **Test Insert** - Insert test document
- [ ] **Test Query** - Query test document
- [ ] **Test Download** - Download from Supabase URL
- [ ] **Update Application** - Deploy new code
- [ ] **Test End-to-End** - Full workflow test
- [ ] **Monitor Logs** - Check for errors
- [ ] **Clean Up** - Delete test data

---

## 📊 Monitoring

### Check Storage Usage:
```sql
-- Count documents by storage type
SELECT 
  CASE 
    WHEN storage_url IS NOT NULL THEN 'Supabase Storage'
    WHEN google_drive_url IS NOT NULL THEN 'Google Drive (Legacy)'
    ELSE 'No Storage'
  END as storage_type,
  COUNT(*) as count,
  ROUND(AVG(file_size) / 1024.0 / 1024.0, 2) as avg_size_mb,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb
FROM document_archives
GROUP BY storage_type
ORDER BY count DESC;
```

### Check Recent Documents:
```sql
-- Recent documents with storage info
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
  file_name,
  ROUND(file_size / 1024.0 / 1024.0, 2) as size_mb,
  created_at
FROM document_archives
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🆘 Troubleshooting

### Issue: Column not found
**Solution:**
```sql
-- Check if columns exist
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'document_archives';
```

### Issue: NULL values in storage_url
**Solution:**
```sql
-- Check documents without storage
SELECT id, nomor_surat, jenis_dokumen, created_at
FROM document_archives
WHERE storage_url IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

### Issue: Invalid URL format
**Solution:**
```sql
-- Find invalid URLs
SELECT id, nomor_surat, storage_url
FROM document_archives
WHERE storage_url IS NOT NULL
  AND storage_url NOT LIKE 'https://%supabase.co%'
LIMIT 10;
```

---

## 📚 References

- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **PostgreSQL ALTER TABLE**: https://www.postgresql.org/docs/current/sql-altertable.html
- **Neon Database**: https://neon.tech/docs

---

## ✅ Summary

**Migration Steps:**
1. ✅ Backup database
2. ✅ Run migration script (Option 1 or 2)
3. ✅ Verify schema changes
4. ✅ Test with sample data
5. ✅ Deploy application code
6. ✅ Monitor and verify

**Result:**
- ✅ Database schema updated
- ✅ Supabase Storage integrated
- ✅ Backward compatible with Google Drive (Option 2)
- ✅ Ready for production

**Cost Savings:**
- Google Drive: $1.99+/month
- Supabase Storage: $0/month (1GB free)
- **Savings: $24-60/year** 💰

---

**Last Updated**: October 15, 2025
**Status**: ✅ Ready for Migration
