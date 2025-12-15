# Database Setup untuk Surat Keluar

## Tabel `documents`

Tabel baru untuk menyimpan data Surat Keluar dengan link storage bucket.

### Setup

1. **Jalankan SQL Script:**
   ```bash
   psql -U your_username -d your_database -f database/create_documents_table.sql
   ```

2. **Atau copy-paste SQL ke pgAdmin/DBeaver:**
   - Buka file `create_documents_table.sql`
   - Copy semua isi file
   - Paste dan execute di database tool Anda

### Struktur Tabel

```sql
documents (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(100),
  jenis_dokumen VARCHAR(100),
  tanggal_surat DATE,
  perihal TEXT,
  sifat VARCHAR(50),
  jumlah_lampiran INTEGER,
  tujuan TEXT,
  isi_surat TEXT,
  akhiran TEXT,
  hari_acara VARCHAR(50),
  tanggal_acara VARCHAR(100),
  waktu_acara VARCHAR(100),
  tempat_acara TEXT,
  data_acara TEXT,
  nama_pejabat VARCHAR(255),
  nip_pejabat VARCHAR(50),
  jabatan VARCHAR(100),
  storage_bucket_url TEXT NOT NULL,  -- Link ke Supabase Storage
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  kelurahan_id INTEGER,
  created_by INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Fitur

- ✅ Menyimpan semua field surat keluar
- ✅ Link storage bucket untuk download PDF
- ✅ Support data acara (optional)
- ✅ Indexes untuk performa query
- ✅ Auto-update `updated_at` dengan trigger
- ✅ Foreign keys ke tabel `kelurahan` dan `users`

### API Endpoints

1. **POST /api/process-surat-keluar**
   - Proses dan simpan surat keluar
   - Upload PDF ke Supabase Storage
   - Simpan data ke tabel `documents`

2. **GET /api/surat-keluar**
   - Ambil daftar surat keluar
   - Support filter: kelurahanId, status, search
   - Support pagination

### Migration dari `document_archives`

Jika Anda sudah punya data di `document_archives`, Anda bisa migrate dengan query:

```sql
INSERT INTO documents (
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nama_pejabat, nip_pejabat, jabatan,
  storage_bucket_url, file_name, file_size, mime_type,
  kelurahan_id, created_by, status, created_at
)
SELECT 
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nama_pejabat, nip_pejabat, jabatan_pejabat,
  google_drive_url, file_name, file_size, mime_type,
  kelurahan_id, created_by, status, created_at
FROM document_archives
WHERE jenis_dokumen = 'Surat Keluar';
```
