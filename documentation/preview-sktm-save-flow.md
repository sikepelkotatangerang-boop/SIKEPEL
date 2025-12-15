# Alur Penyimpanan Data dari Preview SKTM

## 📋 Overview

Ketika user menekan tombol **"Proses & Simpan"** di halaman preview SKTM, sistem akan:
1. Generate PDF dari template DOCX
2. Upload PDF ke Supabase Storage
3. Simpan metadata ke database (2 tabel)
4. Download PDF ke komputer user
5. Redirect ke halaman Daftar Surat

---

## 🔄 Alur Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│                  USER ACTION                                 │
│  Klik tombol "Proses & Simpan" di /preview-sktm             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (preview-sktm/page.tsx)                │
│                                                              │
│  1. Confirm dialog                                           │
│  2. setIsProcessing(true)                                    │
│  3. POST /api/process-sktm                                   │
│     Body: { formData, userId }                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              API (api/process-sktm/route.ts)                 │
│                                                              │
│  STEP 1: Validasi Data                                       │
│  - Cek data pejabat lengkap                                  │
│  - Cek ConvertAPI configured                                 │
│                                                              │
│  STEP 2: Get Kelurahan Data                                  │
│  - Query kelurahan dari database                             │
│  - Get alamat kelurahan                                      │
│                                                              │
│  STEP 3: Generate DOCX                                       │
│  - Load template dari public/template/SKTM.docx             │
│  - Render dengan Docxtemplater                              │
│  - Save ke temporary file                                    │
│                                                              │
│  STEP 4: Convert DOCX → PDF                                  │
│  - Upload DOCX ke ConvertAPI                                │
│  - Download PDF result                                       │
│  - Save ke temporary file                                    │
│                                                              │
│  STEP 5: Upload ke Supabase Storage                         │
│  - uploadToSupabase(pdfBuffer, fileName)                    │
│  - Get fileId dan publicUrl                                  │
│                                                              │
│  STEP 6: Save to Database (2 tables)                        │
│  A. sktm_documents (specific)                               │
│  B. document_archives (universal)                           │
│                                                              │
│  STEP 7: Return PDF                                          │
│  - Return PDF buffer as response                             │
│  - Cleanup temporary files                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                           │
│                                                              │
│  TABLE 1: sktm_documents                                     │
│  - Menyimpan data spesifik SKTM                             │
│  - Semua field detail SKTM                                   │
│                                                              │
│  TABLE 2: document_archives                                  │
│  - Menyimpan data universal semua dokumen                   │
│  - Field standar + data_detail (JSONB)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE STORAGE                                │
│                                                              │
│  Bucket: documents                                           │
│  File: SKTM_Nama_Pemohon_timestamp.pdf                      │
│  Public URL: https://...supabase.co/storage/...             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND RESPONSE                               │
│                                                              │
│  1. Download PDF ke komputer                                 │
│  2. Clear sessionStorage                                     │
│  3. Show success alert                                       │
│  4. Redirect ke /daftar-surat                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Table 1: `sktm_documents` (Specific)

```sql
INSERT INTO sktm_documents (
  nomor_surat,              -- Nomor surat
  tanggal_surat,            -- Tanggal pembuatan
  
  -- Data Pemohon
  nik_pemohon,
  nama_pemohon,
  tempat_lahir,
  tanggal_lahir,
  kelamin_pemohon,
  agama,
  pekerjaan,
  perkawinan,
  negara,
  
  -- Alamat
  alamat,
  rt,
  rw,
  kelurahan,
  kecamatan,
  kota_kabupaten,
  
  -- Data SKTM Specific
  desil,                    -- Desil ekonomi
  peruntukan,               -- Tujuan penggunaan SKTM
  pengantar_rt,             -- Nomor surat pengantar RT
  
  -- Pejabat
  pejabat_id,
  nama_pejabat,
  nip_pejabat,
  jabatan,
  
  -- File Storage
  google_drive_id,          -- Sebenarnya Supabase file path
  google_drive_url,         -- Sebenarnya Supabase public URL
  file_name,
  file_size,
  mime_type,
  
  -- Metadata
  kelurahan_id,
  created_by,
  status
) VALUES (...)
```

### Table 2: `document_archives` (Universal)

```sql
INSERT INTO document_archives (
  nomor_surat,              -- Nomor surat
  jenis_dokumen,            -- 'SKTM'
  tanggal_surat,            -- Tanggal pembuatan
  perihal,                  -- 'Surat Keterangan Tidak Mampu untuk ...'
  
  -- Subjek (Universal)
  nik_subjek,               -- NIK pemohon
  nama_subjek,              -- Nama pemohon
  alamat_subjek,            -- Alamat lengkap
  
  -- Data Detail (JSONB)
  data_detail,              -- JSON dengan semua field spesifik SKTM
  
  -- Pejabat
  pejabat_id,
  nama_pejabat,
  nip_pejabat,
  jabatan_pejabat,
  
  -- File Storage
  google_drive_id,          -- Supabase file path
  google_drive_url,         -- Supabase public URL
  file_name,
  file_size,
  mime_type,
  
  -- Metadata
  kelurahan_id,
  created_by,
  status
) VALUES (...)
```

### Data Detail (JSONB) Structure

```json
{
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "1990-01-01",
  "kelamin_pemohon": "Laki-laki",
  "agama": "Islam",
  "pekerjaan": "Buruh",
  "perkawinan": "Kawin",
  "negara": "Indonesia",
  "rt": "001",
  "rw": "002",
  "kelurahan": "Cibodas",
  "kecamatan": "Tangerang",
  "kota_kabupaten": "Kota Tangerang",
  "desil": "1",
  "peruntukan": "Berobat",
  "pengantar_rt": "001/RT/2025"
}
```

