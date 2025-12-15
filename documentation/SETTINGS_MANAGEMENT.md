# Settings - Kelurahan & Pejabat Management

## 🎯 Overview

Halaman **Pengaturan** (`/settings`) digunakan untuk mengelola:
1. **Data Kelurahan** - Nama, alamat, kontak, lurah
2. **Data Pejabat** - Nama, NIP, jabatan per kelurahan

## 🔐 Access Control

### Admin
- ✅ Lihat & edit semua kelurahan
- ✅ Lihat & manage semua pejabat
- ✅ Tambah/edit/hapus pejabat di semua kelurahan

### Staff
- ✅ Lihat & edit kelurahan mereka sendiri
- ✅ Lihat & manage pejabat di kelurahan mereka
- ✅ Tambah/edit/hapus pejabat di kelurahan mereka
- ❌ Tidak bisa akses kelurahan lain

## ✨ Features

### 1. Data Kelurahan

#### View Kelurahan
- Display semua data kelurahan
- Card layout dengan informasi lengkap:
  - Nama & Nama Lengkap
  - Alamat lengkap
  - Kecamatan & Kota
  - Kode Pos, Telepon, Email
  - Nama Lurah & NIP Lurah

#### Edit Kelurahan
- Modal form untuk edit
- Update semua fields
- Validasi required fields
- Save ke database

**Fields:**
- Nama Kelurahan (required)
- Nama Lengkap (required)
- Alamat (required, textarea)
- Kecamatan (required)
- Kota (required)
- Kode Pos (optional)
- Telepon (optional)
- Email (optional)
- Nama Lurah (required)
- NIP Lurah (required)

### 2. Data Pejabat

#### View Pejabat
- Table display
- Columns: Nama, NIP, Jabatan, Kelurahan (admin only)
- Filter by kelurahan (auto untuk staff)

#### Add Pejabat
- Modal form
- Select kelurahan (admin) / auto (staff)
- Input nama, NIP, jabatan
- Insert ke database

#### Edit Pejabat
- Pre-fill form
- Update data
- Save ke database

#### Delete Pejabat
- Soft delete (is_active = false)
- Confirmation dialog
- Remove from list

## 🗄️ Database Schema

