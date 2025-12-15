# Setup Supabase Storage untuk Dokumen SKTM

## Overview

Supabase Storage adalah solusi cloud storage yang **gratis** dan mudah digunakan untuk menyimpan file PDF dokumen SKTM.

**Free Tier:**
- ✅ **1GB storage gratis selamanya**
- ✅ 50GB bandwidth/bulan
- ✅ Unlimited API requests
- ✅ CDN global
- ✅ Public URL otomatis

---

## Prerequisites

- Akun Supabase (gratis)
- Email untuk verifikasi

---

## Step-by-Step Setup

### 1. Daftar Akun Supabase

1. **Buka** https://supabase.com
2. **Klik "Start your project"** atau "Sign Up"
3. **Sign up dengan:**
   - GitHub (recommended)
   - Atau email

4. **Verifikasi email** jika menggunakan email

### 2. Buat Project Baru

1. **Setelah login**, klik **"New Project"**

2. **Isi form:**
   - **Name:** `Pelayanan Kelurahan` (atau nama lain)
   - **Database Password:** Buat password kuat (simpan baik-baik!)
   - **Region:** Pilih yang terdekat (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan:** Pilih **Free** (sudah default)

3. **Klik "Create new project"**

4. **Tunggu ~2 menit** sampai project selesai dibuat

### 3. Buat Storage Bucket

1. **Di dashboard project**, klik **"Storage"** di sidebar kiri

2. **Klik "Create a new bucket"**

3. **Isi form:**
   - **Name:** `documents`
   - **Public bucket:** ✅ **Centang** (agar file bisa diakses public)
   - **File size limit:** `10 MB` (cukup untuk PDF)
   - **Allowed MIME types:** `application/pdf`

4. **Klik "Create bucket"**

### 4. Setup Bucket Policies

Agar file bisa diakses public, kita perlu set policies:

1. **Klik bucket** `documents` yang baru dibuat

2. **Klik tab "Policies"**

3. **Klik "New Policy"**

4. **Pilih template:** "Enable read access for all users"

5. **Policy akan otomatis terisi:**
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'documents' );
   ```

6. **Klik "Review"** → **"Save policy"**

### 5. Get API Keys

1. **Klik "Settings"** (⚙️) di sidebar kiri

2. **Klik "API"**

3. **Copy 2 keys:**

   **a. Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   
   **b. Service Role Key (secret):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   ⚠️ **PENTING:** Jangan share Service Role Key ke publik!

### 6. Set Environment Variables

Edit file `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace:**
- `xxxxxxxxxxxxx` dengan Project URL Anda
- `eyJhbGci...` dengan Service Role Key Anda

### 7. Restart Development Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Testing

### 1. Test Upload

1. **Buka aplikasi:** http://localhost:3000/form-surat/sktm
2. **Klik "Generate Data Contoh"**
3. **Klik "Preview"**
4. **Klik "Proses & Simpan"**
5. **PDF akan terdownload otomatis**

### 2. Verifikasi di Supabase Dashboard

1. **Buka Supabase Dashboard**
2. **Klik "Storage"** → **"documents"**
3. **File PDF harus muncul** dengan nama: `SKTM_Nama_Pemohon_timestamp.pdf`

### 3. Test Public URL

1. **Klik file** di Supabase Dashboard
2. **Copy "Public URL"**
3. **Paste di browser**
4. **PDF harus terbuka**

### 4. Test Download dari Daftar Surat

1. **Buka:** http://localhost:3000/daftar-surat
2. **Cari dokumen** yang baru dibuat
3. **Klik "Lihat"** atau **"Unduh"**
4. **File harus terbuka** di tab baru

---

## Struktur File di Supabase

```
documents/  (bucket)
├── SKTM_Budi_Santoso_1728540000000.pdf
├── SKTM_Siti_Nurhaliza_1728540123456.pdf
└── SKTM_Ahmad_Fauzi_1728540234567.pdf
```

**Format nama file:**
```
SKTM_{nama_pemohon}_{timestamp}.pdf
```

**Public URL format:**
```
https://xxxxx.supabase.co/storage/v1/object/public/documents/SKTM_xxx.pdf
```

---

## Monitoring Storage Usage

### Via Supabase Dashboard

1. **Klik "Settings"** → **"Usage"**
2. **Lihat "Storage"** section
3. **Monitor:**
   - Total storage used
   - Bandwidth used
   - Number of files

### Via Code

```typescript
import { listFilesSupabase } from '@/lib/supabaseStorage';

// List semua file
const files = await listFilesSupabase('documents');
console.log('Total files:', files.length);

// Calculate total size
const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
console.log('Total size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
```

