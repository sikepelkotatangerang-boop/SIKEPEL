# Setup Guide: SKTM Preview & Storage System

Panduan lengkap untuk setup sistem preview dan penyimpanan dokumen SKTM.

## Prerequisites

- Node.js 18+ dan npm
- PostgreSQL database
- ConvertAPI account (free tier available)
- Google Cloud Project dengan Drive API enabled
- Service Account untuk Google Drive

## Step-by-Step Setup

### 1. Install Dependencies

Dependencies sudah ada di `package.json`, pastikan sudah terinstall:

```bash
npm install
```

Packages yang digunakan:
- `convertapi` - Untuk konversi DOCX ke PDF
- `googleapis` - Untuk integrasi Google Drive
- `docxtemplater` - Untuk generate DOCX dari template
- `pizzip` - Untuk handle ZIP (DOCX)
- `puppeteer` - Untuk rendering HTML (optional)

### 2. Setup Database

#### a. Jalankan Migrasi

```bash
node scripts/migrate-sktm-documents.js
```

Script ini akan:
- Membuat tabel `sktm_documents`
- Membuat indexes untuk performa
- Membuat triggers untuk auto-update
- Membuat full-text search support

#### b. Verifikasi Tabel

```sql
-- Connect ke database
psql -h your-host -U your-user -d your-database

-- Cek tabel
\dt sktm_documents

-- Cek struktur
\d sktm_documents

-- Test query
SELECT COUNT(*) FROM sktm_documents;
```

### 3. Setup ConvertAPI

#### a. Daftar Akun

1. Buka https://www.convertapi.com/a/signup
2. Daftar dengan email (gratis)
3. Verifikasi email
4. Login ke dashboard

#### b. Get API Secret

1. Buka https://www.convertapi.com/a
2. Copy "Secret" dari dashboard
3. Free tier: 250 conversions/month

#### c. Set Environment Variable

Edit `.env.local`:

```bash
CONVERTAPI_SECRET=your_secret_here_from_dashboard
```

### 4. Setup Google Drive

#### a. Create Google Cloud Project

1. Buka https://console.cloud.google.com/
2. Klik "Select a project" → "New Project"
3. Nama project: "Kelurahan Pelayanan"
4. Klik "Create"

#### b. Enable Google Drive API

1. Di project yang baru dibuat
2. Buka "APIs & Services" → "Library"
3. Cari "Google Drive API"
4. Klik "Enable"

#### c. Create Service Account

1. Buka "APIs & Services" → "Credentials"
2. Klik "Create Credentials" → "Service Account"
3. Nama: "sktm-uploader"
4. Role: "Editor" atau "Owner"
5. Klik "Done"

#### d. Generate Key

1. Klik service account yang baru dibuat
2. Tab "Keys"
3. "Add Key" → "Create new key"
4. Type: JSON
5. Download file JSON

#### e. Set Environment Variable

File JSON yang didownload berisi:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "sktm-uploader@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**PENTING:** Konversi ke single line string untuk .env

Edit `.env.local`:

```bash
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
```

**Cara mudah konversi:**
```bash
# Linux/Mac
cat service-account-key.json | jq -c . | sed 's/"/\\"/g'

# Atau manual: copy semua isi JSON, hilangkan line breaks, escape double quotes
```

#### f. Create Drive Folder (Optional)

1. Buka Google Drive
2. Buat folder baru: "SKTM Documents"
3. Klik kanan folder → "Share"
4. Share dengan email service account (dari JSON: `client_email`)
5. Role: "Editor"
6. Copy Folder ID dari URL:
   ```
   https://drive.google.com/drive/folders/1abc...xyz
                                            ↑ ini folder ID
   ```

Edit `.env.local`:

```bash
GOOGLE_DRIVE_FOLDER_ID=1abc...xyz
```

### 5. Verify Environment Variables

File `.env.local` lengkap:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# ConvertAPI
CONVERTAPI_SECRET=abc123...

# Google Drive
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
GOOGLE_DRIVE_FOLDER_ID=1abc...xyz
```

### 6. Test Setup

#### a. Test Database Connection

```bash
node scripts/test-db.js
```

Atau buat file test sederhana:

```javascript
// test-sktm-db.js
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const result = await pool.query('SELECT COUNT(*) FROM sktm_documents');
  console.log('✅ Database OK, documents count:', result.rows[0].count);
  await pool.end();
}

test().catch(console.error);
```

```bash
node test-sktm-db.js
```

#### b. Test ConvertAPI

Buat file test:

```javascript
// test-convertapi.js
const ConvertAPI = require('convertapi');
require('dotenv').config({ path: '.env.local' });

