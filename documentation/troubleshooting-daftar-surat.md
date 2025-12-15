# Troubleshooting: Halaman Daftar Surat Kosong

## 🔍 Langkah-langkah Debugging

### 1. Cek Database Connection

**Jalankan script check database:**
```bash
node scripts/check-database.js
```

Script ini akan mengecek:
- ✅ Koneksi database
- ✅ Jumlah dokumen di `document_archives`
- ✅ Jumlah dokumen di `sktm_documents`
- ✅ Status dokumen (active/archived)
- ✅ Jenis dokumen (SKTM, Domisili, dll)
- ✅ 5 dokumen terakhir
- ✅ Struktur tabel

### 2. Test API Endpoint

**Test API documents:**
```bash
# Via browser atau curl
curl http://localhost:3000/api/documents/test
```

Response yang diharapkan:
```json
{
  "success": true,
  "database_connected": true,
  "document_archives": {
    "total": 10,
    "recent_documents": [...],
    "by_status": [...]
  },
  "sktm_documents": {
    "total": 10
  }
}
```

### 3. Cek Browser Console

Buka halaman `/daftar-surat` dan cek console:
```javascript
// Seharusnya muncul log:
API Response: { success: true, data: [...], pagination: {...} }
Documents count: 10
```

Jika ada error, akan muncul:
```javascript
Error loading documents: ...
```

### 4. Cek Network Tab

Di browser DevTools → Network tab:
- Cari request ke `/api/documents?page=1&limit=10&search=`
- Cek status code (harus 200)
- Cek response body

---

## 🐛 Kemungkinan Masalah & Solusi

### Problem 1: Database Kosong

**Gejala:**
- Total documents: 0
- Tidak ada data di `document_archives`

**Solusi:**
1. Pastikan sudah membuat dokumen SKTM via form
2. Cek apakah proses simpan berhasil di `/preview-sktm`
3. Jalankan migration jika belum:
   ```bash
   psql -d your_database -f database/migration_universal_documents.sql
   ```

### Problem 2: SQL Query Error

**Gejala:**
- Error di console: "syntax error at or near..."
- Status 500 dari API

**Solusi:**
- Sudah diperbaiki di `src/app/api/documents/route.ts`
- Parameter placeholder sekarang menggunakan `$1, $2, $3` dengan benar
- Restart development server:
  ```bash
  npm run dev
  ```

### Problem 3: Status Filter

**Gejala:**
- Data ada di database tapi tidak muncul
- Query mengembalikan 0 results

**Penyebab:**
- Default filter `status = 'active'`
- Dokumen mungkin memiliki status lain

**Solusi:**
```sql
-- Cek status dokumen
SELECT status, COUNT(*) FROM document_archives GROUP BY status;

-- Update status jika perlu
UPDATE document_archives SET status = 'active' WHERE status IS NULL;
```

### Problem 4: Role-Based Filter

**Gejala:**
- Admin bisa lihat semua, staff tidak bisa lihat apa-apa

**Penyebab:**
- Staff hanya bisa lihat dokumen dari kelurahan mereka
- `kelurahan_id` tidak match

**Solusi:**
```sql
-- Cek kelurahan_id user
SELECT id, name, role, kelurahan_id FROM users WHERE role = 'staff';

-- Cek kelurahan_id dokumen
SELECT kelurahan_id, COUNT(*) FROM document_archives GROUP BY kelurahan_id;

-- Update kelurahan_id jika perlu
UPDATE document_archives SET kelurahan_id = 1 WHERE kelurahan_id IS NULL;
```

### Problem 5: JOIN Error

**Gejala:**
- Error: "column reference is ambiguous"
- Error: "relation does not exist"

**Penyebab:**
- Tabel `users`, `kelurahan`, atau `pejabat` tidak ada
- Column name conflict

**Solusi:**
```sql
-- Cek tabel yang ada
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Buat tabel jika belum ada
-- Lihat database/schema.sql
```

### Problem 6: Data Detail JSON Error

**Gejala:**
- Error: "invalid JSON"
- Documents tidak ter-parse

**Penyebab:**
- `data_detail` bukan valid JSON

**Solusi:**
```sql
-- Cek data_detail yang invalid
SELECT id, nomor_surat, data_detail 
FROM document_archives 
WHERE data_detail IS NOT NULL 
AND data_detail::text NOT LIKE '{%';

-- Fix invalid JSON
UPDATE document_archives 
SET data_detail = '{}'::jsonb 
WHERE data_detail IS NULL;
```

---

## 🔧 Quick Fixes

### Fix 1: Reset Status Semua Dokumen
```sql
UPDATE document_archives SET status = 'active';
```

### Fix 2: Tambah Sample Data
```sql
INSERT INTO document_archives (
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nik_subjek, nama_subjek, alamat_subjek,
  data_detail, status
) VALUES (
  '001/TEST/2025', 'SKTM', CURRENT_DATE, 'Test Document',
  '1234567890123456', 'John Doe', 'Jl. Test No. 123',
  '{}'::jsonb, 'active'
);
```

### Fix 3: Clear Cache & Restart
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Fix 4: Check Environment Variables
```bash
# .env.local harus ada:
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

---

## 📊 Debugging Checklist

- [ ] Database connection OK
- [ ] Table `document_archives` exists
- [ ] Table has data (COUNT > 0)
- [ ] Documents have `status = 'active'`
- [ ] API `/api/documents` returns 200
- [ ] API response has `success: true`
- [ ] API response has `data` array
- [ ] Browser console shows no errors
- [ ] Network tab shows successful request
- [ ] User role & kelurahan_id correct

---

## 🚀 Testing Flow

### 1. Create Test Document
```bash
# Via UI:
1. Login sebagai admin/staff
2. Buka /form-surat/sktm
3. Isi form lengkap
4. Klik "Preview"
5. Klik "Proses & Simpan"
6. Tunggu sampai redirect ke /daftar-surat
```

### 2. Verify in Database
```sql
SELECT * FROM document_archives 
ORDER BY created_at DESC 
LIMIT 1;
```

### 3. Verify in UI
```
1. Buka /daftar-surat
2. Seharusnya muncul dokumen baru
3. Coba search dengan nama
4. Coba filter jenis dokumen
5. Coba klik "Lihat" dan "Unduh"
```

---

## 📞 Support

Jika masih ada masalah:

1. **Cek logs:**
   - Browser console
   - Terminal (Next.js server logs)
   - Database logs

2. **Export data untuk debugging:**
   ```sql
   COPY (
     SELECT * FROM document_archives 
     ORDER BY created_at DESC LIMIT 10
   ) TO '/tmp/documents.csv' CSV HEADER;
   ```

3. **Test dengan curl:**
   ```bash
   curl -v http://localhost:3000/api/documents?page=1&limit=10
   ```

4. **Cek file permissions:**
   - Supabase Storage bucket accessible
   - File upload permissions OK
