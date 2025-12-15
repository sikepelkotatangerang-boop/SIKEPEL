# Implementasi Surat Pindah Keluar

## Overview
Sistem pembuatan Surat Pindah Keluar menggunakan template resmi F-103.docx dengan konversi ke PDF melalui ConvertAPI dan penyimpanan otomatis ke database.

## Alur Proses

### 1. Form Input (`/form-surat/pindah-keluar`)
- User mengisi data pemohon dan anggota keluarga yang pindah
- Data disimpan ke sessionStorage dengan key `pindahKeluarFormData`
- Redirect ke preview page

### 2. Preview Page (`/preview-pindah-keluar`)
- Load data dari sessionStorage
- Tampilkan preview HTML melalui API `/api/preview-pindah-keluar-html`
- Tombol "Proses & Simpan" untuk generate PDF final

### 3. Process & Save (`/api/process-pindah-keluar`)

#### Alur Lengkap:
```
1. Load template F-103.docx dari /public/template/
2. Populate data menggunakan Docxtemplater
3. Generate DOCX buffer
4. Save ke temporary file
5. Konversi DOCX → PDF menggunakan ConvertAPI
6. Download PDF dari ConvertAPI
7. Upload PDF ke Supabase Storage (bucket: surat-documents)
8. Save metadata ke database Supabase (table: surat)
9. Return PDF untuk download ke user
10. Cleanup temporary files
```

## Teknologi yang Digunakan

### Backend
- **Docxtemplater**: Populate template DOCX dengan data form
- **PizZip**: Handle ZIP format untuk DOCX
- **ConvertAPI**: Konversi DOCX ke PDF (cloud service)
- **Supabase Storage**: Penyimpanan file PDF
- **Supabase Database**: Penyimpanan metadata dokumen

### Frontend
- **Next.js 14**: Framework React
- **TypeScript**: Type safety
- **SessionStorage**: Transfer data antar halaman
- **Blob API**: Handle PDF download

## API Endpoints

### POST `/api/process-pindah-keluar`

**Request Body:**
```json
{
  "formData": {
    "tanggal_surat": "2025-01-20",
    "no_kk_pemohon": "1234567890123456",
    "nama_pemohon": "John Doe",
    "nik_pemohon": "1234567890123456",
    "no_hp_pemohon": "081234567890",
    "email_pemohon": "john@example.com",
    "jenis_permohonan": "Pindah Keluar",
    "alamat_asal": "Jl. Contoh No. 123",
    "rt_asal": "001",
    "rw_asal": "002",
    "kel_asal": "Cibodas",
    "kec_asal": "Tangerang",
    "kota_asal": "Kota Tangerang",
    "provinsi_asal": "Banten",
    "pos_asal": "15138",
    "alamat_pindah": "Jl. Tujuan No. 456",
    "rt_pindah": "003",
    "rw_pindah": "004",
    "kel_pindah": "Kelurahan Baru",
    "kec_pindah": "Kecamatan Baru",
    "kota_kab_pindah": "Kota Baru",
    "provinsi_pindah": "Provinsi Baru",
    "pos_pindah": "12345",
    "no_klasifikasi_pindah": "1",
    "no_alasan_pindah": "1",
    "no_jenis_pindah": "1",
    "no_anggota_pindah": "2",
    "no_keluarga_pindah": "1",
    "anggota_keluarga": [
      {
        "no_urut": "1",
        "nik": "1234567890123456",
        "nama": "John Doe",
        "shdk": "Kepala Keluarga"
      }
    ]
  },
  "userId": "user-uuid-here"
}
```

