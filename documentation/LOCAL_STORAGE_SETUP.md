# Setup Local Storage untuk Dokumen SKTM

## Overview

Karena Anda hanya memiliki **akun Gmail gratis** (bukan Google Workspace), sistem ini menggunakan **Local Storage** untuk menyimpan file PDF dokumen SKTM.

File disimpan di folder `public/uploads/sktm/` dan bisa diakses melalui URL public.

---

## Keuntungan Local Storage

✅ **Gratis** - Tidak perlu Google Workspace  
✅ **Sederhana** - Tidak perlu konfigurasi cloud  
✅ **Cepat** - Akses langsung dari server  
✅ **Mudah** - Tidak perlu API keys tambahan  

## Kekurangan

⚠️ **Tidak ada cloud backup** - File hanya ada di server  
⚠️ **Storage terbatas** - Tergantung kapasitas server  
⚠️ **Tidak portable** - Jika ganti server, file hilang  

---

## Struktur Folder

```
public/
└── uploads/
    └── sktm/
        ├── SKTM_Budi_Santoso_1728540000000.pdf
        ├── SKTM_Siti_Nurhaliza_1728540123456.pdf
        └── ...
```

**Format nama file:**
```
SKTM_{nama_pemohon}_{timestamp}.pdf
```

---

## Cara Kerja

### 1. Saat Proses Dokumen

```typescript
// Generate PDF
const pdfBuffer = readFileSync(tempPdfPath);

// Simpan ke public/uploads/sktm/
const fileName = `SKTM_${nama}_${Date.now()}.pdf`;
const uploadsDir = join(process.cwd(), 'public', 'uploads', 'sktm');
const filePath = join(uploadsDir, fileName);

writeFileSync(filePath, pdfBuffer);

// Generate URL public
const fileUrl = `/uploads/sktm/${fileName}`;
```

### 2. Simpan ke Database

```sql
INSERT INTO sktm_documents (
  ...
  google_drive_url,  -- Berisi URL local: /uploads/sktm/xxx.pdf
  file_name,
  ...
)
```

### 3. Download dari Daftar Surat

```typescript
// URL dari database: /uploads/sktm/SKTM_xxx.pdf
window.open(doc.google_drive_url, '_blank');
```

---

## Setup

### 1. Folder Otomatis Dibuat

Folder `public/uploads/sktm/` akan **otomatis dibuat** saat pertama kali proses dokumen.

Tidak perlu setup manual!

### 2. Gitignore

Folder `public/uploads/` sudah ditambahkan ke `.gitignore` agar file PDF tidak ter-commit ke git.

```gitignore
# Uploaded files (PDF documents)
public/uploads/
```

### 3. Permissions (Linux/Mac)

Jika deploy di Linux/Mac, pastikan folder writable:

```bash
chmod -R 755 public/uploads
```

---

## Testing

### 1. Test Proses Dokumen

1. Buka form SKTM: http://localhost:3000/form-surat/sktm
2. Isi data atau klik "Generate Data Contoh"
3. Klik "Preview"
4. Klik "Proses & Simpan"
5. PDF akan terdownload otomatis

### 2. Cek File Tersimpan

```bash
# Windows
dir public\uploads\sktm

# Linux/Mac
ls -lh public/uploads/sktm/
```

### 3. Test Download dari Daftar Surat

1. Buka: http://localhost:3000/daftar-surat
2. Cari dokumen yang baru dibuat
3. Klik "Lihat" atau "Unduh"
4. File harus terbuka di tab baru

### 4. Test URL Langsung

Buka di browser:
```
http://localhost:3000/uploads/sktm/SKTM_Budi_Santoso_1728540000000.pdf
```

---

## Backup Manual

Karena tidak ada cloud backup otomatis, Anda perlu backup manual secara berkala.

### Cara Backup

#### Windows:
```powershell
# Backup ke external drive
Copy-Item -Path "public\uploads\sktm\*" -Destination "E:\Backup\SKTM\" -Recurse

# Atau compress ke ZIP
Compress-Archive -Path "public\uploads\sktm\*" -DestinationPath "backup_sktm_$(Get-Date -Format 'yyyyMMdd').zip"
```

