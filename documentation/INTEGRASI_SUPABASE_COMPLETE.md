# ✅ Integrasi Supabase - Complete Guide

## 🎉 Yang Sudah Diintegrasikan

### 1. Authentication dengan Database
- ✅ API `/api/auth/login` - Login dengan bcrypt password verification
- ✅ API `/api/auth/me` - Get current user dengan kelurahan data
- ✅ Login page menggunakan database
- ✅ Password hashing dengan bcrypt

### 2. Database Models
- ✅ `UserModel` - CRUD operations untuk users
- ✅ `KelurahanModel` - CRUD operations untuk kelurahan
- ✅ Database connection dengan Supabase

### 3. API Endpoints
- ✅ `/api/kelurahan` - GET, POST, PUT, DELETE
- ✅ `/api/auth/login` - POST
- ✅ `/api/auth/me` - GET
- ✅ `/api/test-db` - Test database connection
- ✅ `/api/generate-sktm` - Generate SKTM document

## 🚀 Setup Supabase (Langkah Lengkap)

### Step 1: Buat Akun & Project Supabase

1. **Kunjungi** https://supabase.com
2. **Sign up** dengan GitHub/Google/Email
3. **Buat project baru**:
   - Name: `Pelayanan Kelurahan Cibodas`
   - Database Password: Buat password kuat (SIMPAN!)
   - Region: `Southeast Asia (Singapore)`
   - Plan: Free

### Step 2: Setup Database Schema

1. **Buka SQL Editor** di Supabase dashboard
2. **Copy isi file** `database/schema.sql`
3. **Paste & Run** di SQL Editor
4. **Tunggu** sampai "Success"

### Step 3: Insert Data

1. **Buat query baru** di SQL Editor
2. **Copy isi file** `database/seed.sql` (yang sudah diupdate dengan bcrypt hash)
3. **Paste & Run**
4. **Verify**: Click Table Editor, seharusnya ada 3 tables dengan data

### Step 4: Get Connection String

1. **Settings** → **Database**
2. **Connection string** → **URI**
3. **Copy** connection string
4. **Ganti** `[YOUR-PASSWORD]` dengan password database Anda

### Step 5: Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Cara mendapatkan values:**
- `NEXT_PUBLIC_SUPABASE_URL`: Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Settings → API → anon public key
- `DATABASE_URL`: Settings → Database → Connection string (URI)

### Step 6: Disable RLS (Development Only)

Di SQL Editor, jalankan:

```sql
ALTER TABLE kelurahan DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
```

⚠️ **PENTING**: Di production, enable RLS dan buat policies!

### Step 7: Test Koneksi

```bash
npm run dev
```

Buka browser: `http://localhost:3000/api/test-db`

**Response yang benar:**
```json
{
  "success": true,
  "message": "✅ Database connected successfully!",
  "data": {
    "tables": {
      "kelurahan": "6",
      "users": "8",
      "documents": "6"
    }
  }
}
```

### Step 8: Test Login

1. Buka `http://localhost:3000/login`
2. Login dengan:
   - Email: `staffkelcbb@cibodas.go.id`
   - Password: `password123`
3. Seharusnya berhasil login dan redirect ke dashboard

## 🔐 Authentication Flow

```
1. User input email & password
   ↓
2. POST /api/auth/login
   ↓
3. Query database: UserModel.getByEmailWithPassword(email)
   ↓
4. Verify password: bcrypt.compare(password, hash)
   ↓
5. Get user with kelurahan: UserModel.getByIdWithKelurahan(id)
   ↓
6. Return user data (without password_hash)
   ↓
7. Save to localStorage
   ↓
8. Redirect to dashboard
```

## 📊 Database Structure

### Table: users

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(150) | Email (unique) |
| password_hash | TEXT | Bcrypt hashed password |
| name | VARCHAR(150) | Full name |
| role | VARCHAR(20) | admin/staff/user |
| kelurahan_id | INTEGER | FK to kelurahan |
| is_active | BOOLEAN | Active status |

