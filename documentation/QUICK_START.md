# Quick Start Guide - Sistem Pelayanan Kelurahan Cibodas

## 🚀 Setup dalam 5 Menit

### 1️⃣ Clone & Install Dependencies

```bash
# Clone repository (jika dari git)
git clone <repository-url>
cd Pelayanan3

# Install dependencies
npm install
```

### 2️⃣ Setup Supabase Database

#### A. Buat Akun Supabase (1 menit)

1. Kunjungi https://supabase.com
2. Click "Start your project"
3. Sign up dengan GitHub/Google
4. Verifikasi email

#### B. Buat Project (2 menit)

1. Click "New Project"
2. Isi:
   - Name: `Pelayanan Kelurahan Cibodas`
   - Database Password: **Buat password kuat & SIMPAN!**
   - Region: `Southeast Asia (Singapore)`
3. Click "Create new project"
4. Tunggu ~2 menit

#### C. Setup Database Schema (1 menit)

1. Di dashboard Supabase, click **SQL Editor**
2. Click **New query**
3. Copy seluruh isi file `database/schema.sql`
4. Paste ke SQL Editor
5. Click **Run** (Ctrl+Enter)
6. Tunggu "Success"

#### D. Insert Data Awal (30 detik)

1. Buat query baru di SQL Editor
2. Copy seluruh isi file `database/seed.sql`
3. Paste ke SQL Editor
4. Click **Run**
5. Tunggu "Success"

#### E. Verifikasi (30 detik)

1. Click **Table Editor** di sidebar
2. Seharusnya ada 3 tables:
   - `kelurahan` (6 rows)
   - `users` (8 rows)
   - `documents` (6 rows)

### 3️⃣ Konfigurasi Environment (1 menit)

#### A. Dapatkan Credentials dari Supabase

Di dashboard Supabase:

1. Click **Settings** (icon gear)
2. Click **API**
3. Copy:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon public** key (panjang, dimulai dengan `eyJhbG...`)

4. Click **Database** di settings
5. Scroll ke **Connection string**
6. Pilih tab **URI**
7. Copy connection string
8. **Ganti `[YOUR-PASSWORD]`** dengan password yang Anda buat tadi

#### B. Setup .env.local

```bash
# Copy template
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Paste values dari Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Paste connection string (jangan lupa ganti password!)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### 4️⃣ Jalankan Aplikasi (10 detik)

```bash
npm run dev
```

Buka browser: http://localhost:3000

**Cek console**, seharusnya muncul:
```
✅ Database connected successfully
```

### 5️⃣ Login & Test (1 menit)

#### Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@cibodas.go.id | password123 | Admin |
| staffkelcibodas@cibodas.go.id | password123 | Staff Kelurahan Cibodas |
| staffkelcbb@cibodas.go.id | password123 | Staff Kelurahan Cibodas Baru |

#### Test Form SKTM

1. Login dengan salah satu akun staff
2. Navigate ke **Form SKTM**
3. Click **Generate Data Contoh**
4. Click **Ajukan Permohonan**
5. Dokumen SKTM akan otomatis terdownload

**Cek dokumen** - semua placeholder seharusnya terisi dengan benar!

---

## ✅ Checklist Setup

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Seed data inserted
- [ ] Tables verified (3 tables with data)
- [ ] `.env.local` configured
- [ ] `npm install` completed
- [ ] `npm run dev` running
- [ ] "Database connected successfully" muncul
- [ ] Login berhasil
- [ ] Form SKTM berfungsi
- [ ] Dokumen SKTM ter-generate

---

## 🐛 Troubleshooting

### "Database connected successfully" tidak muncul

**Solusi:**
1. Check `.env.local` - pastikan `DATABASE_URL` benar
2. Verify password di connection string
3. Restart `npm run dev`

### Login tidak berfungsi

**Solusi:**
1. Pastikan seed data sudah dijalankan
2. Check table `users` di Supabase Table Editor
3. Gunakan email & password yang benar

### Form SKTM error

**Solusi:**
1. Check browser console untuk error
2. Verify data kelurahan ada di database
3. Pastikan user yang login punya `kelurahan_id`

### Placeholder `$undefined` di dokumen

**Solusi:**
1. Check template `SKTM.docx` menggunakan format `{placeholder}` bukan `${placeholder}`
2. Lihat [TROUBLESHOOTING.md](./public/template/TROUBLESHOOTING.md)

---

## 📚 Dokumentasi Lengkap

- 📖 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup Supabase detail
- 📖 [DATABASE_IMPLEMENTATION.md](./DATABASE_IMPLEMENTATION.md) - Implementasi database
- 📖 [FITUR_AUTO_KELURAHAN.md](./FITUR_AUTO_KELURAHAN.md) - Fitur auto-fill kelurahan
- 📖 [MAPPING_FIELD_SKTM.md](./MAPPING_FIELD_SKTM.md) - Mapping field template

---

## 🎯 Next Steps

Setelah setup berhasil:

1. ✅ Explore dashboard
2. ✅ Test semua fitur
3. ✅ Customize data kelurahan sesuai kebutuhan
4. ✅ Update template SKTM jika perlu
5. 🔄 Implement authentication (coming soon)
6. 🔄 Add more surat types (coming soon)

---

## 💡 Tips

- **Bookmark Supabase dashboard** untuk akses cepat
- **Save password** di password manager
- **Use SQL Editor** untuk query cepat
- **Monitor usage** di Settings → Usage
- **Enable RLS** untuk production

---

**Selamat! Aplikasi siap digunakan! 🎉**

Jika ada masalah, lihat dokumentasi lengkap atau contact developer.
