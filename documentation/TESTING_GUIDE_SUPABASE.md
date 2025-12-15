# Testing Guide: Supabase Storage Integration

## 📋 Overview

Panduan lengkap untuk testing integrasi Supabase Storage dengan aplikasi Kelurahan Cibodas.

---

## ✅ Pre-requisites Checklist

Sebelum testing, pastikan semua ini sudah selesai:

- [ ] Supabase account created
- [ ] Supabase project created (region: Singapore)
- [ ] Bucket "documents" created (public)
- [ ] Bucket policies set (public read)
- [ ] Environment variables configured (.env.local)
- [ ] Database migration executed (Option 2)
- [ ] Application code updated
- [ ] Development server running

---

## 🚀 Step 1: Run Migration Script

### 1.1 Connect to Neon Database

**Option A: Using Neon Console**
1. Login ke https://console.neon.tech
2. Pilih project Anda
3. Klik **"SQL Editor"**
4. Copy paste script dari: `database/migrations/001_add_supabase_storage_columns.sql`
5. Klik **"Run"**

**Option B: Using psql CLI**
```bash
# Get connection string from Neon dashboard
psql "postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Run migration
\i database/migrations/001_add_supabase_storage_columns.sql
```

**Option C: Using DBeaver/pgAdmin**
1. Connect to Neon database
2. Open SQL Editor
3. Load file: `database/migrations/001_add_supabase_storage_columns.sql`
4. Execute

### 1.2 Verify Migration Success

Run verification query:
```sql
-- Check if columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'document_archives'
  AND column_name IN ('storage_path', 'storage_url')
ORDER BY column_name;
```

**Expected Result:**
```
column_name  | data_type | is_nullable
-------------+-----------+-------------
storage_path | text      | YES
storage_url  | text      | YES
```

✅ **Success!** Columns created.

---

## 🧪 Step 2: Test Generate Document

### 2.1 Start Development Server

```bash
# Make sure server is running
npm run dev

# Server should be at http://localhost:3000
```

### 2.2 Generate Test Document

1. **Login ke aplikasi**
   - URL: http://localhost:3000
   - Login dengan user yang punya akses

2. **Buka Form Belum Rumah**
   - Navigate: Surat Keterangan → Belum Memiliki Rumah
   - URL: http://localhost:3000/form-surat/belum-rumah

3. **Generate Sample Data**
   - Klik tombol **"✨ Generate Data Contoh"**
   - Form akan terisi otomatis

4. **Review Data**
   - Pastikan semua field terisi
   - Pastikan pejabat terpilih
   - Edit jika perlu

5. **Preview Dokumen**
   - Klik **"👁 Preview Dokumen"**
   - Redirect ke halaman preview
   - URL: http://localhost:3000/preview-belum-rumah

6. **Cetak & Selesai**
   - Review preview HTML
   - Klik **"✅ Cetak & Selesai"**
   - Confirm dialog: **OK**

7. **Wait for Processing**
   - Loading indicator muncul
   - Proses: DOCX → PDF → Upload → Save
   - Estimasi: 5-10 detik

8. **Download PDF**
   - PDF otomatis terdownload
   - Check file di folder Downloads
   - Buka PDF → Verify content

9. **Success Message**
   ```
   Dokumen Surat Keterangan Belum Memiliki Rumah berhasil dibuat!
   
   ✓ PDF telah diunduh (ConvertAPI)
   ✓ Disimpan ke Supabase Storage (GRATIS)
   ✓ Tercatat dalam database
   
   Anda dapat melihat dokumen di menu Daftar Surat.
   ```

10. **Redirect**
    - Otomatis redirect ke: http://localhost:3000/daftar-surat

### 2.3 Check Browser Console

Open DevTools (F12) → Console tab:

**Expected Logs:**
```
Generating Surat Belum Rumah with ConvertAPI...
Loading template from: /path/to/BELUMRUMAH.docx
Template Data: { ... }
DOCX Buffer size: 123456 bytes
Saving temporary DOCX file...
Converting DOCX to PDF...
Conversion successful, saving PDF...
PDF buffer obtained successfully, size: 234567 bytes
Uploaded to Supabase Storage: https://xxxxx.supabase.co/storage/v1/object/public/documents/belum-rumah/...
Saved to document_archives, ID: 123
Temporary files cleaned up
```

✅ **Success!** Document generated and saved.

---

## 🔍 Step 3: Verify Database

### 3.1 Check Latest Document

```sql
-- Get the most recent document
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  storage_path,
  storage_url,
  file_name,
  file_size,
  created_at
FROM document_archives
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
```
id  | 123
nomor_surat | 470/001/SKBMR/X/2025
jenis_dokumen | Belum Memiliki Rumah
nama_subjek | Budi Santoso
storage_path | belum-rumah/1729123456789_Budi_Santoso.pdf
storage_url | https://xxxxx.supabase.co/storage/v1/object/public/documents/belum-rumah/1729123456789_Budi_Santoso.pdf
file_name | Surat_Belum_Rumah_Budi_Santoso_1729123456789.pdf
file_size | 234567
created_at | 2025-10-15 20:03:45.123
```

### 3.2 Verify Storage URL Format

```sql
-- Check if URL is valid Supabase format
SELECT 
  id,
  nomor_surat,
  storage_url,
  CASE 
    WHEN storage_url LIKE 'https://%.supabase.co/storage/v1/object/public/documents/%' THEN '✅ Valid'
    ELSE '❌ Invalid'
  END as url_validity