### pejabat Table
```sql
CREATE TABLE pejabat (
  id SERIAL PRIMARY KEY,
  kelurahan_id INTEGER REFERENCES kelurahan(id) ON DELETE CASCADE,
  nama VARCHAR(150) NOT NULL,
  nip VARCHAR(30),
  jabatan VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoints

### Kelurahan APIs

#### GET /api/kelurahan
Get all kelurahan

#### GET /api/kelurahan?id=1
Get specific kelurahan

#### PUT /api/kelurahan?id=1
Update kelurahan

**Request:**
```json
{
  "nama": "CIBODAS",
  "nama_lengkap": "Kelurahan Cibodas",
  "alamat": "Jl. Raya Cibodas No. 45",
  "kecamatan": "Cibodas",
  "kota": "Kota Tangerang",
  "kode_pos": "15138",
  "telepon": "(021) 5523456",
  "email": "kelcibodas@tangerangkota.go.id",
  "nama_lurah": "Drs. H. Ahmad Suryadi, M.Si",
  "nip_lurah": "196501011990031001"
}
```

### Pejabat APIs

#### GET /api/pejabat
Get all pejabat

**Response:**
```json
{
  "success": true,
  "pejabat": [
    {
      "id": 1,
      "kelurahan_id": 1,
      "nama": "Budi Santoso, S.Sos",
      "nip": "197001011995031001",
      "jabatan": "Sekretaris Lurah",
      "kelurahan_nama": "CIBODAS",
      "is_active": true
    }
  ]
}
```

#### GET /api/pejabat?kelurahan_id=1
Get pejabat by kelurahan

#### POST /api/pejabat
Create new pejabat

**Request:**
```json
{
  "kelurahan_id": 1,
  "nama": "Ahmad Fauzi, S.IP",
  "nip": "198005102005011002",
  "jabatan": "Kepala Seksi Pemerintahan"
}
```

#### PUT /api/pejabat?id=1
Update pejabat

**Request:**
```json
{
  "nama": "Ahmad Fauzi, S.IP, M.Si",
  "nip": "198005102005011002",
  "jabatan": "Kepala Seksi Pemerintahan"
}
```

#### DELETE /api/pejabat?id=1
Delete pejabat (soft delete)

## 🎨 UI Components

### Tabs Navigation
```
┌─────────────────────────────────────┐
│ [Data Kelurahan] [Data Pejabat]    │
└─────────────────────────────────────┘
```

### Kelurahan Card
```
┌─────────────────────────────────────┐
│ CIBODAS                      [Edit] │
├─────────────────────────────────────┤
│ Nama Lengkap: Kelurahan Cibodas    │
│ Alamat: Jl. Raya Cibodas No. 45    │
│ Kecamatan/Kota: Cibodas, Tangerang │
│ Kode Pos: 15138                     │
│ Telepon: (021) 5523456              │
│ Email: kelcibodas@...               │
│ Nama Lurah: Drs. H. Ahmad...        │
│ NIP Lurah: 196501011990031001       │
└─────────────────────────────────────┘
```

### Pejabat Table
```
┌──────────────────────────────────────────────────┐
│ Nama          │ NIP        │ Jabatan    │ Aksi  │
├──────────────────────────────────────────────────┤
│ Budi Santoso  │ 19700101.. │ Sekretaris │ [✎][×]│
│ Ahmad Fauzi   │ 19800510.. │ Kasi Pem   │ [✎][×]│
└──────────────────────────────────────────────────┘
```

## 🔄 Workflow

### Edit Kelurahan (Staff)
```
1. Staff login
   ↓
2. Navigate to /settings
   ↓
3. Tab "Data Kelurahan" (auto selected)
   ↓
4. See only their kelurahan
   ↓
5. Click "Edit"
   ↓
6. Update fields
   ↓
7. Click "Simpan"
   ↓
8. PUT /api/kelurahan?id=X
   ↓
9. Update database
   ↓
10. Success message
```

### Add Pejabat (Staff)
```
1. Staff login
   ↓
2. Navigate to /settings → Tab "Data Pejabat"
   ↓
3. Click "Tambah Pejabat"
   ↓
4. Fill form:
   - Kelurahan: Auto (their kelurahan)
   - Nama: Input
   - NIP: Input (optional)
   - Jabatan: Input
   ↓
5. Click "Simpan"
   ↓
6. POST /api/pejabat
   ↓
7. Insert to database
   ↓
8. Refresh table
```

### Add Pejabat (Admin)
```
1. Admin login
   ↓
2. Navigate to /settings → Tab "Data Pejabat"
   ↓
3. Click "Tambah Pejabat"
   ↓
4. Fill form:
   - Kelurahan: Select dropdown
   - Nama: Input
   - NIP: Input (optional)
   - Jabatan: Input
   ↓
5. Click "Simpan"
   ↓
6. POST /api/pejabat
   ↓
7. Insert to database
   ↓