**Response:**
- **Success**: PDF file (binary) dengan headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="pindah-keluar-...pdf"`
  - `X-Document-Id`: ID dokumen di database
  - `X-Document-Url`: Public URL di Supabase Storage

- **Error**: JSON dengan status 500
  ```json
  {
    "error": "Error message"
  }
  ```

## Database Schema

### Table: `surat`
```sql
{
  id: uuid (primary key),
  jenis_surat: 'Surat Pindah Keluar',
  nomor_surat: string (no_kk_pemohon),
  nama_pemohon: string,
  nik_pemohon: string,
  file_url: string (public URL),
  status: 'selesai',
  user_id: uuid (foreign key),
  metadata: jsonb (full form data),
  created_at: timestamp,
  updated_at: timestamp
}
```

## File Structure

```
src/
├── app/
│   ├── form-surat/
│   │   └── pindah-keluar/
│   │       └── page.tsx          # Form input
│   ├── preview-pindah-keluar/
│   │   └── page.tsx              # Preview & process
│   └── api/
│       ├── process-pindah-keluar/
│       │   └── route.ts          # Main processing API
│       └── preview-pindah-keluar-html/
│           └── route.ts          # HTML preview API
public/
└── template/
    └── F-103.docx                # Template resmi
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ConvertAPI
CONVERTAPI_SECRET=your_convertapi_secret
```

## Features

### ✅ Implemented
1. **Template F-103.docx**: Menggunakan template resmi pemerintah
2. **ConvertAPI Integration**: Konversi DOCX ke PDF dengan kualitas tinggi
3. **Supabase Storage**: Penyimpanan file PDF yang aman
4. **Database Logging**: Semua dokumen tercatat dengan metadata lengkap
5. **Auto Download**: PDF otomatis terdownload setelah proses selesai
6. **Error Handling**: Comprehensive error handling dan logging
7. **Cleanup**: Automatic cleanup temporary files
8. **Response Headers**: Document ID dan URL di response headers

### 📝 Notes
- Template F-103 hanya menampilkan 1 anggota keluarga pertama
- Data lengkap semua anggota keluarga tersimpan di field `metadata` (JSONB)
- Temporary DOCX files dibuat di OS temp directory dan otomatis dihapus
- ConvertAPI memerlukan secret key yang valid
- File naming: `pindah-keluar-{nama_pemohon}-{timestamp}.pdf`

## Error Handling

### Common Errors:
1. **Template not found**: Pastikan F-103.docx ada di `/public/template/`
2. **ConvertAPI error**: Check CONVERTAPI_SECRET dan quota
3. **Upload error**: Verify Supabase credentials dan bucket permissions
4. **Database error**: Check table schema dan user permissions

### Debugging:
- Check console logs untuk tracking proses
- Response headers berisi document ID dan URL
- Error messages descriptive dan user-friendly

## Testing Checklist

- [ ] Form validation works correctly
- [ ] Preview displays all data accurately
- [ ] ConvertAPI converts DOCX to PDF successfully
- [ ] PDF is uploaded to Supabase Storage
- [ ] Database record is created with correct metadata
- [ ] PDF downloads automatically to user's computer
- [ ] Success message displays correctly
- [ ] Redirect to /daftar-surat works
- [ ] Error handling works for all failure scenarios
- [ ] Temporary files are cleaned up

## Future Improvements

1. **Multiple Family Members**: Update template to support multiple rows
2. **Batch Processing**: Process multiple documents at once
3. **Email Notification**: Send PDF via email
4. **Digital Signature**: Add e-signature support
5. **Audit Trail**: Track document revisions and approvals
6. **Print Queue**: Manage printing workflow
7. **QR Code**: Add QR code for document verification

## Maintenance

### Regular Tasks:
- Monitor ConvertAPI usage and quota
- Check Supabase Storage capacity
- Review error logs
- Update template if government changes format
- Backup database regularly

### Dependencies:
```json
{
  "docxtemplater": "^3.x",
  "pizzip": "^3.x",
  "@supabase/supabase-js": "^2.x",
  "form-data": "^4.x"
}
```

## Support

Untuk pertanyaan atau issue, hubungi tim development atau buat issue di repository.

---
**Last Updated**: 2025-01-20
**Version**: 1.0.0
**Status**: Production Ready ✅