#### Linux/Mac:
```bash
# Backup ke folder lain
cp -r public/uploads/sktm/* /path/to/backup/

# Atau tar.gz
tar -czf backup_sktm_$(date +%Y%m%d).tar.gz public/uploads/sktm/
```

### Jadwal Backup Recommended

- **Harian:** Jika banyak dokumen dibuat setiap hari
- **Mingguan:** Untuk volume sedang
- **Bulanan:** Untuk volume rendah

---

## Migrasi ke Cloud (Optional)

Jika di masa depan Anda ingin upgrade ke cloud storage:

### Option 1: Google Drive dengan OAuth

Menggunakan OAuth untuk upload ke Drive user yang login.

**Kelebihan:**
- Tidak perlu Google Workspace
- Menggunakan storage quota user

**Kekurangan:**
- User harus login dengan Google
- Lebih kompleks

### Option 2: Cloud Storage Lain

Alternatif cloud storage yang bisa digunakan:

1. **AWS S3**
   - Pay as you go
   - Reliable dan scalable
   - SDK: `@aws-sdk/client-s3`

2. **Cloudinary**
   - Free tier: 25GB storage
   - Mudah digunakan
   - SDK: `cloudinary`

3. **Supabase Storage**
   - Free tier: 1GB storage
   - Terintegrasi dengan database
   - SDK: `@supabase/storage-js`

---

## Monitoring Storage

### Cek Ukuran Folder

#### Windows:
```powershell
Get-ChildItem -Path "public\uploads\sktm" -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name="Size(MB)";Expression={[math]::Round($_.Sum/1MB,2)}}
```

#### Linux/Mac:
```bash
du -sh public/uploads/sktm/
```

### Cleanup Old Files (Optional)

Jika storage penuh, hapus file lama:

```bash
# Hapus file lebih dari 1 tahun
find public/uploads/sktm/ -type f -mtime +365 -delete

# Atau pindahkan ke archive
find public/uploads/sktm/ -type f -mtime +365 -exec mv {} /path/to/archive/ \;
```

---

## Troubleshooting

### Error: "ENOENT: no such file or directory"

**Penyebab:** Folder `public/uploads/sktm` belum ada

**Solusi:** Folder seharusnya dibuat otomatis. Jika tidak, buat manual:
```bash
mkdir -p public/uploads/sktm
```

### Error: "EACCES: permission denied"

**Penyebab:** Tidak ada permission untuk write

**Solusi:**
```bash
# Linux/Mac
chmod -R 755 public/uploads

# Windows: Run as Administrator
```

### File tidak bisa diakses via URL

**Penyebab:** Next.js static files hanya dari folder `public/`

**Solusi:** Pastikan path benar: `/uploads/sktm/filename.pdf` (tanpa `public/`)

### Storage penuh

**Solusi:**
1. Backup file lama
2. Hapus atau archive file lama
3. Upgrade server storage
4. Atau migrate ke cloud storage

---

## Production Deployment

### Vercel / Netlify

⚠️ **Tidak recommended** untuk local storage karena:
- Serverless functions tidak persistent
- File akan hilang setelah deployment baru

**Solusi:** Gunakan cloud storage (S3, Cloudinary, dll)

### VPS / Dedicated Server

✅ **Recommended** untuk local storage:
- File persistent
- Full control
- Bisa backup manual

**Setup:**
1. Deploy aplikasi ke VPS
2. Pastikan folder `public/uploads` writable
3. Setup cron job untuk backup otomatis
4. Monitor disk space

---

## Summary

✅ **Local storage** cocok untuk:
- Akun Gmail gratis (bukan Workspace)
- Volume dokumen tidak terlalu banyak
- Deploy di VPS/dedicated server
- Budget terbatas

⚠️ **Perlu diperhatikan:**
- Backup manual secara berkala
- Monitor disk space
- Tidak cocok untuk serverless deployment

📚 **Dokumentasi terkait:**
- `SKTM_PREVIEW_WORKFLOW.md` - Workflow lengkap
- `GOOGLE_DRIVE_SHARED_DRIVE_SETUP.md` - Alternatif cloud storage

---

**Last Updated:** 2025-10-10
