# Pindah Keluar - Database Save Flow

## 📊 Alur Penyimpanan Data

### Flow Diagram

```
User Submit Form
      ↓
Preview Page
      ↓
Click "Proses & Simpan"
      ↓
API: /api/process-pindah-keluar
      ↓
┌─────────────────────────────────────────┐
│ 1. Load Template F-103.docx             │
│    ✅ Template loaded                    │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 2. Render Template dengan Data          │
│    - Populate semua placeholder         │
│    - Format SHDK ke singkatan           │
│    ✅ Document rendered                  │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 3. Generate DOCX Buffer                 │
│    ✅ DOCX generated                     │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 4. Save DOCX to Temp File               │
│    Location: /tmp/pindah_keluar_xxx.docx│
│    ✅ Temp DOCX saved                    │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 5. ConvertAPI: DOCX → PDF               │
│    ⚠️ CRITICAL STEP                     │
│    ✅ ConvertAPI successful              │
│    ❌ If fail → STOP, no database save  │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 6. Save PDF to Temp File                │
│    Location: /tmp/pindah_keluar_xxx.pdf │
│    ✅ Temp PDF saved                     │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 7. Read PDF Buffer                      │
│    ✅ PDF buffer ready                   │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 8. Upload to Supabase Storage           │
│    Bucket: pdf_surat                    │
│    Folder: pindah-keluar/               │
│    ✅ Uploaded to Supabase               │
│    ❌ If fail → STOP, no database save  │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 9. 💾 SAVE TO DATABASE                  │
│    Table: document_archives             │
│    ✅ Data saved to database             │
│    ❌ If fail → Throw error              │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 10. Return PDF to User                  │
│     ✅ PDF downloaded                    │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ 11. Cleanup Temp Files                  │
│     - Delete temp DOCX                  │
│     - Delete temp PDF                   │
│     ✅ Cleanup complete                  │
└─────────────────────────────────────────┘
```

## ✅ Kondisi Database Save

### Database HANYA Disimpan Jika:

1. ✅ **ConvertAPI Berhasil**
   - DOCX berhasil dikonversi ke PDF
   - Tidak ada error dari ConvertAPI

2. ✅ **Upload Supabase Berhasil**
   - PDF berhasil diupload ke bucket `pdf_surat`
   - Public URL tersedia

3. ✅ **Data Lengkap**
   - Semua field required terisi
   - Form data valid

### Database TIDAK Disimpan Jika:

1. ❌ **ConvertAPI Gagal**
   - Quota habis
   - Secret key invalid
   - Network error
   - Template error

2. ❌ **Upload Supabase Gagal**
   - Bucket tidak ada
   - Permission error
   - Network error

3. ❌ **Data Tidak Valid**
   - Field required kosong
   - Format data salah

## 💾 Database Schema

### Table: `document_archives`

```sql
INSERT INTO document_archives (
  nomor_surat,           -- No KK Pemohon
  jenis_dokumen,         -- 'Surat Pindah Keluar'
  tanggal_surat,         -- Tanggal surat
  perihal,               -- 'Surat Pindah Keluar - {jenis_permohonan}'
  nik_subjek,            -- NIK Pemohon
  nama_subjek,           -- Nama Pemohon
  alamat_subjek,         -- Alamat asal lengkap
  data_detail,           -- JSONB: semua data form
  google_drive_id,       -- Supabase file ID
  google_drive_url,      -- Supabase public URL
  file_name,             -- Path file di storage
  file_size,             -- Size dalam bytes
  mime_type,             -- 'application/pdf'
  created_by,            -- User ID
  status                 -- 'active'
) VALUES (...) RETURNING id, nomor_surat, jenis_dokumen, created_at;
```

## 📝 Data Detail (JSONB)

Semua data form disimpan sebagai JSONB di field `data_detail`:

```json
{
  "no_kk_pemohon": "1234567890123456",
  "nik_pemohon": "1234567890123456",
  "no_hp_pemohon": "081234567890",
  "email_pemohon": "john@example.com",
  "jenis_permohonan": "Pindah Keluar",
  "alamat_asal": "Jl. Contoh No. 123, RT 001/RW 002, Cibodas, Tangerang, Kota Tangerang",
  "alamat_pindah": "Jl. Tujuan No. 456, RT 003/RW 004, Kelurahan Baru, Kecamatan Baru, Kota Baru",
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
    },
    {
      "no_urut": "3",
      "nik": "1111222233334444",
      "nama": "Baby Doe",
      "shdk": "Anak"
    }
  ],
  "anggota_count": 3
}
```

## 🔍 Logging

### Console Logs (Server Side):

