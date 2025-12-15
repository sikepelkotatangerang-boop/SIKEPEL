# SKTM - Database Storage Pattern

## 📋 Overview

Form SKTM sekarang mengikuti pattern yang sama dengan **Belum Memiliki Rumah** dalam menyimpan data ke database - hanya menyimpan ke **1 table** (`document_archives`) saja.

---

## ✅ Changes Made

### **BEFORE (Old Pattern):**
```
SKTM menyimpan ke 2 tables:
1. sktm_documents (specific table)
2. document_archives (universal table)
```
❌ Masalah: Duplikasi data, maintenance lebih kompleks

### **AFTER (New Pattern - Following Belum Memiliki Rumah):**
```
SKTM menyimpan ke 1 table:
1. document_archives (universal table only)
```
✅ Solusi: Single source of truth, konsisten dengan form lain

---

## 🗄️ Database Schema

### Table: `document_archives`

```sql
CREATE TABLE document_archives (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(100),
  jenis_dokumen VARCHAR(100),        -- "SKTM"
  tanggal_surat DATE,
  perihal TEXT,                      -- "Surat Keterangan Tidak Mampu untuk ..."
  nik_subjek VARCHAR(20),
  nama_subjek VARCHAR(255),
  alamat_subjek TEXT,
  data_detail JSONB,                 -- All form data in JSON
  pejabat_id INTEGER,
  nama_pejabat VARCHAR(255),
  nip_pejabat VARCHAR(50),
  jabatan_pejabat VARCHAR(100),
  google_drive_id VARCHAR(255),      -- Supabase file ID
  google_drive_url TEXT,             -- Supabase public URL
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  kelurahan_id INTEGER,
  created_by INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 Data Structure

### Example Record:

```json
{
  "nomor_surat": "470/001/SKTM/X/2025",
  "jenis_dokumen": "SKTM",
  "tanggal_surat": "2025-10-16",
  "perihal": "Surat Keterangan Tidak Mampu untuk Berobat di Rumah Sakit",
  "nik_subjek": "3671012345678901",
  "nama_subjek": "Ahmad Yani",
  "alamat_subjek": "Jl. Merdeka No. 123, RT 001/RW 005, Cibodas, Cibodas, Kota Tangerang",
  "data_detail": {
    "tempat_lahir": "Tangerang",
    "tanggal_lahir": "1990-05-15",
    "kelamin_pemohon": "Laki-laki",
    "agama": "Islam",
    "pekerjaan": "Buruh Harian",
    "perkawinan": "Kawin",
    "negara": "Indonesia",
    "rt": "001",
    "rw": "005",
    "kelurahan": "Cibodas",
    "kecamatan": "Cibodas",
    "kota_kabupaten": "Kota Tangerang",
    "desil": "Desil 1 (Sangat Miskin)",
    "peruntukan": "Berobat di Rumah Sakit",
    "pengantar_rt": "001/RT.001/X/2025"
  },
  "pejabat_id": 1,
  "nama_pejabat": "Budi Santoso",
  "nip_pejabat": "197001011990031001",
  "jabatan_pejabat": "Lurah",
  "google_drive_id": "abc123xyz",
  "google_drive_url": "https://supabase.co/storage/v1/object/public/documents/SKTM_Ahmad_Yani_1729065600000.pdf",
  "file_name": "SKTM_Ahmad_Yani_1729065600000.pdf",
  "file_size": 245678,
  "mime_type": "application/pdf",
  "kelurahan_id": 1,
  "created_by": 5,
  "status": "active"
}
```

---

## 🔄 Implementation

### API Route: `/api/process-sktm/route.ts`

**BEFORE (2 tables):**
```typescript
// Save to database (both sktm_documents and document_archives)
try {
  // 1. Save to sktm_documents (specific table)
  const insertSKTMQuery = `INSERT INTO sktm_documents ...`;
  await db.query(insertSKTMQuery, sktmValues);
  
  // 2. Save to document_archives (universal table)
  const insertArchiveQuery = `INSERT INTO document_archives ...`;
  await db.query(insertArchiveQuery, archiveValues);
}
```

**AFTER (1 table):**
```typescript
// Save to database (document_archives table only)
try {
  const insertArchiveQuery = `
    INSERT INTO document_archives (
      nomor_surat, jenis_dokumen, tanggal_surat, perihal,
      nik_subjek, nama_subjek, alamat_subjek,
      data_detail,
      pejabat_id, nama_pejabat, nip_pejabat, jabatan_pejabat,
      google_drive_id, google_drive_url,
      file_name, file_size, mime_type,
      kelurahan_id, created_by, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    ) RETURNING id
  `;

  const alamatLengkap = `${formData.alamat}, RT ${formData.rt}/RW ${formData.rw}, ${formData.kelurahan}, ${formData.kecamatan}, ${formData.kota_kabupaten}`;
  
  const dataDetail = {
    tempat_lahir: formData.tempat_lahir,
    tanggal_lahir: formData.tanggal_lahir,
    kelamin_pemohon: formData.kelamin_pemohon,
    agama: formData.agama,
    pekerjaan: formData.pekerjaan,
    perkawinan: formData.perkawinan,
    negara: formData.negara,
    rt: formData.rt,
    rw: formData.rw,
    kelurahan: formData.kelurahan,
    kecamatan: formData.kecamatan,
    kota_kabupaten: formData.kota_kabupaten,
    desil: formData.desil,
    peruntukan: formData.peruntukan,
    pengantar_rt: formData.pengantar_rt
  };

  const archiveValues = [
    formData.nomor_surat,
    'SKTM',
    new Date(),
    `Surat Keterangan Tidak Mampu untuk ${formData.peruntukan}`,
    formData.nik_pemohon,
    formData.nama_pemohon,
    alamatLengkap,
    JSON.stringify(dataDetail),
    formData.pejabat_id || null,
    formData.nama_pejabat,
    formData.nip_pejabat,
    formData.jabatan,
    googleDriveId,
    googleDriveUrl,
    fileName,
    pdfBuffer.length,
    'application/pdf',
    kelurahanId,
    userId || null,
    'active'
  ];

  await db.query(insertArchiveQuery, archiveValues);
}
```

---

## 📋 Comparison with Belum Memiliki Rumah

| Aspect | Belum Memiliki Rumah | SKTM (Updated) |
|--------|---------------------|----------------|
| **Tables Used** | 1 (`document_archives`) | 1 (`document_archives`) ✅ |
| **jenis_dokumen** | "Belum Memiliki Rumah" | "SKTM" |
| **data_detail** | JSON with form fields | JSON with form fields |
| **Storage** | Supabase Storage | Supabase Storage |
| **Pattern** | Single table | Single table ✅ |

---

## ✅ Benefits

1. **Konsistensi** - Semua form menggunakan pattern yang sama
2. **Single Source of Truth** - Data hanya di 1 tempat
3. **Easier Maintenance** - Tidak perlu sync 2 tables
4. **Flexible** - `data_detail` JSONB bisa menyimpan field apapun
5. **Universal Query** - Bisa query semua dokumen dari 1 table

---

## 🔍 Query Examples

### Get All SKTM Documents:
```sql
SELECT * FROM document_archives 
WHERE jenis_dokumen = 'SKTM' 
ORDER BY created_at DESC;
```

### Get SKTM by NIK:
```sql
SELECT * FROM document_archives 
WHERE jenis_dokumen = 'SKTM' 
  AND nik_subjek = '3671012345678901';
