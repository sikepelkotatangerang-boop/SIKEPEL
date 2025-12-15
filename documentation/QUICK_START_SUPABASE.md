# 🚀 Quick Start: Supabase Storage Integration

## ⚡ 5-Minute Setup Guide

### Step 1: Run Migration (2 minutes)

```sql
-- Copy & paste this to Neon SQL Editor
-- File: database/migrations/001_add_supabase_storage_columns.sql

ALTER TABLE document_archives 
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS storage_url TEXT;

CREATE INDEX IF NOT EXISTS idx_document_archives_storage_url 
  ON document_archives(storage_url);

-- Verify
SELECT column_name FROM information_schema.columns
WHERE table_name = 'document_archives'
  AND column_name IN ('storage_path', 'storage_url');
```

**Expected:** 2 rows returned ✅

---

### Step 2: Test Generate Document (2 minutes)

1. **Start server**: `npm run dev`
2. **Open**: http://localhost:3000/form-surat/belum-rumah
3. **Click**: "✨ Generate Data Contoh"
4. **Click**: "👁 Preview Dokumen"
5. **Click**: "✅ Cetak & Selesai"
6. **Wait**: 5-10 seconds
7. **Check**: PDF downloaded ✅

---

### Step 3: Verify Database (30 seconds)

```sql
-- Check latest document
SELECT 
  id, nomor_surat, storage_path, storage_url
FROM document_archives
ORDER BY created_at DESC LIMIT 1;
```

**Expected:**
- `storage_path`: `belum-rumah/1729..._.pdf` ✅
- `storage_url`: `https://...supabase.co/...` ✅

---

### Step 4: Test Download (30 seconds)

1. **Open**: http://localhost:3000/daftar-surat
2. **Find**: Latest document
3. **Click**: "👁 Lihat" → PDF opens ✅
4. **Click**: "⬇ Unduh" → PDF downloads ✅

---

### Step 5: Monitor (30 seconds)

**Supabase Dashboard:**
1. Login: https://app.supabase.com
2. Go to: Storage → documents
3. Check: File exists in `belum-rumah/` folder ✅

**Database Query:**
```sql
SELECT COUNT(*) as supabase_docs
FROM document_archives
WHERE storage_url IS NOT NULL;
```

**Expected:** Count > 0 ✅

---

## 🎯 Quick Verification Checklist

- [ ] Migration executed
- [ ] Columns exist
- [ ] Document generated
- [ ] PDF downloaded
- [ ] storage_url populated
- [ ] Download works
- [ ] File in Supabase

**All checked?** ✅ **SUCCESS!**

---

## 🆘 Quick Troubleshooting

### Error: "Supabase credentials not configured"
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...

# Restart
npm run dev
```

### Error: storage_url is NULL
```sql
-- Check upload logs in terminal
-- Verify Supabase bucket "documents" is public
-- Verify bucket policy allows SELECT
```

### Error: Download not working
```sql
-- Test URL in browser
SELECT storage_url FROM document_archives ORDER BY created_at DESC LIMIT 1;
-- Copy URL → Paste in browser → Should open PDF
```

---

## 📊 Quick Stats Query

```sql
-- One query to check everything
SELECT 
  COUNT(*) as total_docs,
  COUNT(storage_url) as with_supabase,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_mb
FROM document_archives;
```

---

## 🎉 Success Indicators

✅ Migration: Columns exist
✅ Generation: PDF downloads
✅ Database: storage_url populated
✅ Download: Works from Daftar Surat
✅ Supabase: File visible in dashboard

**All green?** You're ready for production! 🚀

---

## 📚 Full Documentation

- **Setup Guide**: `SUPABASE_STORAGE_SETUP_FREE.md`
- **Migration Guide**: `DATABASE_MIGRATION_SUPABASE.md`
- **Testing Guide**: `TESTING_GUIDE_SUPABASE.md`
- **Migration Script**: `database/migrations/001_add_supabase_storage_columns.sql`
- **Verification Queries**: `database/queries/verify_supabase_storage.sql`

---

**Total Time: ~5 minutes** ⏱️
**Cost: $0/month** 💰
**Storage: 1GB free** 📦

**Happy coding! 🎉**
