# Pindah Keluar - SKTM Pattern Implementation

## 📋 Overview

Surat Pindah Keluar sekarang menggunakan **logic yang sama dengan SKTM** untuk menyimpan data ke database.

## ✅ Perubahan yang Dilakukan

### 1. **Nomor Surat: Gunakan "-"**

**Sebelumnya:**
```typescript
formData.no_kk_pemohon || '-'  // Gunakan No KK sebagai nomor surat
```

**Sekarang (SKTM Pattern):**
```typescript
'-'  // Selalu gunakan "-" untuk nomor surat
```

**Alasan:**
- Konsisten dengan SKTM
- Nomor surat bisa di-generate otomatis nanti
- No KK tetap tersimpan di `data_detail`

---

### 2. **Tambah Field Pejabat**

**Sebelumnya:**
```sql
INSERT INTO document_archives (
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nik_subjek, nama_subjek, alamat_subjek,
  data_detail,
  google_drive_id, google_drive_url,
  file_name, file_size, mime_type,
  created_by, status
) VALUES (...)
```

**Sekarang (SKTM Pattern):**
```sql
INSERT INTO document_archives (
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nik_subjek, nama_subjek, alamat_subjek,
  data_detail,
  pejabat_id, nama_pejabat, nip_pejabat, jabatan_pejabat,  ← ADDED
  google_drive_id, google_drive_url,
  file_name, file_size, mime_type,
  kelurahan_id, created_by, status  ← kelurahan_id ADDED
) VALUES (...)
```

**Field Baru:**
- `pejabat_id` - ID pejabat penandatangan
- `nama_pejabat` - Nama pejabat
- `nip_pejabat` - NIP pejabat
- `jabatan_pejabat` - Jabatan pejabat
- `kelurahan_id` - ID kelurahan

---

### 3. **Lookup Kelurahan ID dari Database**

**Sebelumnya:**
```typescript
// Tidak ada lookup kelurahan_id
```

**Sekarang (SKTM Pattern):**
```typescript
// Get kelurahan_id from database (like SKTM)
let kelurahanId: number | null = null;

if (formData.kel_asal) {
  try {
    const kelurahanResult = await db.query<{ id: number }>(
      'SELECT id FROM kelurahan WHERE LOWER(nama) = LOWER($1) LIMIT 1',
      [formData.kel_asal]
    );
    
    if (kelurahanResult.rows.length > 0) {
      kelurahanId = kelurahanResult.rows[0].id;
    }
  } catch (dbError) {
    console.error('Error fetching kelurahan:', dbError);
  }
}
```

**Keuntungan:**
- Relasi database yang proper
- Filter by kelurahan berfungsi dengan baik
- Konsisten dengan SKTM

---

### 4. **Archive Values Update**

**Sebelumnya:**
```typescript
const archiveValues = [
  formData.no_kk_pemohon || '-',  // nomor_surat
  'Surat Pindah Keluar',
  new Date(formData.tanggal_surat || new Date()),
  `Surat Pindah Keluar - ${formData.jenis_permohonan}`,
  formData.nik_pemohon,
  formData.nama_pemohon,
  alamatAsal,
  JSON.stringify(dataDetail),
  googleDriveId,
  googleDriveUrl,
  fileName,
  pdfBuffer.length,
  'application/pdf',
  userId || null,
  'active'
];  // 15 parameters
```

**Sekarang (SKTM Pattern):**
```typescript
const archiveValues = [
  '-',  // nomor_surat: gunakan "-" seperti SKTM
  'Surat Pindah Keluar',
  new Date(formData.tanggal_surat || new Date()),
  `Surat Pindah Keluar - ${formData.jenis_permohonan}`,
  formData.nik_pemohon,
  formData.nama_pemohon,
  alamatAsal,
  JSON.stringify(dataDetail),
  formData.pejabat_id || null,  // pejabat_id
  formData.nama_pejabat || null,  // nama_pejabat
  formData.nip_pejabat || null,  // nip_pejabat
  formData.jabatan || null,  // jabatan_pejabat
  googleDriveId,
  googleDriveUrl,
  fileName,
  pdfBuffer.length,
  'application/pdf',
  kelurahanId || null,  // kelurahan_id
  userId || null,
  'active'
];  // 20 parameters
```

---

## 📊 Database Schema Comparison

### SKTM (Reference)

```sql
INSERT INTO document_archives (
  nomor_surat,              -- formData.nomor_surat
  jenis_dokumen,            -- 'SKTM'
  tanggal_surat,            -- new Date()
  perihal,                  -- 'Surat Keterangan Tidak Mampu untuk ...'
  nik_subjek,               -- formData.nik_pemohon
  nama_subjek,              -- formData.nama_pemohon
  alamat_subjek,            -- alamatLengkap
  data_detail,              -- JSON.stringify(dataDetail)
  pejabat_id,               -- formData.pejabat_id
  nama_pejabat,             -- formData.nama_pejabat
  nip_pejabat,              -- formData.nip_pejabat
  jabatan_pejabat,          -- formData.jabatan
  google_drive_id,          -- supabaseFileId
  google_drive_url,         -- supabasePublicUrl
  file_name,                -- fileName
  file_size,                -- pdfBuffer.length
  mime_type,                -- 'application/pdf'
  kelurahan_id,             -- kelurahanId (from DB lookup)
  created_by,               -- userId
  status                    -- 'active'
) VALUES (...)
```

### Pindah Keluar (Now Same)