### Table: kelurahan

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nama | VARCHAR(100) | Nama kelurahan (UPPERCASE) |
| alamat | TEXT | Alamat kantor |
| nama_lurah | VARCHAR(150) | Nama lurah |
| nip_lurah | VARCHAR(20) | NIP lurah |

## 👥 Default Users

| Email | Password | Role | Kelurahan |
|-------|----------|------|-----------|
| admin@cibodas.go.id | password123 | admin | - |
| staffkelcibodas@cibodas.go.id | password123 | staff | CIBODAS |
| staffkelcbb@cibodas.go.id | password123 | staff | CIBODAS BARU |
| staffpanbar@cibodas.go.id | password123 | staff | PANUNGGANGAN BARAT |
| staffcibodasari@cibodas.go.id | password123 | staff | CIBODASARI |
| staffuwungjaya@cibodas.go.id | password123 | staff | UWUNG JAYA |
| staffjatiuwung@cibodas.go.id | password123 | staff | JATIUWUNG |
| user@example.com | password123 | user | - |

## 🔧 Utilities

### Generate Password Hash

```bash
node scripts/hash-password.js your_password
```

Output:
```
=== Password Hash Generated ===

Password: your_password
Hash: $2b$10$...

Copy hash ini ke seed.sql
```

## 📝 File Structure

```
Pelayanan3/
├── database/
│   ├── schema.sql ✅ Updated
│   ├── seed.sql ✅ Updated with bcrypt hash
│   └── README.md
├── scripts/
│   ├── hash-password.js ✅ NEW
│   └── setup-db.js
├── src/
│   ├── lib/
│   │   ├── db.ts ✅ Supabase connection
│   │   ├── models/
│   │   │   ├── user.ts ✅ User model
│   │   │   └── kelurahan.ts ✅ Kelurahan model
│   │   └── mockData.ts ✅ Cleaned up
│   └── app/
│       ├── api/
│       │   ├── auth/
│       │   │   ├── login/route.ts ✅ NEW
│       │   │   └── me/route.ts ✅ NEW
│       │   ├── kelurahan/route.ts ✅
│       │   ├── test-db/route.ts ✅
│       │   └── generate-sktm/route.ts ✅
│       └── login/page.tsx ✅ Updated
└── .env.local ✅ Configure this!
```

## ✅ Features

### Implemented
- ✅ Database connection dengan Supabase
- ✅ User authentication dengan bcrypt
- ✅ Login dengan database
- ✅ User model dengan kelurahan relation
- ✅ Kelurahan CRUD API
- ✅ Auto-fill form SKTM dengan data kelurahan
- ✅ Generate SKTM document
- ✅ Password hashing utility

### TODO (Future)
- 🔄 Session management dengan JWT
- 🔄 Proper middleware untuk auth
- 🔄 Row Level Security policies
- 🔄 Register new user
- 🔄 Forgot password
- 🔄 Change password
- 🔄 Documents CRUD dengan database
- 🔄 Real-time features dengan Supabase

## 🐛 Troubleshooting

### "password authentication failed"

**Solusi:**
1. Check `.env.local` - pastikan `DATABASE_URL` benar
2. Verify password di connection string
3. Test dengan: `http://localhost:3000/api/test-db`

### "Invalid email or password"

**Solusi:**
1. Pastikan seed data sudah dijalankan dengan hash yang benar
2. Check table `users` di Supabase
3. Verify password hash dengan: `node scripts/hash-password.js password123`

### Login berhasil tapi data kelurahan tidak muncul

**Solusi:**
1. Check `kelurahan_id` di table users
2. Verify data kelurahan ada di database
3. Check console browser untuk error

## 🎯 Next Steps

1. ✅ Setup Supabase account
2. ✅ Jalankan schema.sql
3. ✅ Jalankan seed.sql (dengan bcrypt hash)
4. ✅ Configure `.env.local`
5. ✅ Test database connection
6. ✅ Test login
7. ✅ Test form SKTM
8. 🔄 Implement proper session management
9. 🔄 Add more features

---

**Status**: ✅ Supabase Integration Complete
**Version**: 1.0.0
**Last Updated**: 2025-10-08

Aplikasi sekarang fully integrated dengan Supabase! 🎉
