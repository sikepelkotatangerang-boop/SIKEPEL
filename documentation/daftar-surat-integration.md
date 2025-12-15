# Daftar Surat - Integration Guide

## 📋 Overview

Halaman Daftar Surat menampilkan semua dokumen yang tersimpan di table `document_archives`, termasuk Surat Pindah Keluar.

## ✅ Integration Checklist

Untuk menambahkan jenis surat baru ke Daftar Surat, pastikan:

### 1. **Database Save**
- ✅ Data tersimpan di table `document_archives`
- ✅ Field `jenis_dokumen` terisi dengan nama yang konsisten
- ✅ Field `google_drive_url` atau `storage_url` terisi dengan URL file

### 2. **Filter Dropdown**
- ✅ Tambahkan option di dropdown filter
- ✅ Value harus sama persis dengan `jenis_dokumen` di database

### 3. **Badge Color**
- ✅ Tambahkan warna badge untuk jenis dokumen baru
- ✅ Gunakan warna yang berbeda dari yang sudah ada

## 🔧 Implementation

### File: `src/app/daftar-surat/page.tsx`

#### **1. Add to Filter Dropdown**

```tsx
<select
  value={filterJenis}
  onChange={(e) => setFilterJenis(e.target.value)}
  className="..."
>
  <option value="">Semua Jenis Dokumen</option>
  <option value="SKTM">SKTM</option>
  <option value="Domisili">Domisili</option>
  <option value="Usaha">Usaha</option>
  <option value="Kelahiran">Kelahiran</option>
  <option value="Surat Pindah Keluar">Surat Pindah Keluar</option>
  <!-- Add new document type here -->
</select>
```

#### **2. Add Badge Color**

```tsx
const getJenisBadgeColor = (jenis: string) => {
  const colors: Record<string, string> = {
    'SKTM': 'bg-yellow-100 text-yellow-800',
    'Domisili': 'bg-blue-100 text-blue-800',
    'Usaha': 'bg-green-100 text-green-800',
    'Kelahiran': 'bg-purple-100 text-purple-800',
    'Surat Pindah Keluar': 'bg-red-100 text-red-800',
    // Add new document type color here
  };
  return colors[jenis] || 'bg-gray-100 text-gray-800';
};
```

## 🎨 Available Badge Colors

| Color | Class | Best For |
|-------|-------|----------|
| Yellow | `bg-yellow-100 text-yellow-800` | SKTM, Keterangan |
| Blue | `bg-blue-100 text-blue-800` | Domisili, Pengantar |
| Green | `bg-green-100 text-green-800` | Usaha, Izin |
| Purple | `bg-purple-100 text-purple-800` | Kelahiran, Kematian |
| Red | `bg-red-100 text-red-800` | Pindah, Urgent |
| Orange | `bg-orange-100 text-orange-800` | Peringatan |
| Pink | `bg-pink-100 text-pink-800` | Pernikahan |
| Indigo | `bg-indigo-100 text-indigo-800` | Resmi |
| Gray | `bg-gray-100 text-gray-800` | Default/Lainnya |

## 📊 Database Query

API endpoint: `/api/documents`

Query dari table `document_archives`:

```sql
SELECT 
  da.*,
  u.name as created_by_name,
  k.nama as kelurahan_nama,
  p.nama as pejabat_nama
FROM document_archives da
LEFT JOIN users u ON da.created_by = u.id
LEFT JOIN kelurahan k ON da.kelurahan_id = k.id
LEFT JOIN pejabat p ON da.pejabat_id = p.id
WHERE da.status = 'active'
  AND da.jenis_dokumen = 'Surat Pindah Keluar'  -- Filter by type
ORDER BY da.created_at DESC
LIMIT 10 OFFSET 0;
```

## 🔍 Troubleshooting

### Dokumen Tidak Muncul di Daftar

**Check:**

1. **Database**
   ```sql
   SELECT * FROM document_archives 
   WHERE jenis_dokumen = 'Surat Pindah Keluar' 
   ORDER BY created_at DESC;
   ```
   - Apakah data ada?
   - Apakah `status = 'active'`?
   - Apakah `jenis_dokumen` terisi?