```
📥 Processing Pindah Keluar for: John Doe
📄 Loading template F-103.docx...
🔄 Rendering document...
📦 DOCX generated, size: 123456 bytes
💾 Temporary DOCX saved: /tmp/pindah_keluar_1234567890.docx
🚀 Converting DOCX to PDF with ConvertAPI...
✅ ConvertAPI conversion successful
✅ PDF saved to temp file: /tmp/pindah_keluar_1234567891.pdf
📄 PDF buffer size: 234567 bytes
☁️ Uploaded to Supabase Storage: https://...
💾 Saving to database...
✅ Successfully saved to database:
   - Document ID: 123
   - Nomor Surat: 1234567890123456
   - Jenis Dokumen: Surat Pindah Keluar
   - Created At: 2025-01-20T15:52:00.000Z
   - File URL: https://...
   - Anggota Keluarga: 3 orang
🧹 Temporary files cleaned up
```

### Error Logs:

```
❌ ConvertAPI conversion failed: [error details]
// STOP - Database tidak disimpan

❌ Error uploading to Supabase: [error details]
// STOP - Database tidak disimpan

❌ Error saving to database: [error details]
// Throw error - Process gagal
```

## 🎯 Success Criteria

Database save dianggap **BERHASIL** jika:

1. ✅ ConvertAPI berhasil convert DOCX → PDF
2. ✅ PDF berhasil diupload ke Supabase Storage
3. ✅ Data berhasil di-insert ke table `document_archives`
4. ✅ Mendapat `id` dari database
5. ✅ Semua anggota keluarga tersimpan di `data_detail`

## 📊 Query Database

### Lihat Dokumen yang Tersimpan:

```sql
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  google_drive_url,
  data_detail->>'anggota_count' as jumlah_anggota,
  created_at
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
ORDER BY created_at DESC;
```

### Lihat Semua Anggota Keluarga:

```sql
SELECT 
  nama_subjek,
  jsonb_array_length(data_detail->'anggota_keluarga') as jumlah_anggota,
  data_detail->'anggota_keluarga' as daftar_anggota
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
  AND id = 123;
```

### Expand Anggota Keluarga:

```sql
SELECT 
  d.nama_subjek,
  a.value->>'no_urut' as no_urut,
  a.value->>'nik' as nik,
  a.value->>'nama' as nama,
  a.value->>'shdk' as shdk
FROM document_archives d,
     jsonb_array_elements(d.data_detail->'anggota_keluarga') a
WHERE d.jenis_dokumen = 'Surat Pindah Keluar'
  AND d.id = 123;
```

## 🔒 Error Handling

### ConvertAPI Error:

```typescript
try {
  const convertapi = new ConvertAPI(convertApiSecret);
  convertResult = await convertapi.convert('pdf', { File: tempDocxPath }, 'docx');
  console.log('✅ ConvertAPI conversion successful');
} catch (convertError) {
  console.error('❌ ConvertAPI conversion failed:', convertError);
  throw new Error('Failed to convert DOCX to PDF with ConvertAPI');
  // STOP - Database tidak disimpan
}
```

### Supabase Upload Error:

```typescript
try {
  const uploadResult = await uploadToSupabase(...);
  console.log('☁️ Uploaded to Supabase Storage:', supabasePublicUrl);
} catch (uploadError) {
  console.error('❌ Error uploading to Supabase:', uploadError);
  throw new Error('Failed to upload PDF to Supabase Storage');
  // STOP - Database tidak disimpan
}
```

### Database Save Error:

```typescript
try {
  const archiveResult = await db.query(insertArchiveQuery, archiveValues);
  console.log('✅ Successfully saved to database');
} catch (dbError) {
  console.error('❌ Error saving to database:', dbError);
  throw new Error(`Failed to save document to database: ${dbError.message}`);
  // Throw error - Process gagal total
}
```

## ✅ Verification

### Setelah Proses Selesai, Verify:

1. **Check Console Logs**
   ```
   ✅ ConvertAPI conversion successful
   ✅ Uploaded to Supabase Storage
   ✅ Successfully saved to database
   ```

2. **Check Database**
   ```sql
   SELECT * FROM document_archives 
   WHERE nama_subjek = 'John Doe' 
   ORDER BY created_at DESC LIMIT 1;
   ```

3. **Check Supabase Storage**
   - Buka bucket `pdf_surat`
   - Folder `pindah-keluar/`
   - File PDF ada

4. **Check PDF Content**
   - Download PDF dari URL
   - Verify semua data terisi
   - Check anggota keluarga muncul

## 🚨 Troubleshooting

### Database Tidak Tersimpan

**Check:**
1. Apakah ConvertAPI berhasil?
2. Apakah upload Supabase berhasil?
3. Check console logs untuk error
4. Verify database connection
5. Check table schema

### Data Anggota Keluarga Tidak Lengkap

**Check:**
1. Verify `data_detail` field di database
2. Query JSONB: `data_detail->'anggota_keluarga'`
3. Check `anggota_count` field
4. Verify form data sebelum submit

### File URL Tidak Valid

**Check:**
1. Verify `google_drive_url` di database
2. Check Supabase bucket permissions
3. Verify file exists di storage
4. Check public access settings

---

**Last Updated**: 2025-01-20
**Flow**: ConvertAPI Success → Upload Success → Database Save
**Critical**: Database HANYA disimpan jika ConvertAPI berhasil
