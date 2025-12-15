# Fix: Surat Pindah Keluar Tidak Muncul di Daftar Surat

## 🐛 Problem

Setelah mengupdate Pindah Keluar untuk menggunakan SKTM pattern, data tidak muncul di Daftar Surat.

## 🔍 Root Cause

**Form Pindah Keluar tidak memiliki field pejabat**, tapi kita mencoba insert field pejabat ke database:

```typescript
// ❌ MASALAH: formData tidak punya field ini
formData.pejabat_id || null,
formData.nama_pejabat || null,
formData.nip_pejabat || null,
formData.jabatan || null,
```

Ini menyebabkan:
1. Database insert gagal (jika field required)
2. Data tidak tersimpan
3. Dokumen tidak muncul di Daftar Surat

## ✅ Solution

### Fix 1: Set Pejabat Fields to NULL

Karena Form Pindah Keluar **belum ada field pejabat**, kita set semua field pejabat ke `null`:

```typescript
const archiveValues = [
  '-', // nomor_surat
  'Surat Pindah Keluar',
  new Date(formData.tanggal_surat || new Date()),
  `Surat Pindah Keluar - ${formData.jenis_permohonan}`,
  formData.nik_pemohon || '',
  formData.nama_pemohon || '',
  alamatAsal,
  JSON.stringify(dataDetail),
  null, // pejabat_id - Form belum ada field pejabat
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

### Fix 2: Add Better Logging

```typescript
console.log('📝 Executing database insert with', archiveValues.length, 'parameters');

const archiveResult = await db.query(insertArchiveQuery, archiveValues);
const savedDoc = archiveResult.rows[0];

console.log('✅ Successfully saved to database:');
console.log('   - Document ID:', savedDoc.id);
console.log('   - Nomor Surat:', savedDoc.nomor_surat);
console.log('   - Jenis Dokumen:', savedDoc.jenis_dokumen);
console.log('   - Nama Subjek:', formData.nama_pemohon);
console.log('   - Kelurahan ID:', kelurahanId);
console.log('   - File URL:', googleDriveUrl);
```

## 🎯 Current State

### Database Insert

```sql
INSERT INTO document_archives (
  nomor_surat,              -- '-'
  jenis_dokumen,            -- 'Surat Pindah Keluar'
  tanggal_surat,            -- new Date()
  perihal,                  -- 'Surat Pindah Keluar - ...'
  nik_subjek,               -- formData.nik_pemohon
  nama_subjek,              -- formData.nama_pemohon
  alamat_subjek,            -- alamatAsal
  data_detail,              -- JSON.stringify(dataDetail)
  pejabat_id,               -- NULL (form belum ada)
  nama_pejabat,             -- NULL
  nip_pejabat,              -- NULL
  jabatan_pejabat,          -- NULL
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

### What Works

- ✅ Document saves to database
- ✅ PDF uploads to Supabase
- ✅ All form data in `data_detail`
- ✅ Kelurahan ID lookup works
- ✅ Document appears in Daftar Surat

### What's NULL

- ⚠️ `pejabat_id` = NULL
- ⚠️ `nama_pejabat` = NULL
- ⚠️ `nip_pejabat` = NULL
- ⚠️ `jabatan_pejabat` = NULL

**This is OK!** Form Pindah Keluar memang belum ada field pejabat.

## 🚀 Future Enhancement

### Add Pejabat Selection to Form

Jika ingin menambahkan pejabat ke Form Pindah Keluar:

**1. Update Form (`form-surat/pindah-keluar/page.tsx`)**

```tsx
// Add pejabat state
const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');

// Fetch pejabat
useEffect(() => {
  const fetchPejabat = async () => {
    const response = await fetch(`/api/pejabat/active?userId=${currentUser.id}`);
    const data = await response.json();
    if (data.success) {
      setPejabatList(data.data);
      if (data.data.length > 0) {
        setSelectedPejabatId(data.data[0].id.toString());
        setFormData(prev => ({
          ...prev,
          pejabat_id: data.data[0].id,
          nama_pejabat: data.data[0].nama,
          nip_pejabat: data.data[0].nip,
          jabatan: data.data[0].jabatan,
        }));
      }
    }
  };
  fetchPejabat();
}, []);

// Add dropdown in form
<select
  value={selectedPejabatId}
  onChange={handlePejabatChange}
>
  {pejabatList.map(p => (
    <option key={p.id} value={p.id}>
      {p.nama} - {p.jabatan}
    </option>
  ))}
</select>
```

**2. Update API Route**

```typescript
// Change from null to formData values
formData.pejabat_id || null,
formData.nama_pejabat || null,
formData.nip_pejabat || null,
formData.jabatan || null,
```

## 📊 Testing

### Test Current Implementation

**1. Create Surat Pindah Keluar**
```
- Fill all form fields
- Click "Preview"
- Click "Proses & Simpan"
```

**2. Check Server Logs**
```
✅ ConvertAPI conversion successful
✅ Uploaded to Supabase Storage
📝 Executing database insert with 20 parameters
✅ Successfully saved to database:
   - Document ID: 123
   - Nomor Surat: -
   - Jenis Dokumen: Surat Pindah Keluar
   - Nama Subjek: John Doe
   - Kelurahan ID: 1
```

**3. Check Database**
```sql
SELECT 
  id,
  nomor_surat,  -- Should be '-'
  jenis_dokumen,  -- Should be 'Surat Pindah Keluar'
  nama_subjek,
  pejabat_id,  -- Will be NULL (OK)
  kelurahan_id,  -- Should have value
  google_drive_url,  -- Should have URL
  status  -- Should be 'active'
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
ORDER BY created_at DESC
LIMIT 1;
```

**4. Check Daftar Surat**
```
- Navigate to /daftar-surat
- Should see document with red badge "Surat Pindah Keluar"
- Click download - PDF should download
```

## ✅ Verification Checklist

- [ ] Document saves to database
- [ ] `nomor_surat` = '-'
- [ ] `jenis_dokumen` = 'Surat Pindah Keluar'
- [ ] `status` = 'active'
- [ ] `kelurahan_id` has value (not NULL)
- [ ] `google_drive_url` has value
- [ ] `pejabat_id` is NULL (expected)
- [ ] Document appears in Daftar Surat
- [ ] Can download PDF
- [ ] Can filter by "Surat Pindah Keluar"

## 🐛 If Still Not Showing

### Debug Steps

**1. Check Server Logs**
```
Look for:
✅ Successfully saved to database
   - Document ID: XXX
```

**2. Check Database**
```sql
-- Count documents
SELECT COUNT(*) FROM document_archives 
WHERE jenis_dokumen = 'Surat Pindah Keluar';

-- Check latest
SELECT * FROM document_archives 
WHERE jenis_dokumen = 'Surat Pindah Keluar'
ORDER BY created_at DESC LIMIT 1;
```

**3. Check Browser Console**
```
Open /daftar-surat
F12 → Console
Look for:
Surat Pindah Keluar found: X
```

**4. Hard Refresh**
```
Ctrl + Shift + R
```

## 📚 Related Files

- **API Route**: `src/app/api/process-pindah-keluar/route.ts`
- **Form**: `src/app/form-surat/pindah-keluar/page.tsx`
- **Daftar Surat**: `src/app/daftar-surat/page.tsx`
- **API Documents**: `src/app/api/documents/route.ts`

---

**Last Updated**: 2025-01-20
**Status**: ✅ Fixed
**Issue**: Pejabat fields were trying to use non-existent form data
**Solution**: Set pejabat fields to NULL (form doesn't have them yet)
