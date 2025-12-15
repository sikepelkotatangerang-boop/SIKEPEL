# Setup Guide - Sistem Administrasi Surat Kelurahan Cibodas

## Prerequisites

- Node.js 18.x atau lebih tinggi
- npm atau yarn
- Akun Supabase (untuk database dan authentication)

## Langkah Instalasi

### 1. Install Dependencies

Jalankan perintah berikut di terminal:

```bash
npm install
```

### 2. Setup Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Dapatkan URL dan Anon Key dari Project Settings > API
4. Buat tabel-tabel berikut di Supabase SQL Editor:

```sql
-- Tabel Users (sudah otomatis dibuat oleh Supabase Auth)
-- Tambahkan kolom custom di auth.users jika diperlukan

-- Tabel untuk menyimpan profile user
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'staff', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor_surat TEXT NOT NULL UNIQUE,
  jenis_surat TEXT NOT NULL CHECK (jenis_surat IN ('masuk', 'keluar')),
  perihal TEXT NOT NULL,
  pengirim TEXT,
  penerima TEXT,
  tanggal_surat DATE NOT NULL,
  tanggal_diterima DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'diproses', 'selesai')),
  file_url TEXT,
  keterangan TEXT,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies untuk profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies untuk documents
CREATE POLICY "Documents are viewable by authenticated users"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update documents they created"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admin can delete any document"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Environment Variables

1. Copy file `.env.local.example` menjadi `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` dan isi dengan kredensial Supabase Anda:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## Struktur Folder

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── surat-masuk/      # Incoming mail management
│   ├── surat-keluar/     # Outgoing mail management
│   ├── pengguna/         # User management
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (redirect to login)
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   │   ├── Navbar.tsx
│   │   └── DashboardLayout.tsx
│   └── ui/               # UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Select.tsx
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript type definitions
    └── index.ts
```

## Fitur yang Tersedia

### ✅ Sudah Diimplementasi
- Login & Register UI
- Dashboard dengan statistik
- Manajemen Surat Masuk
- Manajemen Surat Keluar
- Manajemen Pengguna
- Responsive Design
- Search & Filter

### 🚧 Perlu Integrasi
- Koneksi ke Supabase untuk autentikasi
- CRUD operations untuk dokumen
- Upload file dokumen
- Export/Download dokumen
- Email notifications

## Integrasi Supabase Authentication

Untuk mengintegrasikan autentikasi Supabase, update file berikut:

### `src/app/login/page.tsx`

Ganti bagian `handleSubmit` dengan:

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    router.push('/dashboard');
  } catch (err: any) {
    setError(err.message || 'Email atau password salah');
  } finally {
    setLoading(false);
  }
};
```

### `src/app/register/page.tsx`

Ganti bagian `handleSubmit` dengan:

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');

  if (formData.password !== formData.confirmPassword) {
    setError('Password tidak cocok');
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name: formData.name,
        role: 'user',
      });
    }

    router.push('/login');
  } catch (err: any) {
    setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
  } finally {
    setLoading(false);
  }
};
```

## Build untuk Production

```bash
npm run build
npm start
```

## Deployment

Aplikasi ini dapat di-deploy ke:
- Vercel (recommended untuk Next.js)
- Netlify
- Railway
- VPS/Cloud Server

### Deploy ke Vercel

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Set environment variables di Vercel dashboard
4. Deploy!

## Support

Untuk pertanyaan atau bantuan, hubungi tim IT Kelurahan Cibodas.
