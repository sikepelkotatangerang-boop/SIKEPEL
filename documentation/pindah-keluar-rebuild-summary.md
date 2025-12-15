# Pindah Keluar - Rebuild dengan Logic SKTM

## Overview
Form Pindah Keluar telah di-rebuild menggunakan pattern yang sama dengan SKTM untuk konsistensi dan reliability yang lebih baik.

## Perubahan Utama

### 1. API Route (`/api/process-pindah-keluar/route.ts`)

#### ✅ Yang Diubah:

**Sebelumnya:**
- Menggunakan `fetch()` manual ke ConvertAPI endpoint
- Menggunakan Supabase client langsung
- Error handling yang kompleks
- Response dengan custom headers

**Sekarang (Pattern SKTM):**
- ✅ Menggunakan `ConvertAPI` library (npm package)
- ✅ Menggunakan `uploadToSupabase()` helper function
- ✅ Menggunakan `db.query()` untuk database (PostgreSQL)
- ✅ Simpan ke table `document_archives` (bukan `surat`)
- ✅ Cleanup temporary files di `finally` block
- ✅ Error handling yang lebih sederhana dan konsisten

#### Alur Proses Baru:

```
1. Validasi formData dan ConvertAPI secret
2. Load template F-103.docx
3. Render template dengan Docxtemplater
4. Generate DOCX buffer
5. Save DOCX ke temporary file
6. Convert DOCX → PDF dengan ConvertAPI library
7. Save PDF ke temporary file
8. Read PDF buffer
9. Upload ke Supabase Storage (bucket: pdf_surat, folder: pindah-keluar)
10. Save metadata ke database (table: document_archives)
11. Return PDF untuk download
12. Cleanup temporary files (DOCX & PDF)
```

#### Dependencies Baru:

```typescript
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import db from '@/lib/db';
import ConvertAPI from 'convertapi';
import { uploadToSupabase } from '@/lib/supabaseStorage';
```

### 2. Preview Page (`/preview-pindah-keluar/page.tsx`)

#### ✅ Yang Diubah:

**Sebelumnya:**
- Function `handleProcessAndSave()` dengan logging berlebihan
- Error handling dengan state management kompleks
- Response header parsing

**Sekarang (Pattern SKTM):**
- ✅ Function `handleProcess()` yang lebih sederhana
- ✅ Error handling dengan `alert()` langsung
- ✅ Tidak perlu parse response headers
- ✅ Fokus pada user experience yang clean

#### Simplifikasi:

```typescript
// SEBELUMNYA: ~90 lines dengan banyak console.log dan state management
handleProcessAndSave() {
  // Complex error handling
  // Response header parsing
  // Multiple state updates
  // Detailed logging
}

// SEKARANG: ~40 lines, clean dan straightforward
handleProcess() {
  // Simple try-catch
  // Direct error alert
  // Clean success flow
}
```

## Database Schema

### Table: `document_archives`

```sql
INSERT INTO document_archives (
  nomor_surat,           -- No KK Pemohon
  jenis_dokumen,         -- 'Surat Pindah Keluar'
  tanggal_surat,         -- Tanggal surat
  perihal,               -- 'Surat Pindah Keluar - {jenis_permohonan}'
  nik_subjek,            -- NIK Pemohon
  nama_subjek,           -- Nama Pemohon
  alamat_subjek,         -- Alamat asal lengkap
  data_detail,           -- JSONB: semua data form
  google_drive_id,       -- Supabase file ID
  google_drive_url,      -- Supabase public URL
  file_name,             -- Path file di storage
  file_size,             -- Size dalam bytes
  mime_type,             -- 'application/pdf'
  created_by,            -- User ID
  status                 -- 'active'
) VALUES (...)
```

### Data Detail (JSONB):

```json
{
  "no_kk_pemohon": "...",
  "nik_pemohon": "...",
  "no_hp_pemohon": "...",
  "email_pemohon": "...",
  "jenis_permohonan": "...",
  "alamat_asal": "... (formatted)",
  "alamat_pindah": "... (formatted)",
  "no_klasifikasi_pindah": "...",
  "no_alasan_pindah": "...",
  "no_jenis_pindah": "...",
  "no_anggota_pindah": "...",
  "no_keluarga_pindah": "...",
  "anggota_keluarga": [...]
}
```

## Supabase Storage

### Bucket: `pdf_surat`
### Folder Structure:
```
pdf_surat/
  └── pindah-keluar/
      ├── John_Doe_1234567890.pdf
      ├── Jane_Smith_1234567891.pdf
      └── ...
```