FROM document_archives
WHERE id = 123;  -- Replace with actual ID
```

**Expected Result:**
```
url_validity | ✅ Valid
```

### 3.3 Test URL Accessibility

Copy `storage_url` dari database, paste di browser:

```
https://xxxxx.supabase.co/storage/v1/object/public/documents/belum-rumah/1729123456789_Budi_Santoso.pdf
```

**Expected:**
- ✅ PDF terbuka di browser
- ✅ Bisa di-download
- ✅ Content sesuai dengan data form

### 3.4 Check Supabase Dashboard

1. Login ke https://app.supabase.com
2. Pilih project Anda
3. Klik **Storage** → **documents** bucket
4. Navigate ke folder **belum-rumah/**
5. Verify file ada di list
6. Klik file → Preview
7. Check file size, upload time

✅ **Success!** Data tersimpan dengan benar.

---

## 📥 Step 4: Test Download from Daftar Surat

### 4.1 Navigate to Daftar Surat

1. Buka: http://localhost:3000/daftar-surat
2. Page load → Documents list muncul

### 4.2 Find Test Document

1. **Search** (optional):
   - Ketik nama: "Budi Santoso"
   - Atau nomor surat: "470/001/SKBMR/X/2025"

2. **Filter** (optional):
   - Filter jenis: "Belum Memiliki Rumah"

3. **Locate Document**:
   - Document card muncul di list
   - Check badge: "Belum Memiliki Rumah"
   - Check nomor surat
   - Check nama subjek

### 4.3 Test "Lihat" Button (Preview)

1. Klik tombol **"👁 Lihat"**
2. PDF terbuka di tab baru
3. Verify:
   - ✅ PDF content benar
   - ✅ Data sesuai form
   - ✅ Format rapi
   - ✅ Tanda tangan pejabat ada

### 4.4 Test "Unduh" Button (Download)

1. Klik tombol **"⬇ Unduh"**
2. PDF terdownload ke folder Downloads
3. Check file:
   - ✅ File name correct
   - ✅ File size > 0
   - ✅ Bisa dibuka
   - ✅ Content sama dengan preview

### 4.5 Check Browser Network Tab

Open DevTools (F12) → Network tab:

**Expected Requests:**
```
GET /api/documents?page=1&limit=10&search=...
Status: 200 OK
Response: { success: true, data: [...], pagination: {...} }

GET https://xxxxx.supabase.co/storage/v1/object/public/documents/belum-rumah/...
Status: 200 OK
Content-Type: application/pdf
Content-Length: 234567
```

✅ **Success!** Download works perfectly.

---

## 📊 Step 5: Monitor Usage

### 5.1 Check Supabase Storage Dashboard

1. Login: https://app.supabase.com
2. Select project
3. Go to: **Settings** → **Usage**

**Check:**
- **Storage**: X MB / 1024 MB used
- **Bandwidth**: Y MB transferred
- **API Requests**: Z requests

**Example:**
```
Storage: 2.45 MB / 1024 MB (0.24%)
Bandwidth: 5.67 MB (unlimited)
API Requests: 15 (unlimited)
```

### 5.2 Check Database Statistics

```sql
-- Storage usage by type
SELECT 
  CASE 
    WHEN storage_url IS NOT NULL THEN '✅ Supabase Storage'
    WHEN google_drive_url IS NOT NULL THEN '⚠️ Google Drive (Legacy)'
    ELSE '❌ No Storage'
  END as storage_type,
  COUNT(*) as document_count,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb
FROM document_archives
GROUP BY storage_type
ORDER BY document_count DESC;
```

**Expected Result:**
```
storage_type              | document_count | total_size_mb
--------------------------+----------------+--------------
✅ Supabase Storage       |              1 |          2.45
⚠️ Google Drive (Legacy)  |              0 |          0.00
❌ No Storage             |              0 |          0.00
```

### 5.3 Monitor Recent Activity

```sql
-- Last 10 documents
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  CASE 
    WHEN storage_url IS NOT NULL THEN '✅ Supabase'
    ELSE '❌ Other'
  END as storage,
  ROUND(file_size / 1024.0 / 1024.0, 2) as size_mb,
  created_at
FROM document_archives
ORDER BY created_at DESC
LIMIT 10;
```

### 5.4 Check Application Logs

**Terminal where `npm run dev` is running:**

Look for:
```
✓ Compiled in 123ms
✓ Ready on http://localhost:3000