2. **Filter Dropdown**
   - Apakah option sudah ditambahkan?
   - Apakah value sama dengan database?
   - Case-sensitive! "Surat Pindah Keluar" ≠ "surat pindah keluar"

3. **API Response**
   - Check browser console
   - Look for API errors
   - Verify response data

4. **Kelurahan Filter**
   - Jika user role = 'staff', hanya dokumen dari kelurahan mereka yang muncul
   - Verify `kelurahan_id` di database

### Badge Tidak Berwarna

**Check:**

1. Apakah warna sudah ditambahkan di `getJenisBadgeColor()`?
2. Apakah nama jenis dokumen sama persis?
3. Clear browser cache

### File Tidak Bisa Didownload

**Check:**

1. **Storage URL**
   ```sql
   SELECT google_drive_url, storage_url, file_name 
   FROM document_archives 
   WHERE id = 123;
   ```

2. **Supabase Storage**
   - Buka bucket `pdf_surat`
   - Verify file exists
   - Check public access

3. **Download Priority**
   - Priority 1: `storage_url` (Supabase Storage URL)
   - Priority 2: `google_drive_url` (Supabase public URL)
   - Priority 3: `/api/documents/download?fileName=...`
   - Priority 4: `google_drive_url` (legacy)

## 📝 Example: Adding New Document Type

### Step 1: Save to Database

```typescript
// In your API route
const archiveValues = [
  formData.nomor_surat,
  'Surat Keterangan Domisili',  // ← jenis_dokumen
  new Date(),
  'Surat Keterangan Domisili',
  formData.nik,
  formData.nama,
  formData.alamat,
  JSON.stringify(dataDetail),
  googleDriveId,
  googleDriveUrl,
  fileName,
  pdfBuffer.length,
  'application/pdf',
  userId,
  'active'
];
```

### Step 2: Add to Filter

```tsx
<option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
```

### Step 3: Add Badge Color

```tsx
'Surat Keterangan Domisili': 'bg-blue-100 text-blue-800',
```

### Step 4: Test

1. Create document
2. Check database
3. Refresh Daftar Surat
4. Verify document appears
5. Test filter
6. Test download

## 🎯 Best Practices

### 1. **Consistent Naming**
- Use exact same name everywhere
- Case-sensitive
- No trailing spaces

### 2. **Unique Colors**
- Don't reuse colors for different types
- Use colors that make sense (red for urgent, green for approved, etc.)

### 3. **Database Fields**
- Always fill `jenis_dokumen`
- Always fill `google_drive_url` or `storage_url`
- Always set `status = 'active'`

### 4. **Testing**
- Test with different user roles
- Test with different kelurahan
- Test filter functionality
- Test download functionality

## 📚 Related Files

- **Frontend**: `src/app/daftar-surat/page.tsx`
- **API**: `src/app/api/documents/route.ts`
- **Database**: Table `document_archives`
- **Storage**: Supabase bucket `pdf_surat`

## 🔗 Integration Points

### Form → Database → Daftar Surat

```
1. User fills form
   ↓
2. Submit to API (e.g., /api/process-pindah-keluar)
   ↓
3. Generate PDF with ConvertAPI
   ↓
4. Upload to Supabase Storage
   ↓
5. Save to database (document_archives)
   ↓
6. Document appears in Daftar Surat
```

### Required Fields for Display

```typescript
interface Document {
  id: number;
  nomor_surat: string;
  jenis_dokumen: string;        // ← REQUIRED for filter
  tanggal_surat: string;
  nama_subjek: string;
  google_drive_url: string;     // ← REQUIRED for download
  created_at: string;
  // ... other fields
}
```

---

**Last Updated**: 2025-01-20
**Current Document Types**: SKTM, Domisili, Usaha, Kelahiran, Surat Pindah Keluar
**Status**: ✅ Surat Pindah Keluar Integrated