8. Refresh table
```

## 🧪 Testing

### Test 1: Edit Kelurahan (Staff)

**Steps:**
1. Login as staff (staffkelcibodas@cibodas.go.id)
2. Navigate to `/settings`
3. See only Kelurahan Cibodas
4. Click "Edit"
5. Update alamat
6. Click "Simpan"

**Expected:**
- Success message
- Data updated in database
- Card shows new data

**Verify:**
```sql
SELECT alamat FROM kelurahan WHERE id = 1;
```

### Test 2: Add Pejabat (Staff)

**Steps:**
1. Login as staff
2. Tab "Data Pejabat"
3. Click "Tambah Pejabat"
4. Fill:
   - Nama: "Siti Aminah, S.Sos"
   - NIP: "198506152010012001"
   - Jabatan: "Kepala Seksi Kesejahteraan"
5. Click "Simpan"

**Expected:**
- Success message
- New pejabat in table
- Kelurahan auto-filled

**Verify:**
```sql
SELECT * FROM pejabat WHERE nama LIKE '%Siti Aminah%';
```

### Test 3: Edit Pejabat

**Steps:**
1. Click Edit icon on pejabat
2. Change jabatan
3. Click "Simpan"

**Expected:**
- Data updated
- Table refreshed

### Test 4: Delete Pejabat

**Steps:**
1. Click Delete icon
2. Confirm deletion

**Expected:**
- Pejabat removed from table
- Soft deleted (is_active = false)

**Verify:**
```sql
SELECT is_active FROM pejabat WHERE id = X;
-- Should be false
```

### Test 5: Admin View All

**Steps:**
1. Login as admin
2. Navigate to `/settings`
3. Tab "Data Kelurahan"

**Expected:**
- See all 6 kelurahan
- Can edit any kelurahan

**Steps:**
1. Tab "Data Pejabat"

**Expected:**
- See pejabat from all kelurahan
- Kelurahan column visible
- Can add pejabat to any kelurahan

## 📊 Sample Data

### Jabatan Examples
- Sekretaris Lurah
- Kepala Seksi Pemerintahan
- Kepala Seksi Kesejahteraan
- Kepala Seksi Pelayanan
- Kepala Seksi Pemberdayaan Masyarakat
- Kepala Seksi Ekonomi dan Pembangunan
- Kepala Seksi Trantib
- Staf Administrasi
- Staf Pelayanan

### Seed Data (Optional)
```sql
-- Insert sample pejabat
INSERT INTO pejabat (kelurahan_id, nama, nip, jabatan) VALUES
(1, 'Budi Santoso, S.Sos', '197001011995031001', 'Sekretaris Lurah'),
(1, 'Ahmad Fauzi, S.IP', '198005102005011002', 'Kepala Seksi Pemerintahan'),
(1, 'Siti Aminah, S.Sos', '198506152010012001', 'Kepala Seksi Kesejahteraan'),
(2, 'Eko Prasetyo, S.AP', '197503201998031001', 'Sekretaris Lurah'),
(2, 'Dewi Lestari, S.Sos', '198208102006042001', 'Kepala Seksi Pelayanan');
```

## 🔒 Security

### Access Control
- Staff only see their kelurahan
- Staff only manage their pejabat
- Admin see & manage all
- Middleware protection

### Validation
- Required fields checked
- Kelurahan ID validated
- Soft delete (preserve data)

## 📈 Statistics

### Current Kelurahan
- 6 kelurahan di Kecamatan Cibodas
- Each can have multiple pejabat

### Typical Pejabat per Kelurahan
- 1 Sekretaris Lurah
- 3-5 Kepala Seksi
- 2-3 Staf

## 📝 Files

```
src/app/
├── api/
│   ├── kelurahan/
│   │   └── route.ts          ✅ Kelurahan CRUD
│   └── pejabat/
│       └── route.ts          ✅ NEW - Pejabat CRUD
├── settings/
│   └── page.tsx              ✅ UPDATED - Management UI

database/
└── schema.sql                ✅ UPDATED - pejabat table
```

## ✅ Checklist

- [x] Pejabat table in database
- [x] Pejabat API endpoints (CRUD)
- [x] Settings page with tabs
- [x] Kelurahan management
- [x] Pejabat management
- [x] Add pejabat form
- [x] Edit pejabat form
- [x] Delete pejabat
- [x] Access control (admin/staff)
- [x] Filter by kelurahan
- [x] Loading states
- [x] Success/error messages
- [x] Responsive design

---

**Status**: ✅ Settings Management Complete
**Version**: 1.0.0
**Last Updated**: 2025-01-08

Halaman pengaturan sekarang **fully functional** untuk manage kelurahan dan pejabat!
