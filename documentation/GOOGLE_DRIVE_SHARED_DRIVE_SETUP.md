# Setup Google Drive dengan Shared Drive

## Masalah

Service Account tidak memiliki storage quota sendiri, sehingga tidak bisa menyimpan file di "My Drive" mereka. Error yang muncul:

```
Service Accounts do not have storage quota. 
Leverage shared drives or use OAuth delegation instead.
```

## Solusi: Gunakan Shared Drive

Shared Drive (Google Workspace) memiliki storage terpisah dan bisa diakses oleh Service Account.

---

## Prerequisites

- **Google Workspace Account** (bukan akun Gmail gratis)
- Akses untuk membuat Shared Drive
- Service Account sudah dibuat (sudah selesai ✅)

---

## Langkah-langkah Setup

### 1. Buat Shared Drive

1. **Buka Google Drive** (dengan akun Google Workspace)
   - https://drive.google.com

2. **Buat Shared Drive baru**:
   - Klik "Shared drives" di sidebar kiri
   - Klik tombol **"+ New"** atau **"New shared drive"**
   - Nama: `SKTM Documents` (atau nama lain sesuai kebutuhan)
   - Klik **"Create"**

### 2. Tambahkan Service Account sebagai Member

1. **Buka Shared Drive** yang baru dibuat

2. **Klik ⚙️ (Settings icon)** di pojok kanan atas

3. **Pilih "Manage members"**

4. **Add member**:
   - Email: `uploader@pelayanan-kelurahan-474704.iam.gserviceaccount.com`
   - Role: Pilih **"Content Manager"** atau **"Manager"**
     - **Content Manager**: Bisa upload, edit, delete file
     - **Manager**: Full access termasuk manage members
   - Klik **"Send"** atau **"Done"**

### 3. Dapatkan Shared Drive ID

Ada 2 cara:

#### Cara 1: Dari URL (Paling Mudah)

1. Buka Shared Drive di browser
2. Copy URL dari address bar:
   ```
   https://drive.google.com/drive/folders/0ABC123xyz...
                                          ↑ Ini adalah Drive ID
   ```
3. Copy bagian setelah `/folders/`

#### Cara 2: Menggunakan API (Advanced)

```javascript
// Script untuk list semua Shared Drives
const { google } = require('googleapis');

async function listSharedDrives() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });
  
  const response = await drive.drives.list({
    pageSize: 10,
  });

  console.log('Shared Drives:');
  response.data.drives?.forEach(drive => {
    console.log(`- ${drive.name}: ${drive.id}`);
  });
}

listSharedDrives();
```

### 4. Update Environment Variable

Edit file `.env.local`:

```bash
# Google Drive Folder ID (Shared Drive ID)
GOOGLE_DRIVE_FOLDER_ID=0ABC123xyz...
```

**PENTING:** 
- Gunakan ID Shared Drive, bukan URL lengkap
- Restart development server setelah update

### 5. Verifikasi Setup

1. **Test upload file**:
   - Buka aplikasi
   - Buat dokumen SKTM baru
   - Proses hingga selesai

2. **Cek di Google Drive**:
   - Buka Shared Drive "SKTM Documents"
   - File PDF harus muncul di sana

3. **Test download**:
   - Buka halaman Daftar Surat
   - Klik "Lihat" atau "Unduh"
   - File harus bisa diakses

---

## Troubleshooting

### Error: "File not found"

**Penyebab:** Shared Drive ID salah atau Service Account belum ditambahkan

**Solusi:**
1. Verifikasi Shared Drive ID benar
2. Pastikan Service Account sudah ditambahkan sebagai member
3. Tunggu beberapa menit untuk propagasi permission

### Error: "Insufficient permissions"

**Penyebab:** Service Account tidak memiliki permission yang cukup

**Solusi:**
1. Buka Shared Drive settings
2. Cek role Service Account
3. Ubah ke "Content Manager" atau "Manager"

### Error: "Shared drive not found"

**Penyebab:** Menggunakan folder biasa, bukan Shared Drive

**Solusi:**
1. Pastikan menggunakan **Shared Drive**, bukan folder di "My Drive"
2. Shared Drive hanya tersedia di Google Workspace

---

## Alternatif: Tanpa Shared Drive

Jika tidak memiliki Google Workspace, ada 2 alternatif:

### Alternatif 1: Upload ke User's Drive dengan OAuth

Menggunakan OAuth untuk upload ke Drive user yang login.

**Kelebihan:**
- Tidak perlu Google Workspace
- Menggunakan storage quota user

**Kekurangan:**
- User harus login dengan Google
- Lebih kompleks untuk implement

### Alternatif 2: Simpan File Lokal

Simpan PDF di server/local storage.

**Kelebihan:**
- Tidak perlu Google Drive
- Lebih cepat

**Kekurangan:**
- Tidak ada cloud backup
- Perlu manage storage server sendiri

**Implementasi:**
```typescript
// Simpan ke folder public/documents
const filePath = path.join(process.cwd(), 'public', 'documents', fileName);
fs.writeFileSync(filePath, pdfBuffer);

// URL untuk download
const fileUrl = `/documents/${fileName}`;
```

---

## Kode yang Sudah Diupdate

File `src/lib/googleDrive.ts` sudah diupdate dengan:

1. **`supportsAllDrives: true`** di semua API calls
2. Support untuk Shared Drive di:
   - Upload file
   - Download file
   - Delete file
   - Get metadata
   - Create folder

Tidak perlu perubahan kode lagi, cukup setup Shared Drive dan update environment variable.

---

## Checklist Setup

- [ ] Buat Shared Drive di Google Drive
- [ ] Tambahkan Service Account sebagai member (Content Manager/Manager)
- [ ] Copy Shared Drive ID
- [ ] Update `GOOGLE_DRIVE_FOLDER_ID` di `.env.local`
- [ ] Restart development server
- [ ] Test upload dokumen SKTM
- [ ] Verifikasi file muncul di Shared Drive
- [ ] Test download dari Daftar Surat

---

## Support

Jika masih ada masalah:

1. Cek console log untuk error detail
2. Verifikasi Service Account credentials valid
3. Pastikan Google Drive API sudah enabled
4. Cek permission Shared Drive

**Last Updated:** 2025-10-10
