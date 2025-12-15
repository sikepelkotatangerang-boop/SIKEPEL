# Implementasi Database PostgreSQL (Supabase)

## 📋 Overview

Sistem Pelayanan Kelurahan Cibodas menggunakan **Supabase** (PostgreSQL cloud) sebagai database utama, menggantikan mock data yang sebelumnya digunakan.

## 🎯 Mengapa Supabase?

- ✅ **Tidak perlu install PostgreSQL lokal** - Setup lebih mudah
- ✅ **Free tier generous** - 500MB database, 2GB bandwidth
- ✅ **Persistent Data** - Data tersimpan permanen di cloud
- ✅ **Auto backup** - Daily backups included
- ✅ **Dashboard UI** - Easy database management
- ✅ **Scalability** - Mudah upgrade jika perlu
- ✅ **SSL built-in** - Secure connection by default
- ✅ **Multi-user** - Support concurrent access

## 🗂️ Struktur File

```
Pelayanan3/
├── database/
│   ├── schema.sql          # Database schema
│   ├── seed.sql            # Initial data
│   └── README.md           # Database documentation
├── scripts/
│   └── setup-db.js         # Setup automation script
├── src/
│   ├── lib/
│   │   ├── db.ts           # Database connection
│   │   └── models/
│   │       ├── kelurahan.ts # Kelurahan model
│   │       └── user.ts      # User model
│   └── app/
│       └── api/
│           └── kelurahan/
│               └── route.ts # Kelurahan API
├── .env.example            # Environment variables template
└── .env.local              # Your local config (gitignored)
```

## 🚀 Quick Start

### 1. Setup Supabase

📖 **Lihat panduan lengkap**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Ringkasan:**
1. Buat akun di https://supabase.com
2. Buat project baru
3. Dapatkan connection string
4. Setup environment variables
5. Jalankan schema & seed di SQL Editor

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local dengan konfigurasi Supabase
```

Contoh `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection
DATABASE_URL=postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres
```

### 3. Setup Database Schema

**Di Supabase SQL Editor:**
1. Copy isi `database/schema.sql`
2. Paste di SQL Editor
3. Run query
4. Copy isi `database/seed.sql`
5. Paste dan run

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Cek console, seharusnya muncul:
```
✅ Database connected successfully
```

## 📊 Database Schema

### Table: kelurahan

Menyimpan data kelurahan di Kecamatan Cibodas.

```sql
CREATE TABLE kelurahan (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  nama_lengkap VARCHAR(150) NOT NULL,
  alamat TEXT NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  kota VARCHAR(100) NOT NULL,
  kode_pos VARCHAR(10),
  telepon VARCHAR(20),
  email VARCHAR(100),
  nama_lurah VARCHAR(150) NOT NULL,
  nip_lurah VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Data Default:**
- CIBODAS
- CIBODAS BARU
- PANUNGGANGAN BARAT
- CIBODASARI
- UWUNG JAYA
- JATIUWUNG

### Table: users

Menyimpan data pengguna sistem.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'user')),
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Users:**
| Email | Role | Kelurahan |
|-------|------|-----------|
| admin@cibodas.go.id | admin | - |
| staffkelcibodas@cibodas.go.id | staff | CIBODAS |
| staffkelcbb@cibodas.go.id | staff | CIBODAS BARU |
| ... | ... | ... |

Password semua user: `password123`

### Table: documents

Menyimpan data surat masuk dan keluar.

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(50) NOT NULL UNIQUE,
  jenis_surat VARCHAR(20) NOT NULL CHECK (jenis_surat IN ('masuk', 'keluar')),
  perihal TEXT NOT NULL,
  pengirim VARCHAR(150),
  penerima VARCHAR(150),
  tanggal_surat DATE NOT NULL,
  tanggal_diterima DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'diproses', 'selesai', 'ditolak')),
  file_path TEXT,
  keterangan TEXT,
  created_by INTEGER REFERENCES users(id),
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 Database Connection (`src/lib/db.ts`)

### Basic Usage

```typescript
import db from '@/lib/db';

// Execute query
const result = await db.query('SELECT * FROM kelurahan');

// Get single row
const kelurahan = await db.queryOne('SELECT * FROM kelurahan WHERE id = $1', [1]);

// Transaction
await db.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});
```

## 📦 Models

### KelurahanModel (`src/lib/models/kelurahan.ts`)

```typescript
import { KelurahanModel } from '@/lib/models/kelurahan';

// Get all
const kelurahanList = await KelurahanModel.getAll();

// Get by ID
const kelurahan = await KelurahanModel.getById(1);

// Get by nama
const kelurahan = await KelurahanModel.getByNama('CIBODAS');

// Create
const newKelurahan = await KelurahanModel.create({
  nama: 'NEW KELURAHAN',
  nama_lengkap: 'Kelurahan New',
  alamat: 'Jl. New No. 1',
  // ... other fields
});

// Update
const updated = await KelurahanModel.update(1, {
  telepon: '(021) 1234567'
});

// Delete
await KelurahanModel.delete(1);
```

### UserModel (`src/lib/models/user.ts`)

```typescript
import { UserModel } from '@/lib/models/user';

// Get all users
const users = await UserModel.getAll();

// Get by email
const user = await UserModel.getByEmail('admin@cibodas.go.id');

// Get with kelurahan data
const userWithKelurahan = await UserModel.getByIdWithKelurahan(1);

// Get by kelurahan
const staffList = await UserModel.getByKelurahan(1);

// Create
const newUser = await UserModel.create({
  email: 'newuser@example.com',
  password_hash: hashedPassword,
  name: 'New User',
  role: 'user',
  kelurahan_id: null
});

// Update
await UserModel.update(1, { name: 'Updated Name' });

// Soft delete
await UserModel.delete(1);

// Hard delete
await UserModel.hardDelete(1);
```