```

### Get All Documents (SKTM + Others):
```sql
SELECT 
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  tanggal_surat,
  status
FROM document_archives 
WHERE kelurahan_id = 1 
ORDER BY created_at DESC;
```

### Search in data_detail:
```sql
SELECT * FROM document_archives 
WHERE jenis_dokumen = 'SKTM'
  AND data_detail->>'desil' = 'Desil 1 (Sangat Miskin)';
```

---

## 🎯 Migration Notes

### If `sktm_documents` table exists:

**Option 1: Keep Both (Backward Compatibility)**
- Keep `sktm_documents` table for old data
- New data only goes to `document_archives`
- Query both tables when needed

**Option 2: Migrate Data**
```sql
-- Migrate existing data from sktm_documents to document_archives
INSERT INTO document_archives (
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nik_subjek, nama_subjek, alamat_subjek,
  data_detail,
  pejabat_id, nama_pejabat, nip_pejabat, jabatan_pejabat,
  google_drive_id, google_drive_url,
  file_name, file_size, mime_type,
  kelurahan_id, created_by, status, created_at
)
SELECT 
  nomor_surat,
  'SKTM' as jenis_dokumen,
  tanggal_surat,
  CONCAT('Surat Keterangan Tidak Mampu untuk ', peruntukan) as perihal,
  nik_pemohon as nik_subjek,
  nama_pemohon as nama_subjek,
  CONCAT(alamat, ', RT ', rt, '/RW ', rw, ', ', kelurahan, ', ', kecamatan, ', ', kota_kabupaten) as alamat_subjek,
  jsonb_build_object(
    'tempat_lahir', tempat_lahir,
    'tanggal_lahir', tanggal_lahir,
    'kelamin_pemohon', kelamin_pemohon,
    'agama', agama,
    'pekerjaan', pekerjaan,
    'perkawinan', perkawinan,
    'negara', negara,
    'rt', rt,
    'rw', rw,
    'kelurahan', kelurahan,
    'kecamatan', kecamatan,
    'kota_kabupaten', kota_kabupaten,
    'desil', desil,
    'peruntukan', peruntukan,
    'pengantar_rt', pengantar_rt
  ) as data_detail,
  pejabat_id,
  nama_pejabat,
  nip_pejabat,
  jabatan as jabatan_pejabat,
  google_drive_id,
  google_drive_url,
  file_name,
  file_size,
  mime_type,
  kelurahan_id,
  created_by,
  status,
  created_at
FROM sktm_documents
WHERE id NOT IN (
  SELECT CAST(data_detail->>'sktm_id' AS INTEGER) 
  FROM document_archives 
  WHERE jenis_dokumen = 'SKTM' 
    AND data_detail->>'sktm_id' IS NOT NULL
);
```

---

## 📝 Summary

| Item | Status |
|------|--------|
| Database Pattern | ✅ Updated to single table |
| Follows Belum Memiliki Rumah | ✅ Yes |
| API Route Updated | ✅ `/api/process-sktm/route.ts` |
| Form Updated | ✅ Nomor Pengantar RT now optional |
| Documentation | ✅ Created |

---

**Status:** ✅ SKTM now follows the same database pattern as Belum Memiliki Rumah - storing data only in `document_archives` table.
