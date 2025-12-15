# Fix: Statistik API 500 Error untuk Admin

## 🐛 Problem

```
XHRGET http://localhost:3000/api/statistik?view_mode=bulan-ini
[HTTP/1.1 500 Internal Server Error 157ms]
```

Error terjadi ketika **user Admin** mengakses halaman Statistik.

## 🔍 Root Cause

### Invalid SQL Query

**Sebelumnya:**
```typescript
const whereClause = kelurahanId ? 'WHERE kelurahan_id = $1' : '';
const dateFilter = "AND DATE_TRUNC('month', created_at) = ...";

const query = `
  SELECT ... FROM document_archives
  ${whereClause} ${dateFilter}  -- ❌ MASALAH!
`;
```

**Ketika Admin (tanpa kelurahan_id):**
```sql
SELECT ... FROM document_archives
 AND DATE_TRUNC('month', created_at) = ...
-- ❌ SQL Error: AND without WHERE!
```

**Ketika Staff (dengan kelurahan_id):**
```sql
SELECT ... FROM document_archives
WHERE kelurahan_id = $1 AND DATE_TRUNC('month', created_at) = ...
-- ✅ Valid SQL
```

### Why It Happened

1. Admin tidak punya `kelurahan_id` (lihat semua data)
2. `whereClause` jadi empty string `''`
3. `dateFilter` mulai dengan `AND`
4. SQL jadi: `FROM document_archives AND ...` ❌
5. PostgreSQL error: syntax error

## ✅ Solution

### Build WHERE Clause Dynamically

**Sekarang:**
```typescript
// Remove "AND" prefix from dateFilter
let dateFilter = '';
switch (viewMode) {
    case 'hari-ini':
        dateFilter = "DATE(created_at) = CURRENT_DATE";  // No AND
        break;
    case 'bulan-ini':
        dateFilter = "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)";
        break;
    case 'tahun-ini':
        dateFilter = "DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)";
        break;
}

// Build WHERE clause properly
let whereConditions = [];
if (hasKelurahanFilter) {
    whereConditions.push('kelurahan_id = $1');
}
if (dateFilter) {
    whereConditions.push(dateFilter);
}
const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';
```

### Result

**Admin (no kelurahan_id):**
```sql
SELECT ... FROM document_archives
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
-- ✅ Valid!
```

**Staff (with kelurahan_id):**
```sql
SELECT ... FROM document_archives
WHERE kelurahan_id = $1 AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
-- ✅ Valid!
```

**Admin without date filter (all data):**
```sql
SELECT ... FROM document_archives
-- ✅ Valid! (no WHERE clause)
```

## 🔧 Changes Made

### 1. Per Jenis Query

**Before:**
```typescript
const whereClause = kelurahanId ? 'WHERE kelurahan_id = $1' : '';
const dateFilter = "AND DATE_TRUNC('month', created_at) = ...";

const perJenisQuery = `
  SELECT ... FROM document_archives
  ${whereClause} ${dateFilter}
`;
```

**After:**
```typescript
let whereConditions = [];
if (hasKelurahanFilter) {
    whereConditions.push('kelurahan_id = $1');
}
if (dateFilter) {
    whereConditions.push(dateFilter);
}
const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';

const perJenisQuery = `
  SELECT ... FROM document_archives
  ${whereClause}
`;
```

### 2. Trend Query

**Before:**
```typescript
trendQuery = `
  SELECT ... FROM document_archives
  ${whereClause} AND DATE(created_at) = CURRENT_DATE
`;
```

**After:**
```typescript
let trendWhereConditions = [];
if (hasKelurahanFilter) {
    trendWhereConditions.push('kelurahan_id = $1');
}
if (trendDateFilter) {
    trendWhereConditions.push(trendDateFilter);
}
const trendWhereClause = trendWhereConditions.length > 0 
    ? `WHERE ${trendWhereConditions.join(' AND ')}` 
    : '';

trendQuery = `
  SELECT ... FROM document_archives
  ${trendWhereClause}
`;
```

### 3. Total Query

**Before:**
```typescript
const totalQuery = `
  SELECT 
    COUNT(*) as total_tahun_ini,  -- ❌ All time, not this year!
    ...
  FROM document_archives
  ${whereClause}
`;
```

