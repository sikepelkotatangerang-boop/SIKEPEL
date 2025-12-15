# Troubleshooting: Surat Pindah Keluar - JSON Parse Error

## Error yang Terjadi
```
XHRPOST http://localhost:3000/api/process-pindah-keluar
[HTTP/1.1 500 Internal Server Error]

Error processing Pindah Keluar: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
```

## Kemungkinan Penyebab & Solusi

### 1. ❌ CONVERTAPI_SECRET Tidak Ditemukan

**Gejala:**
- Error 500 dari server
- Console log menunjukkan: "CONVERTAPI_SECRET tidak ditemukan"

**Solusi:**
1. Buka file `.env.local` di root project
2. Pastikan ada baris:
   ```env
   CONVERTAPI_SECRET=your_secret_key_here
   ```
3. Dapatkan secret key dari: https://www.convertapi.com/
4. Restart development server setelah menambahkan env variable:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### 2. ❌ Template F-103.docx Tidak Ditemukan

**Gejala:**
- Error: "Template F-103.docx tidak ditemukan"

**Solusi:**
1. Pastikan file ada di: `public/template/F-103.docx`
2. Verifikasi dengan command:
   ```bash
   ls public/template/F-103.docx
   ```
3. Jika tidak ada, copy template dari backup atau sumber asli

### 3. ❌ Supabase Credentials Salah

**Gejala:**
- Error: "Upload error" atau "Database error"

**Solusi:**
1. Verifikasi credentials di `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
2. Pastikan bucket `surat-documents` sudah dibuat di Supabase Storage
3. Pastikan table `surat` ada dengan schema yang benar

### 4. ❌ ConvertAPI Quota Habis

**Gejala:**
- Error dari ConvertAPI: "Quota exceeded" atau "Invalid secret"

**Solusi:**
1. Login ke https://www.convertapi.com/
2. Check quota yang tersisa
3. Upgrade plan jika diperlukan
4. Atau gunakan secret key yang berbeda

### 5. ❌ Network/Firewall Issues

**Gejala:**
- Timeout saat koneksi ke ConvertAPI
- Error: "Failed to fetch"

**Solusi:**
1. Check koneksi internet
2. Pastikan firewall tidak memblokir akses ke:
   - `https://v2.convertapi.com`
   - `https://your-project.supabase.co`
3. Coba disable antivirus/firewall sementara untuk testing

### 6. ❌ Form Data Tidak Lengkap

**Gejala:**
- Error: "Data form tidak ditemukan"
- Missing fields di template

**Solusi:**
1. Pastikan semua field required di form sudah diisi
2. Check sessionStorage di browser DevTools:
   ```javascript
   // Di browser console
   console.log(JSON.parse(sessionStorage.getItem('pindahKeluarFormData')))
   ```
3. Pastikan data ter-save dengan benar sebelum ke preview

## Cara Debug

### 1. Check Server Logs (Terminal)

Setelah menambahkan logging, check terminal yang menjalankan `npm run dev`:

```
📥 Received request to process-pindah-keluar
📋 Form data received: { nama_pemohon: 'John Doe', ... }
📄 Loading template F-103.docx...
✅ Template loaded successfully
🔄 Rendering document with template data...
📦 Generating DOCX buffer...
💾 Temp DOCX saved to: /tmp/pindah-keluar-1234567890.docx
🚀 Starting ConvertAPI conversion...
✅ ConvertAPI conversion successful
📥 Downloading PDF from: https://...
✅ PDF downloaded, size: 123456 bytes
☁️ Uploading to Supabase Storage...
✅ File uploaded to storage: pindah-keluar-...pdf
🔗 Public URL: https://...
💾 Saving to database...
✅ Saved to database with ID: 123
```

**Jika ada error, akan muncul emoji ❌ dengan detail error**

### 2. Check Browser Console

Buka DevTools (F12) → Console tab:

