# Fitur Halaman Daftar Surat

## Overview
Halaman daftar surat digunakan untuk melihat semua dokumen surat yang telah dibuat dan mengunduh file PDF yang tersimpan di storage.

## Fitur yang Tersedia

### 1. Tampilan Daftar Dokumen
- Menampilkan semua dokumen surat yang telah dibuat
- Informasi yang ditampilkan:
  - Nomor surat
  - Jenis dokumen (SKTM, Domisili, Usaha, Kelahiran)
  - Perihal
  - Nama subjek
  - NIK subjek
  - Tanggal surat
  - Kelurahan
  - Pembuat dokumen
  - Pejabat penandatangan

### 2. Statistik Dokumen
- Total dokumen
- Dokumen minggu ini
- Dokumen bulan ini

### 3. Pencarian & Filter
- Pencarian berdasarkan:
  - Nama subjek
  - NIK
  - Nomor surat
  - Perihal
- Filter berdasarkan jenis dokumen

### 4. Download & Preview PDF
- **Lihat**: Membuka PDF di tab baru untuk preview
  - Prioritas: Google Drive URL (jika ada)
  - Fallback: Download dari Supabase Storage
- **Unduh**: Download file PDF langsung ke komputer
  - Prioritas: Download dari Supabase Storage (jika ada file_name)
  - Fallback: Buka Google Drive URL

### 5. Pagination
- Navigasi halaman untuk dokumen yang banyak
- Menampilkan 10 dokumen per halaman

## API Endpoints

### GET /api/documents
Mendapatkan daftar dokumen dengan pagination dan filter
- Query params:
  - `page`: Nomor halaman (default: 1)
  - `limit`: Jumlah data per halaman (default: 10)
  - `search`: Kata kunci pencarian
  - `jenisDokumen`: Filter jenis dokumen
  - `kelurahanId`: Filter berdasarkan kelurahan
  - `userId`: Filter berdasarkan pembuat

### GET /api/documents/download
Download file PDF dari Supabase Storage
- Query params:
  - `fileName`: Nama file yang akan didownload (required)
  - `bucket`: Nama bucket storage (default: 'documents')

### PUT /api/documents
Mendapatkan statistik dokumen
- Query params:
  - `kelurahanId`: Filter berdasarkan kelurahan
  - `userId`: Filter berdasarkan pembuat

## Storage Integration

### Supabase Storage
- Bucket: `documents`
- File format: PDF
- Fungsi yang digunakan:
  - `downloadFromSupabase()`: Download file dari storage
  - `uploadToSupabase()`: Upload file ke storage (digunakan saat pembuatan dokumen)

### Google Drive (Fallback)
- Digunakan sebagai backup storage
- URL disimpan di field `google_drive_url`

## Role-Based Access
- **Admin**: Dapat melihat semua dokumen dari semua kelurahan
- **Staff**: Hanya dapat melihat dokumen dari kelurahan mereka sendiri
- **User**: Dapat melihat dokumen yang mereka buat

## Technical Details

### Database Schema
Table: `document_archives`
- `id`: Primary key
- `nomor_surat`: Nomor surat
- `jenis_dokumen`: Jenis dokumen
- `tanggal_surat`: Tanggal surat
- `perihal`: Perihal surat
- `nama_subjek`: Nama subjek
- `nik_subjek`: NIK subjek
- `file_name`: Nama file di Supabase Storage
- `google_drive_id`: ID file di Google Drive
- `google_drive_url`: URL file di Google Drive
- `kelurahan_id`: ID kelurahan
- `pejabat_id`: ID pejabat penandatangan
- `created_by`: ID pembuat
- `status`: Status dokumen (active/archived)

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Usage Example

### Download File
```typescript
// Client-side download
const handleDownload = async (doc: Document) => {
  if (doc.file_name) {
    const downloadUrl = `/api/documents/download?fileName=${encodeURIComponent(doc.file_name)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```

### Preview File
```typescript
// Open in new tab
window.open(`/api/documents/download?fileName=${encodeURIComponent(fileName)}`, '_blank');
```