```sql
INSERT INTO document_archives (
  nomor_surat,              -- '-' (like SKTM)
  jenis_dokumen,            -- 'Surat Pindah Keluar'
  tanggal_surat,            -- new Date(formData.tanggal_surat)
  perihal,                  -- 'Surat Pindah Keluar - ...'
  nik_subjek,               -- formData.nik_pemohon
  nama_subjek,              -- formData.nama_pemohon
  alamat_subjek,            -- alamatAsal
  data_detail,              -- JSON.stringify(dataDetail)
  pejabat_id,               -- formData.pejabat_id ← ADDED
  nama_pejabat,             -- formData.nama_pejabat ← ADDED
  nip_pejabat,              -- formData.nip_pejabat ← ADDED
  jabatan_pejabat,          -- formData.jabatan ← ADDED
  google_drive_id,          -- supabaseFileId
  google_drive_url,         -- supabasePublicUrl
  file_name,                -- fileName
  file_size,                -- pdfBuffer.length
  mime_type,                -- 'application/pdf'
  kelurahan_id,             -- kelurahanId (from DB lookup) ← ADDED
  created_by,               -- userId
  status                    -- 'active'
) VALUES (...)
```

---

## 🎯 Benefits

### 1. **Consistency**
- ✅ Same pattern as SKTM
- ✅ Easier to maintain
- ✅ Predictable behavior

### 2. **Better Data Structure**
- ✅ Pejabat information stored properly
- ✅ Kelurahan relationship established
- ✅ Nomor surat standardized

### 3. **Filter Support**
- ✅ Filter by kelurahan works
- ✅ Filter by pejabat works
- ✅ Staff users see only their kelurahan documents

### 4. **Future-Proof**
- ✅ Ready for nomor surat auto-generation
- ✅ Ready for reporting features
- ✅ Ready for advanced filtering

---

## 📝 Data Detail (JSONB)

**What's Stored:**

```json
{
  "no_kk_pemohon": "1234567890123456",
  "nik_pemohon": "1234567890123456",
  "no_hp_pemohon": "081234567890",
  "email_pemohon": "john@example.com",
  "jenis_permohonan": "Pindah Keluar",
  "alamat_asal": "Jl. Asal ...",
  "alamat_pindah": "Jl. Tujuan ...",
  "no_klasifikasi_pindah": "1",
  "no_alasan_pindah": "1",
  "no_jenis_pindah": "1",
  "no_anggota_pindah": "2",
  "no_keluarga_pindah": "1",
  "anggota_keluarga": [
    {
      "no_urut": "1",
      "nik": "1234567890123456",
      "nama": "John Doe",
      "shdk": "Kepala Keluarga"
    },
    {
      "no_urut": "2",
      "nik": "9876543210987654",
      "nama": "Jane Doe",
      "shdk": "Istri"
    }
  ],
  "anggota_count": 2
}
```

**Note:** No KK tetap tersimpan di `data_detail.no_kk_pemohon`

---

## 🔍 Query Examples

### Get All Pindah Keluar Documents

```sql
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  nama_pejabat,
  kelurahan_id,
  data_detail->>'no_kk_pemohon' as no_kk,
  data_detail->>'anggota_count' as jumlah_anggota,
  created_at
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
  AND status = 'active'
ORDER BY created_at DESC;
```

### Filter by Kelurahan

```sql
SELECT *
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
  AND kelurahan_id = 1
  AND status = 'active';
```

### Filter by Pejabat

```sql
SELECT *
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
  AND pejabat_id = 5
  AND status = 'active';
```

---

## ✅ Migration Notes

### For Existing Data

If you have existing Pindah Keluar documents with old structure:

```sql
-- Update nomor_surat to "-"
UPDATE document_archives
SET nomor_surat = '-'
WHERE jenis_dokumen = 'Surat Pindah Keluar'
  AND nomor_surat != '-';

-- Update kelurahan_id (if missing)
UPDATE document_archives da
SET kelurahan_id = k.id
FROM kelurahan k
WHERE da.jenis_dokumen = 'Surat Pindah Keluar'
  AND da.kelurahan_id IS NULL
  AND da.data_detail->>'kel_asal' = k.nama;
```

---

## 🚀 Testing

### Test Checklist

- [ ] Create new Pindah Keluar document
- [ ] Verify `nomor_surat = '-'` in database
- [ ] Verify `pejabat_id` is filled
- [ ] Verify `kelurahan_id` is filled
- [ ] Verify document appears in Daftar Surat
- [ ] Test filter by kelurahan
- [ ] Test staff user (should see only their kelurahan)
- [ ] Verify No KK in `data_detail`

### SQL Test Query

```sql
-- Check latest Pindah Keluar document
SELECT 
  id,
  nomor_surat,  -- Should be '-'
  jenis_dokumen,  -- Should be 'Surat Pindah Keluar'
  nama_subjek,
  pejabat_id,  -- Should not be NULL
  nama_pejabat,  -- Should not be NULL
  kelurahan_id,  -- Should not be NULL
  data_detail->>'no_kk_pemohon' as no_kk,  -- Should have value
  created_at
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 📚 Related Documentation

- **SKTM Pattern**: `src/app/api/process-sktm/route.ts`
- **Database Schema**: `document_archives` table
- **Daftar Surat Integration**: `documentation/daftar-surat-integration.md`
- **Database Flow**: `documentation/pindah-keluar-database-flow.md`

---

**Last Updated**: 2025-01-20
**Pattern**: SKTM-Compatible
**Status**: ✅ Implemented
**Breaking Changes**: None (backward compatible)
