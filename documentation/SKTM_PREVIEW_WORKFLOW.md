# Dokumentasi: Workflow Preview dan Penyimpanan Dokumen SKTM

## Overview

Sistem ini mengimplementasikan workflow lengkap untuk pembuatan dokumen SKTM dengan fitur:
1. **Preview Dokumen** menggunakan HTML rendering
2. **Validasi Data** sebelum finalisasi
3. **Konversi DOCX ke PDF** menggunakan ConvertAPI
4. **Upload ke Google Drive** untuk backup cloud
5. **Penyimpanan ke Database** untuk riwayat dan cetak ulang
6. **Cetak Ulang** dari riwayat dokumen

## Arsitektur Sistem

```
┌─────────────────┐
│   Form SKTM     │
│  (Input Data)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Preview Page    │
│ (HTML Preview)  │
└────┬───────┬────┘
     │       │
  Edit│      │Confirm
     │       ▼
     │  ┌─────────────────┐
     │  │ Process API     │
     │  │ 1. Gen DOCX     │
     │  │ 2. Convert PDF  │
     │  │ 3. Upload Drive │
     │  │ 4. Save to DB   │
     │  └────────┬────────┘
     │           │
     │           ▼
     │  ┌─────────────────┐
     │  │ Download PDF    │
     │  └─────────────────┘
     │
     └──────────┐
                ▼
       ┌─────────────────┐
       │ Riwayat Dokumen │
       │ (Cetak Ulang)   │
       └─────────────────┘
```

## Komponen Sistem

### 1. Database Schema

**Tabel: `sktm_documents`**

Menyimpan semua data dokumen SKTM yang telah dibuat.

