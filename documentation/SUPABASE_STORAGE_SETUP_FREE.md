# Setup Supabase Storage (100% GRATIS)

## 🆓 Kenapa Supabase Storage?

**Supabase Storage** adalah solusi storage **100% GRATIS** untuk menyimpan PDF hasil generasi dokumen, menggantikan Google Drive yang berbayar.

### ✅ Keuntungan Supabase Storage:

1. **100% Gratis** - Free tier 1GB storage, tidak perlu bayar
2. **No Credit Card** - Tidak perlu kartu kredit untuk sign up
3. **Unlimited Bandwidth** - Tidak ada biaya bandwidth (fair use)
4. **CDN Built-in** - Akses cepat dari mana saja
5. **Public/Private URLs** - Bisa public atau private
6. **Easy Integration** - SDK JavaScript/TypeScript tersedia
7. **Automatic Backups** - Data aman dengan backup otomatis
8. **File Versioning** - Support versioning file

### 📊 Free Tier Limits:

- **Storage**: 1GB (cukup untuk ~200-500 PDF)
- **Bandwidth**: Unlimited (fair use)
- **File Upload**: Max 50MB per file
- **API Requests**: Unlimited (fair use)

---

## 🚀 Step 1: Create Supabase Account

### 1.1 Sign Up (GRATIS)

1. Buka https://supabase.com
2. Klik **"Start your project"**
3. Sign up dengan:
   - GitHub account (recommended), atau
   - Email + password
4. **TIDAK PERLU KARTU KREDIT!**

### 1.2 Create New Project

1. Klik **"New Project"**
2. Isi form:
   - **Name**: `kelurahan-cibodas` (atau nama lain)
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih **Southeast Asia (Singapore)** (terdekat dengan Indonesia)
   - **Pricing Plan**: **Free** (sudah default)
3. Klik **"Create new project"**
4. Tunggu ~2 menit untuk setup

---

## 🗂️ Step 2: Create Storage Bucket

### 2.1 Navigate to Storage

1. Di dashboard Supabase, klik **"Storage"** di sidebar kiri
2. Klik **"Create a new bucket"**

### 2.2 Create "documents" Bucket

1. Isi form:
   - **Name**: `documents`
   - **Public bucket**: ✅ **Centang** (agar PDF bisa diakses via URL)
   - **File size limit**: `10 MB` (cukup untuk PDF)
   - **Allowed MIME types**: `application/pdf`
2. Klik **"Create bucket"**

### 2.3 Set Bucket Policies (Public Access)

Agar PDF bisa diakses public:

1. Klik bucket **"documents"**
2. Klik tab **"Policies"**
3. Klik **"New Policy"**
4. Pilih template **"Allow public read access"**
5. Klik **"Review"** → **"Save policy"**

**SQL Policy (otomatis):**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );
```

---

## 🔑 Step 3: Get API Credentials

### 3.1 Get Project URL

1. Di dashboard, klik **"Settings"** (icon gear) di sidebar
2. Klik **"API"**
3. Copy **"Project URL"**
   - Format: `https://xxxxxxxxxxxxx.supabase.co`

### 3.2 Get Service Role Key

1. Masih di halaman **API Settings**
2. Scroll ke **"Project API keys"**
3. Copy **"service_role"** key (bukan anon key!)
   - ⚠️ **PENTING**: Ini adalah secret key, jangan share!

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Update `.env.local`

Tambahkan credentials Supabase ke file `.env.local`:

```env
# Supabase Configuration (GRATIS - 1GB Free Tier)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Replace dengan credentials Anda!**

### 4.2 Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

## 📁 Step 5: Folder Structure di Supabase

Buat folder structure untuk organize files:

### 5.1 Via Supabase Dashboard

1. Buka bucket **"documents"**
2. Klik **"Create folder"**
3. Buat folders:
   - `belum-rumah/` - Untuk surat belum memiliki rumah
   - `sktm/` - Untuk SKTM
   - `suami-istri/` - Untuk surat suami istri
   - `belum-menikah/` - Untuk surat belum menikah
   - `usaha/` - Untuk surat usaha
   - dll.

### 5.2 File Naming Convention

Format: `{folder}/{timestamp}_{nama_pemohon}.pdf`

Contoh:
```
belum-rumah/1729123456789_Budi_Santoso.pdf
sktm/1729123456790_Ahmad_Yani.pdf
suami-istri/1729123456791_Siti_Aminah.pdf
```

---

## 🧪 Step 6: Test Upload

### 6.1 Test via Code

File helper sudah tersedia di `src/lib/supabaseStorage.ts`:

```typescript
import { uploadToSupabase } from '@/lib/supabaseStorage';

