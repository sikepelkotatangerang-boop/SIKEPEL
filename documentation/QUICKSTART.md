# Quick Start Guide

## Langkah Cepat untuk Memulai

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy file environment
cp .env.local.example .env.local

# Edit .env.local dan isi dengan kredensial Supabase Anda
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Jalankan Development Server
```bash
npm run dev
```

### 4. Buka Browser
Akses aplikasi di: http://localhost:3000

## Default Routes

- `/` - Redirect ke login
- `/login` - Halaman login
- `/register` - Halaman registrasi
- `/dashboard` - Dashboard utama
- `/surat-masuk` - Manajemen surat masuk
- `/surat-keluar` - Manajemen surat keluar
- `/pengguna` - Manajemen pengguna

## Catatan Penting

⚠️ **Sebelum menggunakan aplikasi secara penuh:**

1. Setup database Supabase (lihat SETUP.md untuk SQL schema)
2. Isi environment variables di `.env.local`
3. Integrasikan autentikasi Supabase (contoh ada di SETUP.md)

## Teknologi yang Digunakan

- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend & Authentication
- **Lucide React** - Icons

## Struktur Project

```
Pelayanan3/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   ├── components/       # Reusable components
│   ├── lib/             # Utilities & configs
│   └── types/           # TypeScript types
├── public/              # Static files
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.ts   # Tailwind config
└── next.config.mjs      # Next.js config
```

## Bantuan Lebih Lanjut

- Lihat `README.md` untuk overview lengkap
- Lihat `SETUP.md` untuk setup detail dan integrasi Supabase
- Dokumentasi Next.js: https://nextjs.org/docs
- Dokumentasi Supabase: https://supabase.com/docs
