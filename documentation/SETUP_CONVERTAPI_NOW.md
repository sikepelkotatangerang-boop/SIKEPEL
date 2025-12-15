# Setup ConvertAPI - Langkah Cepat

## ⚠️ PENTING: Buat File .env.local

Anda perlu membuat file `.env.local` di root project dengan API key ConvertAPI.

### Langkah 1: Buat File .env.local

Buat file baru: `d:\Project\Kelurahan Cibodas\Pelayanan3\.env.local`

### Langkah 2: Copy Isi File

Copy semua isi dari `.env.example` ke `.env.local`, lalu update dengan API key Anda:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Database Connection (PostgreSQL)
DATABASE_URL=postgresql://postgres:your_password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Alternative (same as DATABASE_URL)
SUPABASE_DB_URL=postgresql://postgres:your_password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Application Configuration
NEXT_PUBLIC_APP_NAME=Sistem Pelayanan Kelurahan Cibodas
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret (untuk authentication)
SESSION_SECRET=your_session_secret_here_change_in_production

# ConvertAPI Configuration
# Get your free API key from: https://www.convertapi.com/a/signup
# Free tier: 250 conversions/month
CONVERTAPI_SECRET=36jlXZ2DlybNSC60GBAbfqy4FNAHGNSg
```

### Langkah 3: Restart Development Server

Setelah membuat `.env.local`, restart server:

1. Stop server (Ctrl+C)
2. Jalankan lagi: `npm run dev`

## Verifikasi

Setelah restart, coba generate SKTM lagi. Jika masih error, cek:

1. ✅ File `.env.local` ada di root project
2. ✅ `CONVERTAPI_SECRET` terisi dengan benar
3. ✅ Server sudah di-restart
4. ✅ API key valid (cek di https://www.convertapi.com/a/auth)

## Troubleshooting

### Error: "ConvertAPI configuration missing"

**Solusi:** File `.env.local` tidak ada atau `CONVERTAPI_SECRET` kosong

### Error: "Unauthorized" atau "Invalid secret"

**Solusi:** API key salah, dapatkan yang baru dari https://www.convertapi.com/a/auth

### Error: "Quota exceeded"

**Solusi:** Sudah mencapai limit 250 konversi/bulan, tunggu bulan depan atau upgrade

## Quick Commands

```bash
# 1. Buat .env.local (manual atau copy)
copy .env.example .env.local

# 2. Edit .env.local dan tambahkan CONVERTAPI_SECRET

# 3. Restart server
npm run dev
```

## Status Saat Ini

Berdasarkan `.env.example`, API key Anda:
```
CONVERTAPI_SECRET=36jlXZ2DlybNSC60GBAbfqy4FNAHGNSg
```

⚠️ **JANGAN commit API key ke Git!** File `.env.local` sudah ada di `.gitignore`.