async function test() {
  if (!process.env.CONVERTAPI_SECRET) {
    console.error('❌ CONVERTAPI_SECRET not set');
    return;
  }
  
  console.log('✅ ConvertAPI Secret configured');
  console.log('Secret:', process.env.CONVERTAPI_SECRET.substring(0, 10) + '...');
  
  // Test dengan file dummy (optional)
  // const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);
  // const result = await convertapi.convert('pdf', { File: 'test.docx' }, 'docx');
}

test().catch(console.error);
```

```bash
node test-convertapi.js
```

#### c. Test Google Drive

Buat file test:

```javascript
// test-google-drive.js
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function test() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY not set');
    return;
  }
  
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log('✅ Service Account Key parsed');
    console.log('Email:', credentials.client_email);
    console.log('Project:', credentials.project_id);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Test list files
    const response = await drive.files.list({ pageSize: 1 });
    console.log('✅ Google Drive API connected');
    console.log('Files accessible:', response.data.files?.length || 0);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test().catch(console.error);
```

```bash
node test-google-drive.js
```

### 7. Start Development Server

```bash
npm run dev
```

Buka browser: http://localhost:3000

### 8. Test Complete Workflow

#### a. Test Form Input

1. Login sebagai staff/admin
2. Buka: http://localhost:3000/form-surat/sktm
3. Klik "Generate Data Contoh"
4. Verifikasi semua field terisi
5. Klik "Preview"

#### b. Test Preview

1. Halaman preview harus muncul
2. Verifikasi data tampil dengan benar
3. Watermark "PREVIEW" harus terlihat
4. Test tombol "Edit Data" (kembali ke form)
5. Test tombol "Proses & Simpan"

#### c. Test Process & Save

1. Klik "Proses & Simpan"
2. Tunggu proses (loading indicator)
3. Verifikasi:
   - PDF terdownload otomatis
   - Alert sukses muncul
   - Redirect ke halaman riwayat

#### d. Test Riwayat Dokumen

1. Buka: http://localhost:3000/sktm-documents
2. Verifikasi dokumen muncul di list
3. Test search
4. Test download dari Google Drive
5. Test "Lihat di Drive"

### 9. Verify Google Drive

1. Buka Google Drive
2. Cek folder "SKTM Documents" (atau root jika tidak set folder)
3. Verifikasi file PDF ada
4. Coba download manual
5. Cek file size dan isi

### 10. Verify Database

```sql
-- Cek data tersimpan
SELECT 
  id, 
  nomor_surat, 
  nama_pemohon, 
  google_drive_id,
  created_at
FROM sktm_documents
ORDER BY created_at DESC
LIMIT 5;

-- Cek file info
SELECT 
  file_name,
  file_size,
  google_drive_url
FROM sktm_documents
WHERE google_drive_id IS NOT NULL;
```

## Troubleshooting

### Error: "Cannot find module 'googleapis'"

```bash
npm install googleapis
```

### Error: "GOOGLE_SERVICE_ACCOUNT_KEY not configured"

- Cek file `.env.local` ada
- Cek format JSON valid (gunakan JSON validator)
- Cek tidak ada line breaks di dalam string
- Restart development server

### Error: "ConvertAPI: Invalid secret"

- Cek secret di dashboard ConvertAPI
- Cek tidak ada spasi atau karakter tambahan
- Cek quota belum habis (250/month free tier)

### Error: "Permission denied" di Google Drive

- Cek folder sudah di-share dengan service account email
- Cek role minimal "Editor"
- Cek Google Drive API sudah enabled

### Preview tidak muncul

- Cek browser console untuk error
- Cek sessionStorage ada data
- Cek API endpoint `/api/preview-sktm-html` response
- Clear browser cache

### PDF tidak terdownload

- Cek browser setting allow downloads
- Cek popup blocker
- Cek console untuk error
- Cek file size tidak terlalu besar

## Production Deployment

### Environment Variables

Set di production environment:

```bash
DATABASE_URL=postgresql://...
CONVERTAPI_SECRET=...
GOOGLE_SERVICE_ACCOUNT_KEY='...'
GOOGLE_DRIVE_FOLDER_ID=...
```

### Security Checklist

- [ ] Service account key tidak di-commit ke git
- [ ] .env.local di .gitignore
- [ ] Database connection encrypted (SSL)
- [ ] API endpoints protected by authentication
- [ ] File upload size limited
- [ ] Rate limiting enabled

### Monitoring

- Monitor ConvertAPI usage (dashboard)
- Monitor Google Drive storage
- Monitor database size
- Log all errors to monitoring service

## Support

Jika ada masalah:

1. Cek log di console
2. Cek dokumentasi lengkap di `SKTM_PREVIEW_WORKFLOW.md`
3. Hubungi tim development

---

**Last Updated:** 2025-10-10