// Upload PDF
const result = await uploadToSupabase(
  pdfBuffer,
  'belum-rumah/test.pdf',
  'documents',
  'application/pdf'
);

console.log('File ID:', result.fileId);
console.log('Public URL:', result.publicUrl);
```

### 6.2 Test via Dashboard

1. Buka bucket **"documents"**
2. Klik **"Upload file"**
3. Upload file test PDF
4. Klik file → Copy **"Public URL"**
5. Buka URL di browser → PDF harus bisa diakses

---

## 📊 Step 7: Database Schema Update

### 7.1 Update `document_archives` Table

Ganti kolom Google Drive dengan Supabase:

```sql
-- Rename columns (jika sudah ada google_drive_id/url)
ALTER TABLE document_archives 
  RENAME COLUMN google_drive_id TO storage_path;

ALTER TABLE document_archives 
  RENAME COLUMN google_drive_url TO storage_url;

-- Atau tambah kolom baru (jika belum ada)
ALTER TABLE document_archives 
  ADD COLUMN storage_path TEXT,
  ADD COLUMN storage_url TEXT;

-- Add comments
COMMENT ON COLUMN document_archives.storage_path IS 'Supabase Storage file path';
COMMENT ON COLUMN document_archives.storage_url IS 'Supabase Storage public URL';
```

### 7.2 Update Existing Records (Optional)

Jika ada data lama dengan Google Drive:

```sql
-- Set NULL untuk data lama
UPDATE document_archives 
SET storage_path = NULL, storage_url = NULL
WHERE storage_path LIKE '%drive.google.com%';
```

---

## 🔧 Step 8: Implementation

### 8.1 API Route Pattern

File: `src/app/api/generate-belum-rumah/route.ts`

```typescript
import { uploadToSupabase } from '@/lib/supabaseStorage';

// After generating PDF
const fileName = `belum-rumah/${Date.now()}_${formData.nama_pemohon.replace(/\s+/g, '_')}.pdf`;

// Upload to Supabase
const uploadResult = await uploadToSupabase(
  pdfBuffer,
  fileName,
  'documents',
  'application/pdf'
);

// Save to database
const archiveValues = [
  // ... other values
  uploadResult.fileId,    // storage_path
  uploadResult.publicUrl, // storage_url
  // ... other values
];
```

### 8.2 Download from Supabase

```typescript
import { downloadFromSupabase } from '@/lib/supabaseStorage';

// Download file
const pdfBuffer = await downloadFromSupabase(
  'belum-rumah/1729123456789_Budi_Santoso.pdf',
  'documents'
);
```

### 8.3 Delete from Supabase

```typescript
import { deleteFromSupabase } from '@/lib/supabaseStorage';

// Delete file
await deleteFromSupabase(
  'belum-rumah/1729123456789_Budi_Santoso.pdf',
  'documents'
);
```

---

## 📈 Step 9: Monitor Usage

### 9.1 Check Storage Usage

1. Dashboard Supabase → **"Settings"** → **"Usage"**
2. Lihat:
   - **Storage**: Berapa GB yang sudah dipakai
   - **Bandwidth**: Berapa bandwidth yang dipakai
   - **API Requests**: Jumlah request

### 9.2 Free Tier Limits

- **Storage**: 1GB (cukup untuk ~200-500 PDF @ 2-5MB each)
- **Bandwidth**: Unlimited (fair use)
- **Jika melebihi**: Upgrade ke Pro ($25/month) atau hapus file lama

### 9.3 Cleanup Old Files

Buat cron job untuk hapus file lama (optional):

```typescript
// Delete files older than 1 year
import { listFilesSupabase, deleteFromSupabase } from '@/lib/supabaseStorage';

const files = await listFilesSupabase('documents', 'belum-rumah');
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

