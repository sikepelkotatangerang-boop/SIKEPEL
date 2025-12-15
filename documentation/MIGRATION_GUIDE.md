# 🚀 Panduan Migrasi Database dari Supabase ke Neon

## 📋 Langkah-langkah Migrasi

### 1. ✅ Update Environment Variables

Edit file `.env.local` dan ganti `DATABASE_URL` dengan connection string Neon:

```env
# Ganti dengan connection string Neon Anda
DATABASE_URL=postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**PENTING:** Hapus atau comment out variabel `SUPABASE_DB_URL` jika ada.

---

### 2. 📦 Install PostgreSQL Client (psql)

Untuk import schema, Anda perlu psql client:

#### Windows (via Chocolatey):
```powershell
choco install postgresql
```

#### Windows (Manual):
Download dari: https://www.postgresql.org/download/windows/

#### Atau gunakan Neon SQL Editor (Web-based):
https://console.neon.tech/app/projects/[your-project-id]/sql-editor

---

### 3. 🗄️ Import Schema ke Neon

#### Opsi A: Menggunakan psql (Command Line)

```powershell
# Masuk ke folder database
cd "d:\Project\Kelurahan Cibodas\Pelayanan3\database"

# Import schema
psql "postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" -f migrate-to-neon.sql
```

#### Opsi B: Menggunakan Neon SQL Editor (Web)

1. Buka https://console.neon.tech
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Copy isi file `database/migrate-to-neon.sql`
5. Paste ke SQL Editor
6. Klik **Run** atau tekan `Ctrl+Enter`

---

### 4. 📊 Export Data dari Supabase (Jika Ada Data)

Jika Anda sudah punya data di Supabase, export dulu:

#### Via Supabase Dashboard:
1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Database** → **Backups**
4. Download backup terbaru

#### Via pg_dump (Command Line):
```powershell
# Ganti dengan connection string Supabase Anda
pg_dump "postgresql://postgres:your_password@db.giutqfeliytoaamcmqny.supabase.co:5432/postgres" --data-only --inserts -f supabase_data.sql
```

**CATATAN:** Jika koneksi ke Supabase masih error (IPv6 issue), skip langkah ini dan mulai dengan database kosong.

---

### 5. 📥 Import Data ke Neon (Opsional)

Jika Anda berhasil export data dari Supabase:

```powershell
psql "postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" -f supabase_data.sql
```

---

### 6. 🧪 Test Koneksi Database

Jalankan test endpoint:

```powershell
# Start development server
npm run dev

# Buka browser dan akses:
# http://localhost:3000/api/test-db
```

Atau test langsung dengan script:

```powershell
node scripts/test-neon-connection.js
```

---

### 7. 🎯 Seed Data Awal (Jika Database Kosong)

Jika Anda mulai dengan database kosong, jalankan seed script:

```powershell
npm run db:setup
```

Script ini akan membuat:
- ✅ Data kelurahan Cibodas
- ✅ User admin default
- ✅ Sample data untuk testing

---

## 🔧 Troubleshooting

### Error: "relation does not exist"
- Pastikan schema sudah di-import dengan benar
- Cek di Neon SQL Editor apakah tabel sudah ada

### Error: "password authentication failed"
- Periksa kembali connection string di `.env.local`
- Pastikan password tidak ada karakter special yang perlu di-encode

### Error: "SSL connection required"
- Pastikan connection string ada parameter `?sslmode=require`

### Database connection timeout
- Cek internet connection
- Pastikan Neon project tidak di-pause (free tier auto-pause setelah 5 menit idle)

---

## 📝 Checklist Migrasi

- [ ] Update `.env.local` dengan Neon connection string
- [ ] Install psql client (atau gunakan Neon SQL Editor)
- [ ] Import schema (`migrate-to-neon.sql`)
- [ ] Export data dari Supabase (jika ada)
- [ ] Import data ke Neon (jika ada)
- [ ] Test koneksi database
- [ ] Seed data awal (jika database kosong)
- [ ] Test login dan fitur utama aplikasi

---

## 🎉 Selesai!

Setelah semua langkah selesai, aplikasi Anda sudah menggunakan Neon PostgreSQL dengan IPv4 support!

**Keuntungan:**
- ✅ IPv4 support (tidak ada lagi ENOTFOUND error)
- ✅ Free tier generous (0.5 GB storage)
- ✅ Auto-scaling
- ✅ Branching database untuk development

---

## 📞 Butuh Bantuan?

Jika ada error atau pertanyaan, silakan hubungi developer atau buat issue di repository.
