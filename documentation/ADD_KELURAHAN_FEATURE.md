# Add Kelurahan Feature - Admin Only

## ✨ New Feature

Admin sekarang bisa **menambah kelurahan baru** melalui halaman Settings.

## 🎯 Access Control

### Admin
- ✅ Lihat semua kelurahan
- ✅ **Tambah kelurahan baru** (NEW!)
- ✅ Edit kelurahan
- ✅ Hapus kelurahan (via API)

### Staff
- ✅ Lihat kelurahan mereka sendiri
- ✅ Edit kelurahan mereka
- ❌ Tidak bisa tambah kelurahan baru
- ❌ Tidak bisa lihat kelurahan lain

## 🔧 How to Use

### Tambah Kelurahan Baru (Admin)

**Steps:**
1. Login sebagai admin
2. Navigate to `/settings`
3. Tab "Data Kelurahan"
4. Click button **"Tambah Kelurahan"** (pojok kanan atas)
5. Fill form dengan data lengkap
6. Click "Simpan"

### Form Fields

**Required Fields (*):**
- Nama Kelurahan *
- Nama Lengkap *
- Alamat * (textarea)
- Kecamatan *
- Kota *
- Nama Lurah *
- NIP Lurah *

**Optional Fields:**
- Kode Pos
- Telepon
- Email

### Example Data

**Kelurahan Baru:**
```
Nama Kelurahan: KARAWACI
Nama Lengkap: Kelurahan Karawaci
Alamat: Jl. Karawaci Raya No. 100, Karawaci
Kecamatan: Karawaci
Kota: Kota Tangerang
Kode Pos: 15115
Telepon: (021) 5555678
Email: kelkarawaci@tangerangkota.go.id
Nama Lurah: Drs. H. Budi Setiawan, M.Si
NIP Lurah: 197101011995031001
```

## 🔄 Workflow

### Add Kelurahan Flow

```
1. Admin login
   ↓
2. Navigate to /settings
   ↓
3. Tab "Data Kelurahan"
   ↓
4. Click "Tambah Kelurahan"
   ↓
5. Modal form opens (empty)
   ↓
6. Fill all required fields
   ↓
7. Click "Simpan"
   ↓
8. POST /api/kelurahan
   ↓
9. Insert to database
   ↓
10. Success message
   ↓
11. Refresh kelurahan list
   ↓
12. New kelurahan appears in list
```

## 🗄️ Database

### Insert Query

```sql
INSERT INTO kelurahan (
  nama, nama_lengkap, alamat, kecamatan, kota, 
  kode_pos, telepon, email, nama_lurah, nip_lurah
) VALUES (
  'KARAWACI',
  'Kelurahan Karawaci',
  'Jl. Karawaci Raya No. 100, Karawaci',
  'Karawaci',
  'Kota Tangerang',
  '15115',
  '(021) 5555678',
  'kelkarawaci@tangerangkota.go.id',
  'Drs. H. Budi Setiawan, M.Si',
  '197101011995031001'
);
```

### Verify

```sql
-- Check new kelurahan
SELECT * FROM kelurahan ORDER BY created_at DESC LIMIT 1;

-- Count total kelurahan
SELECT COUNT(*) FROM kelurahan;
```

## 🎨 UI Changes

### Before
```
┌─────────────────────────────────────┐
│ Data Kelurahan                      │
├─────────────────────────────────────┤
│ [Kelurahan Card 1]                  │
│ [Kelurahan Card 2]                  │
└─────────────────────────────────────┘
```

### After (Admin)
```
┌─────────────────────────────────────┐
│ Data Kelurahan    [Tambah Kelurahan]│
├─────────────────────────────────────┤
│ [Kelurahan Card 1]                  │
│ [Kelurahan Card 2]                  │
└─────────────────────────────────────┘
```

### Modal Form
```
┌─────────────────────────────────────┐
│ Tambah Kelurahan Baru          [×]  │
├─────────────────────────────────────┤
│ Nama Kelurahan: [____________]      │
│ Nama Lengkap:   [____________]      │
│ Alamat:         [____________]      │
│                 [____________]      │
│ Kecamatan:      [______] Kota: [___]│
│ Kode Pos:       [______] Telp: [___]│
│ Email:          [____________]      │
│ Nama Lurah:     [____________]      │
│ NIP Lurah:      [____________]      │
│                                     │
│ [Simpan] [Batal]                   │
└─────────────────────────────────────┘
```

## 🧪 Testing

### Test 1: Add New Kelurahan (Admin)

