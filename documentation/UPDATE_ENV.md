# ⚠️ PENTING: Update Environment Variables

## 🔧 Langkah yang Harus Dilakukan SEKARANG

File `.env.local` Anda masih menggunakan connection string Supabase yang lama.

### 1. Buka file `.env.local`

Lokasi: `d:\Project\Kelurahan Cibodas\Pelayanan3\.env.local`

### 2. Cari baris yang berisi `DATABASE_URL`

Contoh baris lama:
```env
DATABASE_URL=postgresql://postgres:xxx@db.giutqfeliytoaamcmqny.supabase.co:5432/postgres
```

### 3. Ganti dengan connection string Neon yang baru:

```env
DATABASE_URL=postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 4. Hapus atau comment out baris `SUPABASE_DB_URL` (jika ada)

```env
# SUPABASE_DB_URL=postgresql://...  # <-- Comment out atau hapus
```

### 5. Save file `.env.local`

---

## ✅ Setelah Update

Jalankan test koneksi lagi:

```powershell
node scripts/test-neon-connection.js
```

Jika koneksi berhasil, lanjutkan dengan import schema.

---

## 📋 Isi Lengkap `.env.local` yang Benar

Berikut contoh isi file `.env.local` yang sudah benar:

```env
# Neon Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Supabase Configuration (untuk storage/auth jika masih dipakai)
NEXT_PUBLIC_SUPABASE_URL=https://giutqfeliytoaamcmqny.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Sistem Pelayanan Kelurahan Cibodas
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=your_session_secret_here

# ConvertAPI (jika dipakai)
CONVERTAPI_SECRET=your_convertapi_secret_here
```

**CATATAN:** Jangan commit file `.env.local` ke Git! File ini sudah di-gitignore untuk keamanan.