---

## 📂 File Storage

### Supabase Storage Structure

```
Bucket: documents
├── SKTM_John_Doe_1697123456789.pdf
├── SKTM_Jane_Smith_1697123456790.pdf
└── ...
```

### File Naming Convention

```
Format: SKTM_{nama_pemohon}_{timestamp}.pdf
Example: SKTM_John_Doe_1697123456789.pdf

- Spasi diganti dengan underscore
- Timestamp untuk uniqueness
```

---

## 🔐 Security & Validation

### Frontend Validation
```typescript
// Confirm dialog sebelum proses
const confirmed = confirm(
  'Apakah Anda yakin data sudah benar?\n\n' +
  'Dokumen akan dikonversi ke PDF, disimpan ke Google Drive, dan dicatat dalam database.'
);
```

### Backend Validation
```typescript
// 1. Validasi data pejabat
if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
  return error('Data pejabat tidak lengkap');
}

// 2. Validasi ConvertAPI
if (!process.env.CONVERTAPI_SECRET) {
  return error('ConvertAPI tidak dikonfigurasi');
}

// 3. Validasi Supabase
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  return error('Supabase tidak dikonfigurasi');
}
```

---

## 🎯 Success Flow

### 1. Frontend Success Handler
```typescript
// Download PDF
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `SKTM_${formData.nama_pemohon}_${Date.now()}.pdf`;
a.click();

// Clear session
sessionStorage.removeItem('sktm_preview_data');

// Show success
alert(
  'Dokumen SKTM berhasil dibuat!\n\n' +
  '✓ PDF telah diunduh\n' +
  '✓ Disimpan ke Supabase Storage\n' +
  '✓ Tercatat dalam database\n\n' +
  'Anda dapat melihat dokumen di menu Daftar Surat.'
);

// Redirect
router.push('/daftar-surat');
```

### 2. Backend Success Response
```typescript
return new NextResponse(pdfBuffer, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${fileName}"`,
  },
});
```

---

## ⚠️ Error Handling

### Frontend Error Handler
```typescript
try {
  // Process...
} catch (error) {
  console.error('Error processing SKTM:', error);
  alert(`Terjadi kesalahan: ${error.message}`);
} finally {
  setIsProcessing(false);
}
```

### Backend Error Handler
```typescript
try {
  // Process...
} catch (error) {
  console.error('Error processing SKTM:', error);
  return NextResponse.json(
    { 
      error: 'Failed to process SKTM document', 
      details: error.message 
    },
    { status: 500 }
  );
} finally {
  // Cleanup temporary files
  if (tempDocxPath) unlinkSync(tempDocxPath);
  if (tempPdfPath) unlinkSync(tempPdfPath);
}
```

---

## 🔍 Verifikasi Data Tersimpan

### 1. Cek Database
```sql
-- Cek di sktm_documents
SELECT * FROM sktm_documents 
WHERE nomor_surat = '001/SKTM/2025' 
ORDER BY created_at DESC;

-- Cek di document_archives
SELECT * FROM document_archives 
WHERE nomor_surat = '001/SKTM/2025' 
AND jenis_dokumen = 'SKTM'
ORDER BY created_at DESC;
```

### 2. Cek Supabase Storage
```typescript
// Via API
GET /api/documents/download?fileName=SKTM_John_Doe_1697123456789.pdf

// Via Supabase Dashboard
// Bucket: documents
// File: SKTM_John_Doe_1697123456789.pdf
```

### 3. Cek di Halaman Daftar Surat
- Buka `/daftar-surat`
- Cari berdasarkan nama/NIK
- Klik tombol "Lihat" atau "Unduh"

---

## 📊 Data Flow Summary

| Step | Action | Location | Output |
|------|--------|----------|--------|
| 1 | User klik "Proses & Simpan" | Frontend | API call |
| 2 | Generate DOCX | Backend | DOCX file |
| 3 | Convert to PDF | ConvertAPI | PDF file |
| 4 | Upload to Storage | Supabase | Public URL |
| 5 | Save to DB (sktm_documents) | PostgreSQL | Record ID |
| 6 | Save to DB (document_archives) | PostgreSQL | Record ID |
| 7 | Return PDF | Backend | PDF download |
| 8 | Redirect | Frontend | /daftar-surat |

---

## 🛠️ Environment Variables Required

```env
# ConvertAPI (DOCX to PDF)
CONVERTAPI_SECRET=your_convertapi_secret

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Database
DATABASE_URL=your_postgresql_url
```

---

## 📝 Notes

1. **Dual Storage**: Data disimpan di 2 tabel untuk backward compatibility dan flexibility
2. **File Naming**: Menggunakan nama pemohon + timestamp untuk uniqueness
3. **Cleanup**: Temporary files (DOCX & PDF) dihapus setelah proses selesai
4. **Error Resilience**: Proses tetap lanjut meskipun database save gagal (PDF tetap di-generate)
5. **User Experience**: User mendapat feedback lengkap (download + alert + redirect)

---

## 🚀 Future Improvements

1. **Async Processing**: Gunakan queue untuk proses yang lama
2. **Retry Logic**: Auto-retry jika upload gagal
3. **Notification**: Email/SMS notification saat dokumen selesai
4. **Audit Log**: Log semua aktivitas untuk tracking
5. **Batch Processing**: Proses multiple dokumen sekaligus