**Steps:**
1. Login as admin@cibodas.go.id
2. Navigate to `/settings`
3. Tab "Data Kelurahan"
4. Click "Tambah Kelurahan"
5. Fill form:
   - Nama: KARAWACI
   - Nama Lengkap: Kelurahan Karawaci
   - Alamat: Jl. Karawaci Raya No. 100
   - Kecamatan: Karawaci
   - Kota: Kota Tangerang
   - Kode Pos: 15115
   - Telepon: (021) 5555678
   - Email: kelkarawaci@tangerangkota.go.id
   - Nama Lurah: Drs. H. Budi Setiawan, M.Si
   - NIP Lurah: 197101011995031001
6. Click "Simpan"

**Expected:**
- ✅ Success message appears
- ✅ Modal closes
- ✅ New kelurahan card appears in list
- ✅ Data saved to database

**Verify in Database:**
```sql
SELECT * FROM kelurahan WHERE nama = 'KARAWACI';
```

### Test 2: Validation

**Steps:**
1. Click "Tambah Kelurahan"
2. Leave required fields empty
3. Click "Simpan"

**Expected:**
- ❌ Form validation error
- ❌ Cannot submit
- ❌ Required fields highlighted

### Test 3: Staff Cannot Add

**Steps:**
1. Login as staff
2. Navigate to `/settings`
3. Tab "Data Kelurahan"

**Expected:**
- ❌ No "Tambah Kelurahan" button
- ✅ Only see their kelurahan
- ✅ Can only edit their kelurahan

### Test 4: Duplicate Name

**Steps:**
1. Try to add kelurahan with existing name
2. Click "Simpan"

**Expected:**
- ❌ Error: "Kelurahan name already exists"
- ❌ Not saved to database

## 🔒 Security

### Validation
- Required fields checked
- Nama must be unique
- Admin role required

### API Protection
```typescript
// POST /api/kelurahan
// Only admin can create
```

## 📊 Use Cases

### Use Case 1: Ekspansi Wilayah
Kecamatan menambah kelurahan baru → Admin tambah via settings

### Use Case 2: Pemekaran Kelurahan
Kelurahan lama dipecah jadi 2 → Admin tambah kelurahan baru

### Use Case 3: Data Migration
Import data dari sistem lama → Admin tambah satu per satu

## 🎯 Benefits

### For Admin
- ✅ Mudah tambah kelurahan baru
- ✅ Tidak perlu akses database
- ✅ Form validation otomatis
- ✅ UI user-friendly

### For System
- ✅ Data konsisten
- ✅ Validation di backend
- ✅ Audit trail (created_at)
- ✅ Scalable

## 📈 Statistics

### Current Kelurahan
- 6 kelurahan (from seed.sql)
- Can add unlimited kelurahan

### Typical Kecamatan
- 5-10 kelurahan per kecamatan
- Kecamatan Cibodas: 6 kelurahan

## 🔄 Related Features

### After Adding Kelurahan
1. **Add Staff** - Assign staff to new kelurahan
2. **Add Pejabat** - Add officials for new kelurahan
3. **Manage Documents** - Process documents for new kelurahan

## 📝 API Endpoint

### POST /api/kelurahan

**Request:**
```json
{
  "nama": "KARAWACI",
  "nama_lengkap": "Kelurahan Karawaci",
  "alamat": "Jl. Karawaci Raya No. 100, Karawaci",
  "kecamatan": "Karawaci",
  "kota": "Kota Tangerang",
  "kode_pos": "15115",
  "telepon": "(021) 5555678",
  "email": "kelkarawaci@tangerangkota.go.id",
  "nama_lurah": "Drs. H. Budi Setiawan, M.Si",
  "nip_lurah": "197101011995031001"
}
```

**Response (Success):**
```json
{
  "id": 7,
  "nama": "KARAWACI",
  "nama_lengkap": "Kelurahan Karawaci",
  ...
  "created_at": "2025-01-08T10:00:00Z"
}
```

**Response (Error):**
```json
{
  "error": "Field 'nama' is required"
}
```

## ✅ Checklist

- [x] Add button for admin
- [x] Modal form (create mode)
- [x] Form validation
- [x] POST API endpoint
- [x] Database insert
- [x] Success message
- [x] Refresh list
- [x] Access control (admin only)
- [x] Error handling

---

**Status**: ✅ Add Kelurahan Feature Complete
**Version**: 1.0.0
**Last Updated**: 2025-01-08

Admin sekarang bisa menambah kelurahan baru melalui halaman Settings!
