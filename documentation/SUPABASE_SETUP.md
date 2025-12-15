# Setup Supabase Database

## 🎯 Mengapa Supabase?

- ✅ **Tidak perlu install PostgreSQL lokal**
- ✅ **Free tier generous** (500MB database, 2GB bandwidth)
- ✅ **Auto backup** dan high availability
- ✅ **Dashboard UI** untuk manage database
- ✅ **Real-time subscriptions** (bonus feature)
- ✅ **Built-in authentication** (bisa digunakan nanti)

## 🚀 Setup Supabase

### 1. Buat Akun Supabase

1. Kunjungi https://supabase.com
2. Click "Start your project"
3. Sign up dengan GitHub/Google/Email
4. Verifikasi email Anda

### 2. Buat Project Baru

1. Click "New Project"
2. Isi form:
   - **Name**: `Pelayanan Kelurahan Cibodas`
   - **Database Password**: Buat password yang kuat (SIMPAN INI!)
   - **Region**: `Southeast Asia (Singapore)` (terdekat dengan Indonesia)
   - **Pricing Plan**: Free
3. Click "Create new project"
4. Tunggu ~2 menit sampai project ready

### 3. Dapatkan Connection String

Setelah project ready:

1. Di dashboard, click **Settings** (icon gear di sidebar)
2. Click **Database** di menu settings
3. Scroll ke bagian **Connection string**
4. Pilih tab **URI**
5. Copy connection string yang terlihat seperti:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Ganti `[YOUR-PASSWORD]` dengan password yang Anda buat tadi

### 4. Konfigurasi Environment Variables

1. Copy `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` dan isi dengan data dari Supabase:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Supabase Database Connection
   DATABASE_URL=postgresql://postgres:your_password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

   **Cara mendapatkan values:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Settings → API → Project API keys → anon public
   - `DATABASE_URL`: Settings → Database → Connection string → URI

### 5. Setup Database Schema

#### Option A: Menggunakan Supabase SQL Editor (Recommended)

1. Di dashboard Supabase, click **SQL Editor** di sidebar
2. Click **New query**
3. Copy isi file `database/schema.sql`
4. Paste ke SQL Editor
5. Click **Run** (atau tekan Ctrl+Enter)
6. Tunggu sampai selesai (akan muncul "Success")

7. Buat query baru untuk seed data:
8. Copy isi file `database/seed.sql`
9. Paste ke SQL Editor
10. Click **Run**

#### Option B: Menggunakan Script (Jika sudah setup .env.local)

```bash
npm run db:setup
```

### 6. Verifikasi Database

1. Di Supabase dashboard, click **Table Editor**
2. Anda seharusnya melihat 3 tables:
   - `kelurahan` (6 rows)
   - `users` (8 rows)
   - `documents` (6 rows)

3. Click table `kelurahan` untuk melihat data

### 7. Test Koneksi

```bash
npm run dev
```

Cek console, seharusnya muncul:
```
✅ Database connected successfully
```

## 📊 Struktur Database

### Tables yang Dibuat

1. **kelurahan** - Data 6 kelurahan di Kecamatan Cibodas
2. **users** - Data pengguna (admin, staff, user)
3. **documents** - Data surat masuk dan keluar

### Default Users

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

## 🔍 Menggunakan Supabase Dashboard

### SQL Editor

Untuk menjalankan query manual:
1. Click **SQL Editor**
2. Ketik query, contoh:
   ```sql
   SELECT * FROM kelurahan;
   SELECT * FROM users WHERE role = 'staff';
   ```
3. Click **Run**

### Table Editor

Untuk melihat dan edit data:
1. Click **Table Editor**
2. Pilih table
3. Bisa add/edit/delete row langsung dari UI

### Database

Untuk melihat schema dan relationships:
1. Click **Database**
2. Lihat tables, columns, relationships

## 🔐 Security

### Row Level Security (RLS)

Supabase punya fitur RLS untuk security. Untuk development, kita disable dulu:

```sql
-- Disable RLS untuk development
ALTER TABLE kelurahan DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
```

Jalankan di SQL Editor.

**⚠️ PENTING**: Di production, enable RLS dan buat policies yang proper!

### Password Hashing

Seed data menggunakan placeholder hash. Untuk production:

1. Install bcrypt:
   ```bash
   npm install bcrypt @types/bcrypt
   ```

2. Update password dengan hash yang benar:
   ```sql
   UPDATE users 
   SET password_hash = '$2b$10$...' -- hash dari bcrypt
   WHERE email = 'admin@cibodas.go.id';
   ```

## 📈 Monitoring

### Database Usage

Check usage di dashboard:
1. Click **Settings** → **Usage**
2. Monitor:
   - Database size
   - Bandwidth
   - API requests

### Logs

View logs:
1. Click **Logs**
2. Pilih **Postgres Logs** untuk database logs

## 🔄 Backup & Restore

### Automatic Backups

Supabase free tier include daily backups (retained for 7 days).

### Manual Backup

1. Click **Database** → **Backups**
2. Click **Create backup**

### Restore

1. Click **Database** → **Backups**
2. Pilih backup
3. Click **Restore**

## 🧪 Testing API

### Test Kelurahan API

```bash
# Get all kelurahan
curl http://localhost:3000/api/kelurahan

# Get specific kelurahan
curl http://localhost:3000/api/kelurahan?nama=CIBODAS
```

### Test dengan Postman/Thunder Client

1. GET `http://localhost:3000/api/kelurahan`
2. Response seharusnya return array of kelurahan

## 🐛 Troubleshooting

### Error: "connection timeout"

**Penyebab**: Connection string salah atau network issue

**Solusi**:
1. Verify connection string di `.env.local`
2. Pastikan password benar
3. Check internet connection
4. Verify Supabase project masih active

### Error: "password authentication failed"

**Penyebab**: Password salah di connection string

**Solusi**:
1. Reset database password di Supabase dashboard:
   - Settings → Database → Reset database password
2. Update `.env.local` dengan password baru

### Error: "relation does not exist"

**Penyebab**: Schema belum dijalankan

**Solusi**:
1. Jalankan `database/schema.sql` di SQL Editor
2. Lalu jalankan `database/seed.sql`

### Tables tidak muncul di Table Editor

**Penyebab**: Schema belum dijalankan atau error saat execute

**Solusi**:
1. Check SQL Editor untuk error messages
2. Jalankan ulang schema.sql
3. Refresh browser

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [PostgreSQL on Supabase](https://supabase.com/docs/guides/database/overview)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 💡 Tips

1. **Bookmark dashboard**: Simpan URL dashboard Supabase Anda
2. **Save password**: Simpan database password di password manager
3. **Use SQL Editor**: Lebih cepat untuk testing query
4. **Monitor usage**: Check usage regularly untuk avoid limits
5. **Enable RLS**: Untuk production, always enable Row Level Security

## 🎉 Next Steps

Setelah setup Supabase:

1. ✅ Test koneksi database
2. ✅ Verify tables dan data
3. ✅ Test API endpoints
4. 🔄 Migrate authentication ke Supabase Auth (optional)
5. 🔄 Implement real-time features (optional)
6. 🔄 Setup proper RLS policies untuk production

---

**Status**: ✅ Supabase Setup Complete
**Free Tier Limits**:
- Database: 500 MB
- Bandwidth: 2 GB
- API Requests: Unlimited

Untuk upgrade ke Pro ($25/month) jika needed.
