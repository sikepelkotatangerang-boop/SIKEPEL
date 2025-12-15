# Fitur Multi-Kelurahan

## 📝 Overview

Aplikasi SIKEPEL sekarang mendukung **multi-kelurahan** dengan tampilan yang berbeda berdasarkan role user:

- **Admin**: Menampilkan "Kecamatan Cibodas"
- **Staff**: Menampilkan nama kelurahan masing-masing
- **User**: Menampilkan default "Kelurahan Cibodas"

## 🏛️ Daftar Kelurahan

Sistem mencakup 6 kelurahan di Kecamatan Cibodas:

1. **Kelurahan Cibodas**
2. **Kelurahan Cibodas Baru**
3. **Kelurahan Panunggangan Barat**
4. **Kelurahan Cibodasari**
5. **Kelurahan Uwung Jaya**
6. **Kelurahan Jatiuwung**

## 👥 Mock Accounts per Kelurahan

### Admin Kecamatan
```
Email: admin@cibodas.go.id
Password: password123
Role: admin
Tampilan Sidebar: "Kecamatan Cibodas"
```

### Staff Kelurahan Cibodas
```
Email: staffkelcibodas@cibodas.go.id
Password: password123
Role: staff
Tampilan Sidebar: "Kelurahan Cibodas"
```

### Staff Kelurahan Cibodas Baru
```
Email: staffkelcbb@cibodas.go.id
Password: password123
Role: staff
Tampilan Sidebar: "Kelurahan Cibodas Baru"
```

### Staff Kelurahan Panunggangan Barat
```
Email: staffpanbar@cibodas.go.id
Password: password123
Role: staff
Tampilan Sidebar: "Kelurahan Panunggangan Barat"
```

### Staff Kelurahan Cibodasari
```
Email: staffcibodasari@cibodas.go.id
Password: password123
Role: staff
Tampilan Sidebar: "Kelurahan Cibodasari"
```

### Staff Kelurahan Uwung Jaya
```
Email: staffuwungjaya@cibodas.go.id
Password: password123
Role: staff
Tampilan Sidebar: "Kelurahan Uwung Jaya"
```

### Staff Kelurahan Jatiuwung
```
Email: staffjatiuwung@cibodas.go.id
Password: password123
Role: staff
Tampilan Sidebar: "Kelurahan Jatiuwung"
```

## 🎨 Implementasi

### 1. User Type Definition

File: `src/types/index.ts`

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
  kelurahan?: string; // Nama kelurahan untuk staff
  created_at: string;
}
```

### 2. Mock Data

File: `src/lib/mockData.ts`

Setiap user memiliki field `kelurahan`:
- **Admin**: `kelurahan: 'Kecamatan Cibodas'`
- **Staff**: `kelurahan: 'Kelurahan [Nama]'`
- **User**: Tidak ada field kelurahan (optional)

### 3. Sidebar Display

File: `src/components/layout/Sidebar.tsx`

```tsx
<span className="text-xs text-gray-500">
  {currentUser?.kelurahan || 'Kelurahan Cibodas'}
</span>
```

Logic:
- Jika user memiliki field `kelurahan`, tampilkan nilai tersebut
- Jika tidak ada, tampilkan default "Kelurahan Cibodas"

## 🔧 Cara Kerja

### Login Flow

1. User login dengan email dan password
2. System mencari user di `mockUsers` array
3. User data disimpan di localStorage
4. Sidebar membaca `currentUser` dari localStorage
5. Sidebar menampilkan `currentUser.kelurahan` atau default

### Display Logic

```
IF user.role === 'admin':
  Display: "Kecamatan Cibodas"
  
ELSE IF user.role === 'staff':
  Display: user.kelurahan (e.g., "Kelurahan Cibodas")
  
ELSE:
  Display: "Kelurahan Cibodas" (default)
```

## 📊 Email Naming Convention

Format email staff: `staff[kode]@cibodas.go.id`

| Kode | Kelurahan | Email |
|------|-----------|-------|
| kelcibodas | Kelurahan Cibodas | staffkelcibodas@cibodas.go.id |
| kelcbb | Kelurahan Cibodas Baru | staffkelcbb@cibodas.go.id |
| panbar | Kelurahan Panunggangan Barat | staffpanbar@cibodas.go.id |
| cibodasari | Kelurahan Cibodasari | staffcibodasari@cibodas.go.id |
| uwungjaya | Kelurahan Uwung Jaya | staffuwungjaya@cibodas.go.id |
| jatiuwung | Kelurahan Jatiuwung | staffjatiuwung@cibodas.go.id |

## 🎯 Use Cases

### 1. Admin Kecamatan
- Melihat data dari semua kelurahan
- Mengelola semua staff
- Akses penuh ke semua fitur
- Sidebar menampilkan "Kecamatan Cibodas"

### 2. Staff Kelurahan
- Melihat data kelurahan sendiri
- Mengelola surat di kelurahan sendiri
- Akses terbatas ke kelurahan sendiri
- Sidebar menampilkan nama kelurahan masing-masing

### 3. User Biasa
- Melihat informasi umum
- Tidak ada akses ke data internal
- Sidebar menampilkan default

## 🚀 Testing

### Test Admin Login
```
1. Login dengan: admin@cibodas.go.id
2. Check sidebar: Harus tampil "Kecamatan Cibodas"
3. Verify: Akses ke semua menu
```

### Test Staff Login
```
1. Login dengan: staffkelcibodas@cibodas.go.id
2. Check sidebar: Harus tampil "Kelurahan Cibodas"
3. Verify: Data sesuai kelurahan

1. Login dengan: staffpanbar@cibodas.go.id
2. Check sidebar: Harus tampil "Kelurahan Panunggangan Barat"
3. Verify: Data sesuai kelurahan
```

## 🔄 Future Enhancements

### 1. Data Filtering
- Filter dokumen berdasarkan kelurahan
- Staff hanya lihat data kelurahan sendiri
- Admin lihat semua data

### 2. Statistics per Kelurahan
- Dashboard per kelurahan
- Laporan per kelurahan
- Grafik per kelurahan

### 3. Permissions
- Role-based access control
- Kelurahan-based data access
- Feature flags per kelurahan

### 4. Database Integration
```sql
-- Add kelurahan field to users table
ALTER TABLE profiles ADD COLUMN kelurahan TEXT;

-- Add kelurahan field to documents table
ALTER TABLE documents ADD COLUMN kelurahan TEXT;

-- Create kelurahan reference table
CREATE TABLE kelurahan (
  id UUID PRIMARY KEY,
  kode TEXT UNIQUE,
  nama TEXT NOT NULL,
  kecamatan TEXT DEFAULT 'Cibodas'
);
```

## 📝 Notes

- Semua password: `password123`
- Field `kelurahan` adalah optional
- Default fallback: "Kelurahan Cibodas"
- Sidebar auto-update saat login/logout
- Data tersimpan di localStorage

## 🎨 UI/UX

### Sidebar Header
```
┌─────────────────────┐
│ [Logo] SIKEPEL      │
│        Kel. Cibodas │ ← Dynamic based on user
└─────────────────────┘
```

### Admin View
```
SIKEPEL
Kecamatan Cibodas
```

### Staff View (Kelurahan Cibodas)
```
SIKEPEL
Kelurahan Cibodas
```

### Staff View (Kelurahan Panunggangan Barat)
```
SIKEPEL
Kelurahan Panunggangan Barat
```

---

**Status**: ✅ **ACTIVE**  
**Last Updated**: 2025-10-07  
**Total Kelurahan**: 6  
**Total Accounts**: 8 (1 admin + 6 staff + 1 user)