**After:**
```typescript
const totalWhereClause = hasKelurahanFilter ? 'WHERE kelurahan_id = $1' : '';

const totalQuery = `
  SELECT 
    COUNT(*) FILTER (WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)) as total_tahun_ini,
    COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as total_bulan_ini,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as total_hari_ini
  FROM document_archives
  ${totalWhereClause}
`;
```

**Bonus Fix:** `total_tahun_ini` sekarang benar-benar count tahun ini (bukan all time).

### 4. Add Logging

```typescript
console.log('📊 Statistik API called:');
console.log('   - kelurahan_id:', kelurahanId || 'ALL (Admin)');
console.log('   - view_mode:', viewMode);
```

## 📊 Test Cases

### Test 1: Admin - Bulan Ini

**Request:**
```
GET /api/statistik?view_mode=bulan-ini
```

**Expected SQL:**
```sql
-- Per Jenis
SELECT jenis_dokumen, COUNT(*) as jumlah
FROM document_archives
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY jenis_dokumen;

-- Trend
SELECT TO_CHAR(created_at, 'DD Mon') as label, COUNT(*) as jumlah
FROM document_archives
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(created_at), TO_CHAR(created_at, 'DD Mon')
ORDER BY DATE(created_at);

-- Total
SELECT 
  COUNT(*) FILTER (WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)) as total_tahun_ini,
  COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as total_bulan_ini,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as total_hari_ini
FROM document_archives;
```

**Expected Result:** ✅ 200 OK

### Test 2: Staff - Hari Ini

**Request:**
```
GET /api/statistik?kelurahan_id=1&view_mode=hari-ini
```

**Expected SQL:**
```sql
-- Per Jenis
SELECT jenis_dokumen, COUNT(*) as jumlah
FROM document_archives
WHERE kelurahan_id = $1 AND DATE(created_at) = CURRENT_DATE
GROUP BY jenis_dokumen;

-- Trend
SELECT TO_CHAR(created_at, 'HH24:00') as label, COUNT(*) as jumlah
FROM document_archives
WHERE kelurahan_id = $1 AND DATE(created_at) = CURRENT_DATE
GROUP BY TO_CHAR(created_at, 'HH24:00')
ORDER BY label;

-- Total
SELECT ...
FROM document_archives
WHERE kelurahan_id = $1;
```

**Expected Result:** ✅ 200 OK

### Test 3: Admin - Tahun Ini

**Request:**
```
GET /api/statistik?view_mode=tahun-ini
```

**Expected SQL:**
```sql
WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)
```

**Expected Result:** ✅ 200 OK

## 🎯 Verification

### Check Server Logs

```
📊 Statistik API called:
   - kelurahan_id: ALL (Admin)
   - view_mode: bulan-ini
```

### Check Response

```json
{
  "success": true,
  "data": {
    "perJenis": [
      { "jenis": "SKTM", "jumlah": 10 },
      { "jenis": "Surat Pindah Keluar", "jumlah": 5 }
    ],
    "trend": [
      { "label": "01 Jan", "jumlah": 2 },
      { "label": "02 Jan", "jumlah": 3 }
    ],
    "totals": {
      "tahun_ini": 50,
      "bulan_ini": 15,
      "hari_ini": 2
    }
  }
}
```

### Check UI

- ✅ Statistik page loads without error
- ✅ Charts display data
- ✅ Totals show correct numbers
- ✅ Can switch between hari-ini, bulan-ini, tahun-ini

## 🐛 Related Issues

### Issue 1: total_tahun_ini was All Time

**Before:**
```sql
COUNT(*) as total_tahun_ini  -- All time!
```

**After:**
```sql
COUNT(*) FILTER (WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)) as total_tahun_ini
```

Now correctly counts only this year.

## 📚 Related Files

- **API Route**: `src/app/api/statistik/route.ts`
- **Statistik Page**: `src/app/statistik/page.tsx`
- **Database**: Table `document_archives`

## 🚀 Testing Checklist

- [ ] Admin can access statistik page
- [ ] No 500 error
- [ ] Data displays correctly
- [ ] Can switch view modes (hari-ini, bulan-ini, tahun-ini)
- [ ] Staff can access with kelurahan filter
- [ ] Charts render properly
- [ ] Totals are accurate

---

**Last Updated**: 2025-01-20
**Issue**: SQL syntax error when admin accesses statistik
**Root Cause**: Orphaned AND in WHERE clause
**Solution**: Build WHERE clause dynamically
**Status**: ✅ Fixed