```sql
CREATE TABLE sktm_documents (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(100) NOT NULL UNIQUE,
  tanggal_surat DATE NOT NULL,
  
  -- Data Pemohon
  nik_pemohon VARCHAR(16) NOT NULL,
  nama_pemohon VARCHAR(150) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  kelamin_pemohon VARCHAR(20),
  agama VARCHAR(50),
  pekerjaan VARCHAR(100),
  perkawinan VARCHAR(50),
  negara VARCHAR(50) DEFAULT 'Indonesia',
  
  -- Alamat
  alamat TEXT,
  rt VARCHAR(5),
  rw VARCHAR(5),
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  kota_kabupaten VARCHAR(100),
  
  -- Data Ekonomi & Keperluan
  desil VARCHAR(100),
  peruntukan TEXT,
  pengantar_rt VARCHAR(100),
  
  -- Data Pejabat
  pejabat_id INTEGER REFERENCES pejabat(id),
  nama_pejabat VARCHAR(150),
  nip_pejabat VARCHAR(30),
  jabatan VARCHAR(100),
  
  -- File Information
  google_drive_id VARCHAR(255),
  google_drive_url TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  
  -- Metadata
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Migrasi Database:**
```bash
psql -h your-host -U your-user -d your-database -f database/migration_sktm_documents.sql
```

### 2. API Endpoints

#### a. Preview HTML (`/api/preview-sktm-html`)

**Method:** POST

**Request Body:**
```json
{
  "nomor_surat": "470/001/SKTM/X/2025",
  "nama_pemohon": "Budi Santoso",
  "nik_pemohon": "3201234567890123",
  "tempat_lahir": "Bandung",
  "tanggal_lahir": "1985-05-15",
  "kelamin_pemohon": "Laki-laki",
  "agama": "Islam",
  "pekerjaan": "Buruh Harian Lepas",
  "perkawinan": "Kawin",
  "negara": "Indonesia",
  "alamat": "Jl. Merdeka No. 123",
  "rt": "003",
  "rw": "005",
  "kelurahan": "Cibodas",
  "kecamatan": "Cibodas",
  "kota_kabupaten": "Kota Tangerang",
  "desil": "Desil 1 (Sangat Miskin)",
  "peruntukan": "Berobat di Rumah Sakit",
  "pengantar_rt": "001/RT.003/RW.005/X/2025",
  "nama_pejabat": "Drs. H. Ahmad Suryadi, M.Si",
  "nip_pejabat": "196501011990031001",
  "jabatan": "Lurah Cibodas"
}
```

**Response:** HTML content untuk preview

#### b. Process SKTM (`/api/process-sktm`)

**Method:** POST

**Request Body:**
```json
{
  "formData": { /* sama seperti di atas */ },
  "userId": 1
}
```

**Response:** PDF file (binary)

**Proses:**
1. Generate DOCX dari template
2. Convert DOCX ke PDF menggunakan ConvertAPI
3. Upload PDF ke Google Drive
4. Simpan metadata ke database
5. Return PDF untuk download

#### c. Get Documents (`/api/sktm-documents`)

**Method:** GET

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah per halaman (default: 10)
- `search`: Pencarian (nomor surat, nama, NIK)
- `kelurahanId`: Filter by kelurahan
- `userId`: Filter by user
- `status`: Filter by status (default: active)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nomor_surat": "470/001/SKTM/X/2025",
      "tanggal_surat": "2025-10-10",
      "nama_pemohon": "Budi Santoso",
      "nik_pemohon": "3201234567890123",
      "kelurahan": "Cibodas",
      "peruntukan": "Berobat di Rumah Sakit",
      "google_drive_id": "1abc...",
      "google_drive_url": "https://drive.google.com/file/d/1abc.../view",
      "file_name": "SKTM_Budi_Santoso_1728540000000.pdf",
      "created_at": "2025-10-10T09:00:00Z",
      "created_by_name": "Admin User",
      "kelurahan_nama": "Cibodas",
      "pejabat_nama": "Drs. H. Ahmad Suryadi, M.Si"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 3. Frontend Pages

#### a. Form SKTM (`/form-surat/sktm`)

**File:** `src/app/form-surat/sktm/page.tsx`

**Fitur:**
- Input data pemohon lengkap
- Auto-fill data kelurahan dari user login
- Pilih pejabat penandatangan dari database
- Generate data contoh untuk testing
- Validasi form
- Redirect ke preview sebelum submit

**Flow:**
1. User mengisi form
2. Klik "Preview" → simpan data ke sessionStorage
3. Redirect ke `/preview-sktm`

#### b. Preview SKTM (`/preview-sktm`)

**File:** `src/app/preview-sktm/page.tsx`

**Fitur:**
- Menampilkan preview HTML dokumen
- Tombol "Edit Data" untuk kembali ke form
- Tombol "Proses & Simpan" untuk finalisasi
- Loading state saat memproses

**Flow:**
1. Load data dari sessionStorage
2. Call API `/api/preview-sktm-html` untuk generate HTML
3. Tampilkan dalam iframe
4. Jika user klik "Proses & Simpan":
   - Call API `/api/process-sktm`
   - Download PDF
   - Clear sessionStorage
   - Redirect ke `/sktm-documents`

#### c. Riwayat Dokumen (`/sktm-documents`)

**File:** `src/app/sktm-documents/page.tsx`

**Fitur:**
- List semua dokumen SKTM yang sudah dibuat
- Search by nomor surat, nama, atau NIK
- Filter by kelurahan (untuk staff)
- Pagination
- Download PDF dari Google Drive
- View di Google Drive

### 4. Google Drive Integration

**File:** `src/lib/googleDrive.ts`

**Setup:**

1. **Buat Service Account di Google Cloud Console:**
   - Buka https://console.cloud.google.com/
   - Pilih/buat project
   - Enable Google Drive API
   - Buat Service Account
   - Download JSON key

2. **Set Environment Variable:**
   ```bash
   GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   ```

3. **Share Folder (Optional):**
   - Buat folder di Google Drive
   - Share dengan email service account
   - Copy folder ID dari URL
   - Set `GOOGLE_DRIVE_FOLDER_ID`

**Functions:**
- `uploadToGoogleDrive()` - Upload file ke Drive
- `downloadFromGoogleDrive()` - Download file dari Drive
- `deleteFromGoogleDrive()` - Hapus file dari Drive
- `getFileMetadata()` - Get info file
- `createFolder()` - Buat folder baru

### 5. ConvertAPI Integration

**Setup:**

1. **Daftar di ConvertAPI:**
   - Buka https://www.convertapi.com/a/signup
   - Daftar akun (free tier: 250 conversions/month)
   - Copy API Secret

2. **Set Environment Variable:**
   ```bash
   CONVERTAPI_SECRET=your_secret_here
   ```

**Usage:**
```typescript
import ConvertAPI from 'convertapi';

