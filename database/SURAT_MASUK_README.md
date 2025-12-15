# Setup Surat Masuk

## 1. Create Database Table

Run the SQL script:
```bash
psql -U your_username -d your_database -f database/create_surat_masuk_table.sql
```

## 2. API Endpoints

### POST /api/surat-masuk
Create new surat masuk with optional PDF upload.

**Request:** multipart/form-data
- nomor_surat (required)
- tanggal_masuk (required)
- tanggal_surat (required)
- asal_surat (required)
- perihal (required)
- disposisi (optional)
- file (optional) - PDF file
- kelurahanId (optional)
- userId (optional)

**Response:**
```json
{
  "success": true,
  "message": "Surat masuk berhasil ditambahkan",
  "data": {
    "id": 1,
    "nomor_surat": "SM/001/2024",
    "file_url": "https://..."
  }
}
```

### GET /api/surat-masuk
Get list of surat masuk.

**Query Parameters:**
- page (default: 1)
- limit (default: 100)
- search (optional)
- kelurahanId (optional)
- status (optional)

## 3. Features

✅ Modal form untuk input data
✅ Upload PDF ke Supabase Storage
✅ Save data ke database
✅ List surat masuk dengan filter
✅ View & download PDF
✅ Status management (pending/diproses/selesai)

## 4. Usage

1. Klik "Tambah Surat Masuk"
2. Isi form (field dengan * wajib)
3. Upload PDF (opsional)
4. Klik "Simpan"
5. Data tersimpan & muncul di list
