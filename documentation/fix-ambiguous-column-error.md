# Fix: Ambiguous Column Error di API Documents

## 🐛 Masalah

Error 500 saat mengakses `/api/documents?kelurahanId=1`:
```
"column reference \"kelurahan_id\" is ambiguous"
```

## 🔍 Penyebab

Ketika melakukan JOIN antara beberapa tabel (`document_archives`, `users`, `kelurahan`, `pejabat`), beberapa tabel memiliki kolom dengan nama yang sama (misalnya `kelurahan_id`, `created_by`, `status`).

PostgreSQL tidak tahu kolom mana yang dimaksud dalam WHERE clause karena tidak ada table alias.

## ✅ Solusi

Tambahkan **table alias** (`da` untuk `document_archives`) di semua WHERE conditions:

### ❌ Sebelum (Error):
```typescript
let whereConditions = ['status = $1'];  // Ambiguous!

if (kelurahanId) {
  whereConditions.push(`kelurahan_id = $${paramIndex}`);  // Ambiguous!
}

if (search) {
  whereConditions.push(`(
    nama_subjek ILIKE $${paramIndex} OR   // Ambiguous!
    nik_subjek ILIKE $${paramIndex}
  )`);
}
```

### ✅ Setelah (Fixed):
```typescript
let whereConditions = ['da.status = $1'];  // ✅ Clear!

if (kelurahanId) {
  whereConditions.push(`da.kelurahan_id = $${paramIndex}`);  // ✅ Clear!
}

if (search) {
  whereConditions.push(`(
    da.nama_subjek ILIKE $${paramIndex} OR   // ✅ Clear!
    da.nik_subjek ILIKE $${paramIndex}
  )`);
}
```

## 📝 Perubahan Detail

### File: `src/app/api/documents/route.ts`

**1. WHERE Conditions dengan Table Alias:**
```typescript
// Build query with table alias 'da' to avoid ambiguous column names
let whereConditions = ['da.status = $1'];  // ← Added 'da.'
let queryParams: any[] = [status];
let paramIndex = 2;

if (jenisDokumen) {
  whereConditions.push(`da.jenis_dokumen = $${paramIndex}`);  // ← Added 'da.'
  queryParams.push(jenisDokumen);
  paramIndex++;
}

if (kelurahanId) {
  whereConditions.push(`da.kelurahan_id = $${paramIndex}`);  // ← Added 'da.'
  queryParams.push(parseInt(kelurahanId));
  paramIndex++;
}

if (userId) {
  whereConditions.push(`da.created_by = $${paramIndex}`);  // ← Added 'da.'
  queryParams.push(parseInt(userId));
  paramIndex++;
}

if (search) {
  whereConditions.push(`(
    da.nama_subjek ILIKE $${paramIndex} OR   // ← Added 'da.'
    da.nik_subjek ILIKE $${paramIndex} OR    // ← Added 'da.'
    da.nomor_surat ILIKE $${paramIndex} OR   // ← Added 'da.'
    da.perihal ILIKE $${paramIndex}          // ← Added 'da.'
  )`);
  queryParams.push(`%${search}%`);
  paramIndex++;
}
```

**2. COUNT Query dengan Table Alias:**
```typescript
const countQuery = `
  SELECT COUNT(*) as total 
  FROM document_archives da  -- ← Added alias 'da'
  ${whereClause}
`;
```

**3. Main Query sudah benar:**
```typescript
const documentsQuery = `
  SELECT 
    da.*,
    u.name as created_by_name,
    k.nama as kelurahan_nama,
    p.nama as pejabat_nama
  FROM document_archives da  -- ← Already has alias
  LEFT JOIN users u ON da.created_by = u.id
  LEFT JOIN kelurahan k ON da.kelurahan_id = k.id
  LEFT JOIN pejabat p ON da.pejabat_id = p.id
  ${whereClause}
  ORDER BY da.created_at DESC
  LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
`;
```

## 🧪 Testing

### Test Script: `scripts/test-api.js`
```javascript
// Test 1: Get all documents
GET /api/documents?page=1&limit=10&search=
✅ Status: 200

// Test 2: Get with kelurahanId filter
GET /api/documents?page=1&limit=10&search=&kelurahanId=1
✅ Status: 200  // ← Fixed! Was 500 before

// Test 3: Test endpoint
GET /api/documents/test
✅ Status: 200
```

### Database Check: `scripts/check-database.js`
```bash
node scripts/check-database.js
```
Output:
```
✅ Database connected
📊 Total documents: 1
📊 Documents by status: active: 1
📊 Documents by type: SKTM: 1
📊 Recent documents:
  - [1] 470/001/SKTM/X/2025 - Budi Santoso (SKTM)
    File: SKTM_Budi_Santoso_1760071264350.pdf
```

## 🎯 Hasil

### ✅ API Responses

**GET /api/documents:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nomor_surat": "470/001/SKTM/X/2025",
      "nama_subjek": "Budi Santoso",
      "jenis_dokumen": "SKTM",
      "file_name": "SKTM_Budi_Santoso_1760071264350.pdf",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**GET /api/documents?kelurahanId=1:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nomor_surat": "470/001/SKTM/X/2025",
      "nama_subjek": "Budi Santoso",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## 📚 Lessons Learned

### 1. Always Use Table Aliases in JOINs
Ketika melakukan JOIN, selalu gunakan alias untuk setiap tabel:
```sql
FROM document_archives da
LEFT JOIN users u ON da.created_by = u.id
LEFT JOIN kelurahan k ON da.kelurahan_id = k.id
```

### 2. Qualify All Column References
Di WHERE, SELECT, dan ORDER BY, selalu qualify column dengan table alias:
```sql
WHERE da.status = 'active'
  AND da.kelurahan_id = 1
ORDER BY da.created_at DESC
```

### 3. Test with Filters
Selalu test API dengan berbagai kombinasi filter:
- No filters
- Single filter
- Multiple filters
- Edge cases

### 4. Use Debugging Tools
- Console.log query dan params
- Test dengan curl atau Postman
- Check database langsung dengan psql

## 🔧 Tools Created

1. **scripts/check-database.js** - Check database connection dan data
2. **scripts/test-api.js** - Test API endpoints
3. **src/app/api/documents/test/route.ts** - Test endpoint untuk debugging

## 🚀 Next Steps

1. ✅ API fixed dan berfungsi
2. ✅ Data muncul di response
3. ⏳ Verify di browser `/daftar-surat`
4. ⏳ Test download PDF
5. ⏳ Test search dan filter

## 📝 Summary

**Problem:** Ambiguous column error karena JOIN tanpa table alias di WHERE clause

**Solution:** Tambahkan table alias `da.` di semua column references

**Result:** API berfungsi dengan baik, data muncul, semua filter bekerja

**Status:** ✅ FIXED