### File Naming:
```
{nama_pemohon_underscore}_{timestamp}.pdf
```

## ConvertAPI Integration

### Menggunakan npm Package:

```typescript
import ConvertAPI from 'convertapi';

const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);
const result = await convertapi.convert('pdf', { File: tempDocxPath }, 'docx');
await result.files[0].save(tempPdfPath);
```

**Keuntungan:**
- ✅ Lebih reliable
- ✅ Built-in error handling
- ✅ Automatic file management
- ✅ Type-safe dengan TypeScript
- ✅ Consistent dengan SKTM

## Error Handling

### API Route:

```typescript
try {
  // Process document
} catch (error) {
  console.error('❌ Error processing Pindah Keluar:', error);
  return NextResponse.json(
    { 
      error: 'Failed to process Pindah Keluar document', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    },
    { status: 500 }
  );
} finally {
  // Cleanup temporary files
  if (tempDocxPath) unlinkSync(tempDocxPath);
  if (tempPdfPath) unlinkSync(tempPdfPath);
}
```

### Frontend:

```typescript
try {
  // Call API
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Gagal memproses dokumen');
  }
  // Success flow
} catch (error) {
  alert(`Terjadi kesalahan: ${error.message}`);
}
```

## Logging

### Server Logs (Console):

```
📥 Processing Pindah Keluar for: John Doe
📄 Loading template F-103.docx...
🔄 Rendering document...
📦 DOCX generated, size: 123456 bytes
💾 Temporary DOCX saved: /tmp/pindah_keluar_1234567890.docx
🚀 Converting DOCX to PDF with ConvertAPI...
✅ PDF saved to: /tmp/pindah_keluar_1234567891.pdf
📄 PDF buffer size: 234567 bytes
☁️ Uploaded to Supabase Storage: https://...
💾 Saved to document_archives, ID: 123
🧹 Temporary files cleaned up
```

## Testing Checklist

- [ ] Form submission works
- [ ] Preview displays correctly
- [ ] ConvertAPI converts DOCX to PDF
- [ ] PDF uploads to Supabase Storage (bucket: pdf_surat)
- [ ] Database record created in document_archives table
- [ ] PDF downloads automatically
- [ ] Success message displays
- [ ] Redirect to /daftar-surat works
- [ ] Temporary files cleaned up
- [ ] Error handling works for all scenarios

## Environment Variables Required

```env
# ConvertAPI
CONVERTAPI_SECRET=your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Database (PostgreSQL)
DATABASE_URL=postgresql://...
```

## Migration Notes

### Breaking Changes:
1. ❌ Tidak lagi menggunakan table `surat` (Supabase)
2. ✅ Sekarang menggunakan table `document_archives` (PostgreSQL)
3. ❌ Tidak lagi menggunakan bucket `surat-documents`
4. ✅ Sekarang menggunakan bucket `pdf_surat` dengan folder structure

### Compatibility:
- ✅ Form input tidak berubah
- ✅ Preview HTML tidak berubah
- ✅ Template F-103.docx tidak berubah
- ✅ User experience tidak berubah

### Advantages:
- ✅ Konsisten dengan SKTM dan form lainnya
- ✅ Lebih maintainable
- ✅ Better error handling
- ✅ Proper cleanup
- ✅ Database normalization

## Files Modified

1. ✅ `src/app/api/process-pindah-keluar/route.ts` - Complete rebuild
2. ✅ `src/app/preview-pindah-keluar/page.tsx` - Simplified logic

## Files NOT Modified

- ✅ `src/app/form-surat/pindah-keluar/page.tsx` - Form tetap sama
- ✅ `src/app/api/preview-pindah-keluar-html/route.ts` - Preview tetap sama
- ✅ `public/template/F-103.docx` - Template tetap sama

## Next Steps

1. **Test thoroughly** dengan berbagai skenario
2. **Verify** Supabase bucket `pdf_surat` sudah dibuat
3. **Verify** table `document_archives` sudah ada dengan schema benar
4. **Check** ConvertAPI quota
5. **Monitor** logs untuk error
6. **Update** daftar-surat page jika perlu untuk query dari document_archives

## Support

Jika ada issue:
1. Check server logs untuk emoji error (❌)
2. Verify environment variables
3. Check ConvertAPI quota
4. Verify database connection
5. Check Supabase Storage permissions

---
**Rebuild Date**: 2025-01-20
**Pattern**: SKTM Logic
**Status**: ✅ Ready for Testing