---

## Backup & Migration

### Export Files dari Supabase

```typescript
import { downloadFromSupabase } from '@/lib/supabaseStorage';
import { writeFileSync } from 'fs';

// Download file
const buffer = await downloadFromSupabase('SKTM_xxx.pdf');

// Save to local
writeFileSync('./backup/SKTM_xxx.pdf', buffer);
```

### Bulk Download Script

```typescript
// scripts/backup-supabase.ts
import { listFilesSupabase, downloadFromSupabase } from '@/lib/supabaseStorage';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function backupAll() {
  const files = await listFilesSupabase('documents');
  const backupDir = './backup/sktm';
  
  mkdirSync(backupDir, { recursive: true });
  
  for (const file of files) {
    console.log('Downloading:', file.name);
    const buffer = await downloadFromSupabase(file.name);
    writeFileSync(join(backupDir, file.name), buffer);
  }
  
  console.log('Backup completed!');
}

backupAll();
```

---

## Troubleshooting

### Error: "Supabase credentials not configured"

**Penyebab:** Environment variables belum di-set

**Solusi:**
1. Cek file `.env.local` ada
2. Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_KEY` terisi
3. Restart development server

### Error: "Failed to upload: new row violates row-level security policy"

**Penyebab:** Bucket policy belum di-set

**Solusi:**
1. Buka Supabase Dashboard → Storage → documents
2. Tab "Policies"
3. Tambahkan policy untuk public access (lihat step 4 di atas)

### Error: "Bucket not found"

**Penyebab:** Bucket `documents` belum dibuat

**Solusi:**
1. Buka Supabase Dashboard → Storage
2. Create bucket dengan nama `documents`
3. Set sebagai public bucket

### File tidak bisa diakses via Public URL

**Penyebab:** Bucket tidak public atau policy salah

**Solusi:**
1. Pastikan bucket di-set sebagai **public**
2. Cek policies di tab "Policies"
3. Pastikan ada policy untuk SELECT (read access)

### Storage quota habis (1GB)

**Solusi:**
1. **Hapus file lama:**
   ```typescript
   import { deleteFromSupabase } from '@/lib/supabaseStorage';
   await deleteFromSupabase('old_file.pdf');
   ```

2. **Upgrade ke Pro plan** ($25/month untuk 100GB)

3. **Atau migrate ke storage lain** (Cloudinary 25GB gratis)

---

## Keamanan

### Best Practices

✅ **DO:**
- Simpan Service Role Key di `.env.local` (gitignored)
- Gunakan Service Role Key hanya di server-side
- Set file size limit di bucket (10MB)
- Set allowed MIME types (application/pdf only)
- Monitor usage secara berkala

❌ **DON'T:**
- Jangan commit Service Role Key ke git
- Jangan expose Service Role Key di client-side
- Jangan set bucket sebagai public jika berisi data sensitif

### Row Level Security (RLS)

Untuk keamanan lebih baik, aktifkan RLS:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy untuk upload (hanya authenticated users)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'documents' );

-- Policy untuk read (public)
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

-- Policy untuk delete (hanya owner atau admin)
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'documents' AND auth.uid() = owner );
### Free Tier Limits

- Storage: 1GB
- Bandwidth: 50GB/bulan
- API requests: Unlimited

### Pro Plan ($25/month)

- Storage: 100GB
- Bandwidth: 200GB/bulan
- Daily backups
- Priority support

### Jika Perlu Lebih

Alternatif dengan free tier lebih besar:
- **Cloudinary:** 25GB storage gratis
- **Backblaze B2:** 10GB storage gratis

---

## Summary

✅ **Supabase Storage** cocok untuk:
- Project dengan budget terbatas
- Storage < 1GB (ribuan dokumen PDF)
- Butuh setup cepat (< 10 menit)
- Sudah pakai PostgreSQL

✅ **Keuntungan:**
- Gratis selamanya (1GB)
- Setup mudah
- CDN global
- Public URL otomatis
- Terintegrasi dengan database

⚠️ **Perhatikan:**
- Quota 1GB (monitor usage)
- Backup manual jika perlu
- Service Role Key harus aman

---

## Support

**Dokumentasi Supabase:**
- https://supabase.com/docs/guides/storage

**Community:**
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

**Dokumentasi Project:**
- `SKTM_PREVIEW_WORKFLOW.md` - Workflow lengkap
- `LOCAL_STORAGE_SETUP.md` - Alternatif local storage

---

**Last Updated:** 2025-10-10
**Version:** 1.0.0
