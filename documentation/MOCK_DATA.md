# Mock Data Documentation

## 📝 Overview

Aplikasi ini sekarang menggunakan **mock data** untuk development dan testing sebelum integrasi dengan Supabase. Mock data disimpan di `src/lib/mockData.ts`.

## 👥 Mock Users

### Credentials untuk Login

| Email | Password | Role | Nama | Kelurahan |
|-------|----------|------|------|-----------|
| `admin@cibodas.go.id` | `password123` | admin | Admin Kecamatan | Kecamatan Cibodas |
| `staffkelcibodas@cibodas.go.id` | `password123` | staff | Staff Kelurahan Cibodas | Kelurahan Cibodas |
| `staffkelcbb@cibodas.go.id` | `password123` | staff | Staff Kelurahan Cibodas Baru | Kelurahan Cibodas Baru |
| `staffpanbar@cibodas.go.id` | `password123` | staff | Staff Kelurahan Panunggangan Barat | Kelurahan Panunggangan Barat |
| `staffcibodasari@cibodas.go.id` | `password123` | staff | Staff Kelurahan Cibodasari | Kelurahan Cibodasari |
| `staffuwungjaya@cibodas.go.id` | `password123` | staff | Staff Kelurahan Uwung Jaya | Kelurahan Uwung Jaya |
| `staffjatiuwung@cibodas.go.id` | `password123` | staff | Staff Kelurahan Jatiuwung | Kelurahan Jatiuwung |
| `user@example.com` | `password123` | user | User Biasa | - |

### Cara Login

1. Buka halaman login: http://localhost:3000/login
2. Gunakan salah satu email dan password di atas
3. Klik "Masuk"
4. Anda akan diarahkan ke dashboard

## 📄 Mock Documents

Aplikasi memiliki 6 dokumen mock:

### Surat Masuk (3 dokumen)
1. **SM/001/2024** - Undangan Rapat Koordinasi (Status: Pending)
2. **SM/002/2024** - Permohonan Data Penduduk (Status: Diproses)
3. **SM/003/2024** - Surat Edaran Protokol Kesehatan (Status: Selesai)

### Surat Keluar (3 dokumen)
1. **SK/045/2024** - Surat Keterangan Domisili (Status: Selesai)
2. **SK/046/2024** - Surat Pengantar KTP (Status: Diproses)
3. **SK/047/2024** - Surat Keterangan Usaha (Status: Pending)

## 🔧 Fitur Mock Authentication

### Login
- Validasi email dan password
- Menyimpan user session di localStorage
- Redirect ke dashboard setelah login berhasil

### Register
- Membuat user baru dengan role 'user'
- Validasi password (minimal 6 karakter)
- Validasi konfirmasi password
- Auto redirect ke login setelah berhasil

### Logout
- Menghapus session dari localStorage
- Redirect ke halaman login

### Session Management
- User session disimpan di localStorage dengan key `currentUser`
- Session persist setelah refresh page
- Navbar menampilkan info user yang sedang login

## 📊 Dashboard Statistics

Dashboard menampilkan statistik dari mock data:
- Total Surat Masuk: 3
- Total Surat Keluar: 3
- Surat Pending: 2
- Surat Selesai: 2

## 🎯 Cara Menggunakan Mock Data

### 1. Import Mock Data
```typescript
import { mockAuth, mockUsers, mockDocuments, getMockStats } from '@/lib/mockData';
```

### 2. Authentication
```typescript
// Login
const user = mockAuth.login(email, password);
if (user) {
  mockAuth.setCurrentUser(user);
}

// Get current user
const currentUser = mockAuth.getCurrentUser();

// Logout
mockAuth.logout();

// Register
const newUser = mockAuth.register(email, password, name);
```

### 3. Get Documents
```typescript
import { getMockDocuments } from '@/lib/mockData';

// Get all documents
const allDocs = getMockDocuments();

// Get only incoming mail
const suratMasuk = getMockDocuments('masuk');

// Get only outgoing mail
const suratKeluar = getMockDocuments('keluar');
```

### 4. Get Users
```typescript
import { getMockUsers } from '@/lib/mockData';

const users = getMockUsers();
```

### 5. Get Statistics
```typescript
import { getMockStats } from '@/lib/mockData';

const stats = getMockStats();
// Returns: { total_surat_masuk, total_surat_keluar, surat_pending, surat_selesai }
```

## 🔄 Migrasi ke Supabase

Ketika siap untuk integrasi Supabase:

1. **Setup Supabase** (lihat SETUP.md)
2. **Ganti Mock Auth** di:
   - `src/app/login/page.tsx`
   - `src/app/register/page.tsx`
   - `src/components/layout/Navbar.tsx`

3. **Ganti Mock Data** di:
   - `src/app/dashboard/page.tsx`
   - `src/app/surat-masuk/page.tsx`
   - `src/app/surat-keluar/page.tsx`
   - `src/app/pengguna/page.tsx`

4. **Hapus Mock Data** (opsional):
   ```bash
   # Setelah migrasi selesai
   rm src/lib/mockData.ts
   ```

## 💡 Tips

- Mock data tersimpan di localStorage, jadi akan persist setelah refresh
- Untuk reset session, buka DevTools > Application > Local Storage > hapus `currentUser`
- Anda bisa menambah mock users dan documents di `src/lib/mockData.ts`
- Mock data cocok untuk development dan demo tanpa perlu setup database

## ⚠️ Catatan Penting

- Mock data **TIDAK** untuk production
- Data akan hilang jika localStorage dibersihkan
- Tidak ada validasi email yang sebenarnya
- Password disimpan plain text (hanya untuk development)
- Tidak ada enkripsi atau security layer

## 🚀 Next Steps

1. Test semua fitur dengan mock data
2. Pastikan UI/UX sudah sesuai
3. Setup Supabase database
4. Implementasi real authentication
5. Migrate ke production database
6. Deploy aplikasi

---

**Status:** ✅ Mock Data Active  
**Last Updated:** 2025-10-07