POST /api/generate-belum-rumah 200 in 8456ms
Generating Surat Belum Rumah with ConvertAPI...
Uploaded to Supabase Storage: https://...
Saved to document_archives, ID: 123
```

✅ **Success!** Monitoring shows healthy system.

---

## 🎯 Complete Test Checklist

### Migration
- [ ] Migration script executed successfully
- [ ] Columns `storage_path` and `storage_url` exist
- [ ] Indexes created
- [ ] No errors in migration

### Document Generation
- [ ] Form loads correctly
- [ ] Sample data generates
- [ ] Preview shows correct data
- [ ] "Cetak & Selesai" works
- [ ] PDF downloads automatically
- [ ] Success message appears
- [ ] Redirects to Daftar Surat

### Database Verification
- [ ] Document saved in database
- [ ] `storage_path` populated correctly
- [ ] `storage_url` populated correctly
- [ ] URL format is valid Supabase URL
- [ ] File accessible via URL

### Download Testing
- [ ] Document appears in Daftar Surat
- [ ] "Lihat" button opens PDF in new tab
- [ ] "Unduh" button downloads PDF
- [ ] Downloaded PDF is valid
- [ ] Content matches form data

### Monitoring
- [ ] Supabase dashboard shows file
- [ ] Storage usage updated
- [ ] Database queries return correct data
- [ ] Application logs show success
- [ ] No errors in browser console

---

## 🐛 Troubleshooting

### Issue 1: Migration Failed

**Error:** `column "storage_path" already exists`

**Solution:**
```sql
-- Check if columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'document_archives'
  AND column_name IN ('storage_path', 'storage_url');

-- If exists, migration already done. Skip to testing.
```

### Issue 2: Upload to Supabase Failed

**Error:** `Supabase credentials not configured`

**Solution:**
```bash
# Check .env.local
cat .env.local | grep SUPABASE

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# SUPABASE_SERVICE_KEY=eyJhbGci...

# If missing, add them and restart server
npm run dev
```

### Issue 3: storage_url is NULL

**Error:** Document saved but `storage_url` is NULL

**Solution:**
```sql
-- Check recent document
SELECT id, nomor_surat, storage_path, storage_url
FROM document_archives
ORDER BY created_at DESC LIMIT 1;

-- Check application logs for upload errors
-- Verify Supabase credentials
-- Verify bucket "documents" exists and is public
```

### Issue 4: Download Not Working

**Error:** "File tidak tersedia"

**Solution:**
```sql
-- Check if URL exists
SELECT id, nomor_surat, storage_url
FROM document_archives
WHERE id = 123;

-- If storage_url is NULL, regenerate document
-- If storage_url exists, test URL in browser
-- Check Supabase bucket permissions
```

### Issue 5: PDF Not Accessible

**Error:** 403 Forbidden when accessing URL

**Solution:**
1. Check bucket is **public**
2. Check bucket policy allows **SELECT**
3. Verify URL format is correct
4. Test in incognito mode (clear cache)

---

## 📈 Performance Benchmarks

### Expected Timings:

| Operation | Expected Time | Acceptable Range |
|-----------|--------------|------------------|
| Form Load | < 1s | 0.5s - 2s |
| Generate Sample Data | < 0.1s | 0.05s - 0.5s |
| Preview Load | < 2s | 1s - 5s |
| PDF Generation (ConvertAPI) | 5-8s | 3s - 15s |
| Upload to Supabase | < 2s | 1s - 5s |
| Save to Database | < 0.5s | 0.1s - 2s |
| **Total (Cetak & Selesai)** | **8-12s** | **5s - 20s** |
| Daftar Surat Load | < 2s | 1s - 5s |
| Download PDF | < 1s | 0.5s - 3s |

### File Sizes:

| Document Type | Typical Size | Max Size |
|---------------|--------------|----------|
| Belum Rumah | 2-3 MB | 5 MB |
| SKTM | 2-4 MB | 5 MB |
| Other | 1-5 MB | 10 MB |

---

## ✅ Success Criteria

All tests pass if:

1. ✅ Migration executed without errors
2. ✅ New columns exist in database
3. ✅ Document generation completes successfully
4. ✅ PDF uploads to Supabase Storage
5. ✅ `storage_path` and `storage_url` populated
6. ✅ URL is accessible and returns valid PDF
7. ✅ Document appears in Daftar Surat
8. ✅ Download works from Daftar Surat
9. ✅ No errors in console or logs
10. ✅ Supabase dashboard shows file

---

## 🎉 Next Steps After Testing

Once all tests pass:

1. **Production Deployment**
   - Deploy to production server
   - Run migration on production database
   - Test with real users

2. **Monitoring Setup**
   - Set up alerts for storage usage
   - Monitor error rates
   - Track performance metrics

3. **Documentation**
   - Update user manual
   - Create admin guide
   - Document troubleshooting steps

4. **Training**
   - Train staff on new system
   - Provide user guide
   - Setup support channel

---

**Happy Testing! 🚀**

**Last Updated**: October 15, 2025
**Status**: ✅ Ready for Testing