## 🌐 API Routes

### GET /api/kelurahan

Get all kelurahan atau specific kelurahan.

```typescript
// Get all
fetch('/api/kelurahan')

// Get by ID
fetch('/api/kelurahan?id=1')

// Get by nama
fetch('/api/kelurahan?nama=CIBODAS')
```

**Response:**
```json
[
  {
    "id": 1,
    "nama": "CIBODAS",
    "nama_lengkap": "Kelurahan Cibodas",
    "alamat": "Jl. Raya Cibodas No. 45, Cibodas",
    "kecamatan": "Cibodas",
    "kota": "Kota Tangerang",
    "kode_pos": "15138",
    "telepon": "(021) 5523456",
    "email": "kelcibodas@tangerangkota.go.id",
    "nama_lurah": "Drs. H. Ahmad Suryadi, M.Si",
    "nip_lurah": "196501011990031001"
  }
]
```

### POST /api/kelurahan

Create new kelurahan (admin only).

```typescript
fetch('/api/kelurahan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nama: 'NEW KELURAHAN',
    nama_lengkap: 'Kelurahan New',
    alamat: 'Jl. New No. 1',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kode_pos: '15147',
    telepon: '(021) 5523462',
    email: 'kelnew@tangerangkota.go.id',
    nama_lurah: 'Nama Lurah',
    nip_lurah: '199999999999999999'
  })
})
```

### PUT /api/kelurahan

Update kelurahan (admin only).

```typescript
fetch('/api/kelurahan?id=1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    telepon: '(021) 9999999'
  })
})
```

### DELETE /api/kelurahan

Delete kelurahan (admin only).

```typescript
fetch('/api/kelurahan?id=1', {
  method: 'DELETE'
})
```

## 🔄 Migrasi dari Mock Data

### Before (Mock Data)

```typescript
import { mockAuth, dataKelurahan } from '@/lib/mockData';

const user = mockAuth.getCurrentUser();
const kelurahan = dataKelurahan[user.kelurahan];
```

### After (Database)

```typescript
import { UserModel } from '@/lib/models/user';
import { KelurahanModel } from '@/lib/models/kelurahan';

const user = await UserModel.getByIdWithKelurahan(userId);
const kelurahan = user.kelurahan;
```

## 🧪 Testing

### Test Database Connection

```bash
# Jalankan aplikasi
npm run dev

# Cek console untuk:
✅ Database connected successfully
```

### Test API

```bash
# Get all kelurahan
curl http://localhost:3000/api/kelurahan

# Get specific kelurahan
curl http://localhost:3000/api/kelurahan?nama=CIBODAS
```

## 🔐 Security

### Password Hashing

⚠️ **PENTING**: Seed data menggunakan placeholder hash. Untuk production:

1. Install bcrypt:
```bash
npm install bcrypt @types/bcrypt
```

2. Hash password:
```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash('password123', 10);
```

3. Verify password:
```typescript
const isValid = await bcrypt.compare(inputPassword, user.password_hash);
```

### Environment Variables

- ❌ **JANGAN** commit `.env.local` ke git
- ✅ **GUNAKAN** `.env.example` sebagai template
- ✅ **GANTI** password default di production

## 📈 Performance

### Indexes

Schema sudah include indexes untuk performa:

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kelurahan ON users(kelurahan_id);
CREATE INDEX idx_documents_nomor ON documents(nomor_surat);
CREATE INDEX idx_documents_jenis ON documents(jenis_surat);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_kelurahan ON documents(kelurahan_id);
```

### Connection Pooling

Database menggunakan connection pooling:
- Max connections: 20
- Idle timeout: 30s
- Connection timeout: 2s

## 🔧 Maintenance

### Backup

```bash
# Backup database
pg_dump -U postgres pelayanan_kelurahan > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -d pelayanan_kelurahan < backup_20241008.sql
```

### Reset Database

```bash
npm run db:reset
```

## 🐛 Troubleshooting

### "Database connected successfully" tidak muncul

1. Cek PostgreSQL service running
2. Verify credentials di `.env.local`
3. Test koneksi manual:
```bash
psql -U postgres -d pelayanan_kelurahan
```

### TypeScript Errors

Jika ada error terkait types, pastikan:
```bash
npm install --save-dev @types/pg
```

### Query Errors

Enable query logging di `src/lib/db.ts` untuk debug.

## 📚 Resources

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [node-postgres](https://node-postgres.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## ✅ Checklist Setup

- [ ] PostgreSQL terinstall
- [ ] Database `pelayanan_kelurahan` dibuat
- [ ] `.env.local` dikonfigurasi
- [ ] Schema dijalankan (`npm run db:setup`)
- [ ] Seed data dijalankan
- [ ] Test koneksi berhasil
- [ ] API `/api/kelurahan` berfungsi

## 🎉 Next Steps

Setelah database setup:
1. Implementasi authentication dengan database
2. Migrate form SKTM untuk fetch data dari API
3. Implementasi CRUD untuk documents
4. Add pagination untuk large datasets
5. Implement caching strategy

---

**Status**: ✅ Database Implementation Complete
**Version**: 1.0.0
**Last Updated**: 2025-10-08