```
💾 Processing and saving document...
📤 Sending data: { nama_pemohon: 'John Doe', ... }
📥 Response status: 500 Internal Server Error
📥 Response headers: { contentType: 'application/json', ... }
❌ Error response: {"error":"..."}
```

### 3. Check Network Tab

Buka DevTools (F12) → Network tab → Klik request `process-pindah-keluar`:

- **Request Payload**: Pastikan data lengkap
- **Response**: Lihat error message detail
- **Headers**: Check Content-Type

### 4. Test ConvertAPI Secara Manual

Test apakah ConvertAPI berfungsi:

```bash
curl -X POST \
  "https://v2.convertapi.com/convert/docx/to/pdf?Secret=YOUR_SECRET" \
  -F "File=@public/template/F-103.docx"
```

Jika berhasil, akan return JSON dengan URL PDF.

### 5. Test Supabase Connection

Test koneksi ke Supabase:

```javascript
// Di browser console atau Node.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY'
);

// Test storage
const { data, error } = await supabase.storage
  .from('surat-documents')
  .list();

console.log('Storage test:', { data, error });

// Test database
const { data: dbData, error: dbError } = await supabase
  .from('surat')
  .select('*')
  .limit(1);

console.log('Database test:', { dbData, dbError });
```

## Checklist Sebelum Testing

- [ ] `.env.local` file exists dengan semua credentials
- [ ] `CONVERTAPI_SECRET` ada dan valid
- [ ] `NEXT_PUBLIC_SUPABASE_URL` benar
- [ ] `SUPABASE_SERVICE_ROLE_KEY` benar
- [ ] Template `F-103.docx` ada di `public/template/`
- [ ] Supabase bucket `surat-documents` sudah dibuat
- [ ] Supabase table `surat` sudah dibuat dengan schema benar
- [ ] Development server sudah di-restart setelah update .env
- [ ] Internet connection stabil
- [ ] ConvertAPI quota masih tersedia

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ConvertAPI
CONVERTAPI_SECRET=your_secret_key_here
```

## Supabase Setup

### 1. Create Storage Bucket

```sql
-- Di Supabase Dashboard → Storage
-- Create bucket: surat-documents
-- Public: Yes
-- File size limit: 50MB
```

### 2. Create Table

```sql
-- Di Supabase Dashboard → SQL Editor
CREATE TABLE IF NOT EXISTS surat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_surat TEXT NOT NULL,
  nomor_surat TEXT,
  nama_pemohon TEXT,
  nik_pemohon TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'draft',
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_surat_user_id ON surat(user_id);
CREATE INDEX idx_surat_jenis ON surat(jenis_surat);
CREATE INDEX idx_surat_status ON surat(status);
```

## Quick Fix Commands

```bash
# 1. Restart dev server
npm run dev

# 2. Clear Next.js cache
rm -rf .next
npm run dev

# 3. Check if template exists
ls -la public/template/F-103.docx

# 4. Check environment variables (don't expose secrets!)
# Windows PowerShell:
Get-Content .env.local | Select-String "CONVERTAPI"
Get-Content .env.local | Select-String "SUPABASE"

# 5. Test API endpoint manually
curl -X POST http://localhost:3000/api/process-pindah-keluar \
  -H "Content-Type: application/json" \
  -d '{"formData":{"nama_pemohon":"Test"},"userId":"test-user-id"}'
```

## Contact Support

Jika masalah masih berlanjut setelah mengikuti semua langkah di atas:

1. **Collect Information:**
   - Screenshot error dari browser console
   - Copy server logs dari terminal
   - Copy request/response dari Network tab
   - Environment (OS, Node version, npm version)

2. **Check Documentation:**
   - `/documentation/pindah-keluar-implementation.md`
   - ConvertAPI docs: https://www.convertapi.com/doc
   - Supabase docs: https://supabase.com/docs

3. **Create Issue:**
   - Include all collected information
   - Describe steps to reproduce
   - Expected vs actual behavior

---
**Last Updated**: 2025-01-20
**Version**: 1.0.0