for (const file of files) {
  if (new Date(file.created_at) < oneYearAgo) {
    await deleteFromSupabase(file.name, 'documents');
  }
}
```

---

## 🔒 Step 10: Security Best Practices

### 10.1 Environment Variables

✅ **DO:**
- Simpan `SUPABASE_SERVICE_KEY` di `.env.local`
- Jangan commit `.env.local` ke Git
- Use `.env.example` untuk template

❌ **DON'T:**
- Jangan hardcode API key di code
- Jangan share service_role key
- Jangan commit ke public repository

### 10.2 Bucket Policies

```sql
-- Allow public read (untuk PDF yang bisa diakses siapa saja)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

-- Allow authenticated upload (hanya user login yang bisa upload)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated' 
);

-- Allow authenticated delete (hanya user login yang bisa delete)
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated' 
);
```

### 10.3 File Validation

```typescript
// Validate file size (max 10MB)
if (pdfBuffer.length > 10 * 1024 * 1024) {
  throw new Error('File too large (max 10MB)');
}

// Validate MIME type
if (contentType !== 'application/pdf') {
  throw new Error('Only PDF files allowed');
}
```

---

## 🆚 Comparison: Supabase vs Google Drive

| Feature | Supabase Storage | Google Drive API |
|---------|------------------|------------------|
| **Harga** | ✅ GRATIS (1GB) | ❌ Bayar ($1.99/100GB) |
| **Setup** | ✅ Mudah (5 menit) | ⚠️ Complex (OAuth, Service Account) |
| **Credit Card** | ✅ Tidak perlu | ❌ Perlu untuk billing |
| **Bandwidth** | ✅ Unlimited (fair use) | ⚠️ Limited |
| **CDN** | ✅ Built-in | ❌ Tidak ada |
| **Public URL** | ✅ Langsung | ⚠️ Perlu permission |
| **API Calls** | ✅ Unlimited (fair use) | ⚠️ Limited quota |
| **Integration** | ✅ Simple SDK | ⚠️ Complex OAuth |
| **Backup** | ✅ Automatic | ⚠️ Manual |
| **Versioning** | ✅ Support | ✅ Support |

**Winner: 🏆 Supabase Storage** - Lebih mudah, gratis, dan reliable!

---

## 🎯 Quick Start Checklist

- [ ] Sign up Supabase (gratis, no CC)
- [ ] Create project (region: Singapore)
- [ ] Create bucket "documents" (public)
- [ ] Set bucket policy (public read)
- [ ] Copy Project URL
- [ ] Copy Service Role Key
- [ ] Update `.env.local`
- [ ] Restart dev server
- [ ] Create folders (belum-rumah, sktm, dll)
- [ ] Test upload via dashboard
- [ ] Test upload via code
- [ ] Update database schema
- [ ] Deploy & test production

---

## 📞 Troubleshooting

### Error: "Supabase credentials not configured"

**Solution:**
```bash
# Check .env.local
cat .env.local | grep SUPABASE

# Pastikan ada:
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJhbGci...

# Restart server
npm run dev
```

### Error: "Failed to upload to Supabase"

**Solution:**
1. Check bucket exists: Dashboard → Storage → "documents"
2. Check bucket is public: Policies → "Public Access"
3. Check API key valid: Settings → API
4. Check file size < 10MB

### Error: "Policy violation"

**Solution:**
```sql
-- Add public read policy
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );
```

### Files not accessible

**Solution:**
1. Bucket harus **public**
2. Policy harus allow **SELECT**
3. URL format: `https://xxxxx.supabase.co/storage/v1/object/public/documents/file.pdf`

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs/guides/storage
- **Storage API**: https://supabase.com/docs/reference/javascript/storage
- **Pricing**: https://supabase.com/pricing (Free tier: 1GB)
- **Dashboard**: https://app.supabase.com

---

## 🎉 Summary

**Supabase Storage adalah solusi GRATIS terbaik untuk menyimpan PDF:**

✅ **100% Gratis** - 1GB storage, unlimited bandwidth
✅ **No Credit Card** - Tidak perlu CC untuk sign up
✅ **Easy Setup** - 5 menit setup, langsung jalan
✅ **Production Ready** - Reliable, scalable, dengan CDN
✅ **Simple API** - SDK JavaScript/TypeScript mudah dipakai

**Total Cost: $0/month** 💰

**Kapasitas: ~200-500 PDF** (tergantung ukuran)

**Perfect untuk project Kelurahan Cibodas!** 🏆

---

**Last Updated**: October 15, 2025
**Status**: ✅ Implemented & Tested
