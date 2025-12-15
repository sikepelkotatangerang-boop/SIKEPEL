# Pindah Keluar - Nomor Surat Configuration

## 📋 Current Configuration

### Nomor Surat Field

**Value:** `nama_pemohon`

```typescript
const archiveValues = [
  formData.nama_pemohon || '-', // nomor_surat: gunakan nama pemohon
  'Surat Pindah Keluar',
  // ... other fields
];
```

## 📊 Database Storage

### Example

**Input:**
```json
{
  "nama_pemohon": "John Doe",
  "nik_pemohon": "1234567890123456",
  // ... other fields
}
```

**Database:**
```sql
INSERT INTO document_archives (
  nomor_surat,    -- 'John Doe'
  jenis_dokumen,  -- 'Surat Pindah Keluar'
  nama_subjek,    -- 'John Doe'
  // ...
)
```

**Result:**
- `nomor_surat` = "John Doe"
- `nama_subjek` = "John Doe"

## 🎯 Use Cases

### 1. Search by Name

```sql
SELECT * FROM document_archives
WHERE nomor_surat ILIKE '%John%'
  AND jenis_dokumen = 'Surat Pindah Keluar';
```

### 2. Display in Daftar Surat

```
┌─────────────────────────────────────────┐
│ [Surat Pindah Keluar]                   │
│                                         │
│ No. Surat: John Doe                     │
│ Nama: John Doe                          │
│ Tanggal: 20 Januari 2025                │
└─────────────────────────────────────────┘
```

### 3. Filter & Sort

```sql
-- Sort by name (via nomor_surat)
SELECT * FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
ORDER BY nomor_surat ASC;
```

## 🔄 Alternative Configurations

### Option 1: Use NIK (Current Alternative)

```typescript
formData.nik_pemohon || '-'
```

**Pros:**
- ✅ Unique identifier
- ✅ No duplicates

**Cons:**
- ❌ Not human-readable
- ❌ Hard to search by name

### Option 2: Use No KK

```typescript
formData.no_kk_pemohon || '-'
```

**Pros:**
- ✅ Unique per family
- ✅ Official document number

**Cons:**
- ❌ Not human-readable
- ❌ Multiple people same KK

### Option 3: Use "-" (SKTM Pattern)

```typescript
'-'
```

**Pros:**
- ✅ Consistent with SKTM
- ✅ Ready for auto-generation

**Cons:**
- ❌ Not searchable
- ❌ Not informative

### Option 4: Use Nama Pemohon (CURRENT)

```typescript
formData.nama_pemohon || '-'
```

**Pros:**
- ✅ Human-readable
- ✅ Easy to search
- ✅ Informative in lists

**Cons:**
- ⚠️ Not unique (same name possible)
- ⚠️ No auto-numbering

### Option 5: Auto-Generate Number

```typescript
`PKL/${new Date().getFullYear()}/${String(counter).padStart(4, '0')}`
// Example: PKL/2025/0001
```

**Pros:**
- ✅ Unique
- ✅ Sequential
- ✅ Professional

**Cons:**
- ❌ Requires counter table
- ❌ More complex implementation

## 📝 Implementation Details

### Current Code

**File:** `src/app/api/process-pindah-keluar/route.ts`

```typescript
const archiveValues = [
  formData.nama_pemohon || '-', // nomor_surat
  'Surat Pindah Keluar',
  new Date(formData.tanggal_surat || new Date()),
  `Surat Pindah Keluar - ${formData.jenis_permohonan}`,
  formData.nik_pemohon || '',
  formData.nama_pemohon || '',
  alamatAsal,
  JSON.stringify(dataDetail),
  null, // pejabat_id
  null, // nama_pejabat
  null, // nip_pejabat
  null, // jabatan_pejabat
  googleDriveId,
  googleDriveUrl,
  fileName,
  pdfBuffer.length,
  'application/pdf',
  kelurahanId || null,
  userId || null,
  'active'
];
```

### Fallback

If `nama_pemohon` is empty, fallback to `"-"`:

```typescript
formData.nama_pemohon || '-'
```

## 🔍 Query Examples

### Search by Name

```sql
SELECT * FROM document_archives
WHERE nomor_surat ILIKE '%doe%'
  AND jenis_dokumen = 'Surat Pindah Keluar';
```

### Get All Pindah Keluar

```sql
SELECT 
  id,
  nomor_surat,  -- Will show nama_pemohon
  nama_subjek,
  tanggal_surat,
  created_at
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
ORDER BY created_at DESC;
```

### Check Duplicates

```sql
SELECT 
  nomor_surat,
  COUNT(*) as count
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
GROUP BY nomor_surat
HAVING COUNT(*) > 1;
```

## ⚠️ Considerations

### Duplicate Names

**Problem:**
Multiple people with same name will have same `nomor_surat`.

**Example:**
```
nomor_surat: "John Doe" (Person 1)
nomor_surat: "John Doe" (Person 2)
```

**Solution:**
Use NIK or other fields to differentiate:

```sql
SELECT * FROM document_archives
WHERE nomor_surat = 'John Doe'
  AND nik_subjek = '1234567890123456';
```

### Search Functionality

**Current:**
Search by `nomor_surat` will search by name.

```typescript
// In API
WHERE nomor_surat ILIKE '%search%'
```

This is **good** because users can search by name easily.

## 🚀 Future Enhancements

### Auto-Generate Unique Number

If you want unique sequential numbers:

**1. Create Counter Table**

```sql
CREATE TABLE document_counters (
  id SERIAL PRIMARY KEY,
  jenis_dokumen VARCHAR(100) UNIQUE,
  tahun INTEGER,
  counter INTEGER DEFAULT 0,
  UNIQUE(jenis_dokumen, tahun)
);
```

**2. Update API Route**

```typescript
// Get or create counter
const counterResult = await db.query(`
  INSERT INTO document_counters (jenis_dokumen, tahun, counter)
  VALUES ('Surat Pindah Keluar', $1, 1)
  ON CONFLICT (jenis_dokumen, tahun)
  DO UPDATE SET counter = document_counters.counter + 1
  RETURNING counter
`, [new Date().getFullYear()]);

const counter = counterResult.rows[0].counter;
const nomorSurat = `PKL/${new Date().getFullYear()}/${String(counter).padStart(4, '0')}`;
// Example: PKL/2025/0001
```

**3. Use in archiveValues**

```typescript
const archiveValues = [
  nomorSurat, // PKL/2025/0001
  'Surat Pindah Keluar',
  // ...
];
```

## 📚 Related Documentation

- **Database Flow**: `documentation/pindah-keluar-database-flow.md`
- **SKTM Pattern**: `documentation/pindah-keluar-sktm-pattern.md`
- **API Route**: `src/app/api/process-pindah-keluar/route.ts`

---

**Last Updated**: 2025-01-20
**Current Value**: `nama_pemohon`
**Fallback**: `"-"`
**Status**: ✅ Implemented