const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);
const result = await convertapi.convert('pdf', { File: 'path/to/file.docx' }, 'docx');
await result.files[0].save('output.pdf');
```

## User Flow

### Workflow Lengkap

```
1. Staff/Admin Login
   ↓
2. Buka Form SKTM (/form-surat/sktm)
   ↓
3. Isi Data Pemohon
   - NIK, Nama, TTL, dll
   - Data alamat (auto-fill dari kelurahan)
   - Pilih pejabat penandatangan
   ↓
4. Klik "Preview"
   ↓
5. Halaman Preview (/preview-sktm)
   - Lihat dokumen dalam format HTML
   - Periksa semua data
   ↓
6. Pilihan:
   a. "Edit Data" → Kembali ke form (data tersimpan)
   b. "Proses & Simpan" → Lanjut ke proses
   ↓
7. Proses Dokumen (jika pilih b):
   - Generate DOCX
   - Convert ke PDF
   - Upload ke Google Drive
   - Simpan ke database
   - Download PDF otomatis
   ↓
8. Redirect ke Riwayat Dokumen (/sktm-documents)
   ↓
9. Cetak Ulang (kapan saja):
   - Buka /sktm-documents
   - Cari dokumen
   - Download dari Google Drive
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# ConvertAPI
CONVERTAPI_SECRET=your_convertapi_secret

# Google Drive
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=optional_folder_id
```

### Dependencies

```json
{
  "dependencies": {
    "convertapi": "^1.15.0",
    "googleapis": "^161.0.0",
    "docxtemplater": "^3.66.6",
    "pizzip": "^3.2.0",
    "puppeteer": "^24.23.0"
  }
}
```

## Testing

### 1. Test Preview

```bash
# Buka form
http://localhost:3000/form-surat/sktm

# Klik "Generate Data Contoh"
# Klik "Preview"
# Verifikasi preview muncul dengan benar
```

### 2. Test Process

```bash
# Dari preview, klik "Proses & Simpan"
# Verifikasi:
# - PDF terdownload
# - File muncul di Google Drive
# - Data tersimpan di database
```

### 3. Test Riwayat

```bash
# Buka riwayat
http://localhost:3000/sktm-documents

# Verifikasi:
# - List dokumen muncul
# - Search berfungsi
# - Download dari Drive berfungsi
```

## Troubleshooting

### Error: "GOOGLE_SERVICE_ACCOUNT_KEY not configured"

**Solusi:**
- Pastikan environment variable sudah di-set
- Format harus valid JSON
- Restart server setelah set env variable

### Error: "ConvertAPI not configured"

**Solusi:**
- Set `CONVERTAPI_SECRET` di .env
- Verifikasi API key valid di https://www.convertapi.com/a

### Error: "Failed to upload to Google Drive"

**Solusi:**
- Cek service account key valid
- Cek Google Drive API sudah enabled
- Cek folder ID (jika digunakan) valid dan shared dengan service account

### Preview tidak muncul

**Solusi:**
- Cek console browser untuk error
- Cek sessionStorage ada data
- Cek API `/api/preview-sktm-html` response

## Best Practices

1. **Backup Regular:**
   - Database backup otomatis
   - Google Drive sebagai backup cloud

2. **Security:**
   - Service account key jangan di-commit ke git
   - Gunakan .env.local untuk development
   - Restrict API access by role

3. **Performance:**
   - Pagination untuk list dokumen
   - Lazy load preview
   - Cache template DOCX

4. **Monitoring:**
   - Log semua proses ke console
   - Track ConvertAPI usage (quota)
   - Monitor Google Drive storage

## Future Enhancements

1. **Bulk Processing:**
   - Import dari Excel
   - Generate multiple SKTM sekaligus

2. **Digital Signature:**
   - E-signature integration
   - QR code verification

3. **Notification:**
   - Email notification saat dokumen selesai
   - WhatsApp notification

4. **Analytics:**
   - Dashboard statistik dokumen
   - Report bulanan

5. **Template Management:**
   - Multiple template support
   - Template versioning

## Support

Untuk pertanyaan atau issue, hubungi tim development atau buat issue di repository.

---

**Last Updated:** 2025-10-10
**Version:** 1.0.0
