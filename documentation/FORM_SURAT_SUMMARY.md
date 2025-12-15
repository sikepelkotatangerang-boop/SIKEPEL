# Form Surat - Summary

## Overview
Telah dibuat halaman form untuk jenis surat yang ada pada halaman Pelayanan Administrasi. Form-form ini memungkinkan warga untuk mengajukan permohonan surat keterangan secara online.

## Form yang Telah Dibuat

### 1. Form Surat Keterangan Domisili
**Path:** `/form-surat/domisili`  
**File:** `src/app/form-surat/domisili/page.tsx`

**Fitur:**
- Data Pemohon (NIK, Nama, Tempat/Tanggal Lahir, Jenis Kelamin, Agama, Pekerjaan, Status Perkawinan)
- Data Domisili (Alamat lengkap, RT/RW, Kelurahan, Kecamatan, Kabupaten, Provinsi, Kode Pos)
- Keperluan dan Keterangan Tambahan
- Upload Dokumen (KTP, KK, Surat Pengantar RT/RW, Pas Foto)

**Persyaratan:**
- Fotocopy KTP pemohon
- Fotocopy Kartu Keluarga (KK)
- Surat Pengantar RT/RW
- Pas foto 3x4 (2 lembar)
- Materai 10.000

**Waktu Proses:** 1-2 hari kerja

---

### 2. Form Surat Keterangan Usaha
**Path:** `/form-surat/usaha`  
**File:** `src/app/form-surat/usaha/page.tsx`

**Fitur:**
- Data Pemilik Usaha (NIK, Nama, Tempat/Tanggal Lahir, Jenis Kelamin, Agama, Status Perkawinan)
- Data Usaha (Nama Usaha, Jenis Usaha, Bidang Usaha, Modal Usaha, Jumlah Karyawan, Tahun Berdiri)
- Alamat Usaha (Alamat lengkap, RT/RW, Kelurahan, Kecamatan, Kabupaten, Provinsi)
- Keperluan dan Keterangan Tambahan
- Upload Dokumen (KTP, KK, Surat Pengantar RT/RW, Pas Foto, Foto Tempat Usaha)

**Persyaratan:**
- Fotocopy KTP pemilik usaha
- Fotocopy Kartu Keluarga (KK)
- Surat Pengantar RT/RW
- Pas foto 3x4 (2 lembar)
- Foto tempat usaha
- Materai 10.000

**Waktu Proses:** 2-3 hari kerja

---

### 3. Form Surat Keterangan Tidak Mampu (SKTM)
**Path:** `/form-surat/sktm`  
**File:** `src/app/form-surat/sktm/page.tsx`

**Fitur:**
- Data Pemohon (NIK, Nama, Tempat/Tanggal Lahir, Jenis Kelamin, Agama, Pekerjaan, Status Perkawinan)
- Data Keluarga (Nama Kepala Keluarga, Jumlah Anggota Keluarga, Jumlah Tanggungan)
- Data Ekonomi (Penghasilan Per Bulan, Sumber Penghasilan, Kondisi Rumah, Status Kepemilikan Rumah)
- Alamat Tempat Tinggal
- Keperluan dan Keterangan Tambahan
- Upload Dokumen (KTP, KK, Surat Pengantar RT/RW, Pas Foto, Surat Keterangan Penghasilan)

**Persyaratan:**
- Fotocopy KTP pemohon
- Fotocopy Kartu Keluarga (KK)
- Surat Pengantar RT/RW
- Surat keterangan penghasilan (jika ada)
- Pas foto 3x4 (2 lembar)
- Materai 10.000

**Waktu Proses:** 1-2 hari kerja

---

### 4. Form Surat Keterangan Belum Menikah
**Path:** `/form-surat/belum-menikah`  
**File:** `src/app/form-surat/belum-menikah/page.tsx`

**Fitur:**
- Data Pemohon (NIK, Nama, Tempat/Tanggal Lahir, Jenis Kelamin, Agama, Pekerjaan, Kewarganegaraan)
- Data Orang Tua (Nama Ayah, Nama Ibu, Pekerjaan Ayah, Pekerjaan Ibu)
- Alamat Tempat Tinggal
- Keperluan dan Keterangan Tambahan
- Upload Dokumen (KTP, KK, Akta Kelahiran, Surat Pengantar RT/RW, Pas Foto)

**Persyaratan:**
- Fotocopy KTP pemohon
- Fotocopy Kartu Keluarga (KK)
- Fotocopy Akta Kelahiran
- Surat Pengantar RT/RW
- Pas foto 4x6 (2 lembar)
- Materai 10.000

**Waktu Proses:** 1-2 hari kerja

---

### 5. Form Surat Keterangan Penghasilan
**Path:** `/form-surat/penghasilan`  
**File:** `src/app/form-surat/penghasilan/page.tsx`

**Fitur:**
- Data Pemohon (NIK, Nama, Tempat/Tanggal Lahir, Jenis Kelamin, Agama, Status Perkawinan)
- Data Pekerjaan (Pekerjaan, Nama Perusahaan, Jabatan, Masa Kerja, Status Kepegawaian)
- Data Penghasilan (Penghasilan Pokok, Tunjangan Tetap, Tunjangan Tidak Tetap, Penghasilan Lainnya)
- **Auto-calculate Total Penghasilan**
- Alamat Tempat Tinggal
- Keperluan dan Keterangan Tambahan
- Upload Dokumen (KTP, KK, Surat Pengantar RT/RW, Pas Foto, Slip Gaji)

**Persyaratan:**
- Fotocopy KTP pemohon
- Fotocopy Kartu Keluarga (KK)
- Surat Pengantar RT/RW
- Slip gaji (jika ada)
- Pas foto 3x4 (2 lembar)
- Materai 10.000

**Waktu Proses:** 1-2 hari kerja

---

## Fitur Umum Semua Form

### 1. **Validasi Form**
- Semua field yang wajib diisi ditandai dengan asterisk merah (*)
- Validasi HTML5 untuk memastikan data terisi dengan benar
- Validasi file upload (format dan ukuran)

### 2. **Upload Dokumen**
- Support format: JPG, PNG, PDF
- Maksimal ukuran file: 2MB per file
- Preview nama file yang telah diupload
- Indikator sukses upload (✓)

### 3. **User Experience**
- Header dengan icon dan judul yang jelas
- Info box persyaratan dengan warna yang sesuai tema
- Form terorganisir dalam card sections
- Tombol navigasi (Kembali, Batal, Submit)
- Loading state saat submit
- Responsive design untuk mobile dan desktop

### 4. **Design System**
- Konsisten dengan design system aplikasi
- Menggunakan komponen UI yang sudah ada (Card, Button, Input)
- Color coding sesuai jenis surat:
  - Domisili: Blue (bg-blue-500)
  - Usaha: Green (bg-green-500)
  - SKTM: Yellow (bg-yellow-500)
  - Belum Menikah: Pink (bg-pink-500)
  - Penghasilan: Purple (bg-purple-500)

### 5. **Navigation**
- Tombol "Kembali" untuk navigasi ke halaman sebelumnya
- Redirect ke `/surat-keterangan` setelah submit berhasil
- Breadcrumb navigation melalui header

---

## Integrasi dengan Halaman Pelayanan Administrasi

Form-form ini sudah terintegrasi dengan halaman Pelayanan Administrasi (`src/app/surat-keterangan/page.tsx`) melalui properti `formUrl` pada setiap jenis pelayanan:

```typescript
{
  id: 1,
  nama: 'Surat Keterangan Domisili',
  formUrl: '/form-surat/domisili'
},
{
  id: 2,
  nama: 'Surat Keterangan Usaha',
  formUrl: '/form-surat/usaha'
},
// dst...
```

Ketika user klik tombol "Ajukan" pada card jenis pelayanan, akan diarahkan ke form yang sesuai.

---

## Next Steps (Opsional)

### 1. **Backend Integration**
- Implementasi API endpoint untuk submit form
- Integrasi dengan Supabase untuk menyimpan data
- Upload file ke storage (Supabase Storage)

### 2. **Form Enhancement**
- Auto-fill data dari profile user yang login
- Save draft functionality
- Multi-step form wizard
- Real-time validation

### 3. **Additional Forms**
Jika diperlukan, dapat dibuat form tambahan untuk jenis surat lainnya:
- Surat Keterangan Ahli Waris
- Surat Keterangan Pindah
- Surat Keterangan Kehilangan
- Surat Keterangan Kepemilikan Kendaraan
- Surat Keterangan Siswa/Mahasiswa

### 4. **Notification System**
- Email notification setelah submit
- Status tracking untuk permohonan
- Push notification untuk update status

---

## Testing Checklist

- [ ] Test semua form dapat diakses
- [ ] Test validasi form bekerja dengan baik
- [ ] Test upload file dengan berbagai format
- [ ] Test responsive design di mobile
- [ ] Test navigation antar halaman
- [ ] Test submit form (simulasi)
- [ ] Test error handling
- [ ] Test accessibility (keyboard navigation, screen reader)

---

## File Structure

```
src/app/form-surat/
├── domisili/
│   └── page.tsx
├── usaha/
│   └── page.tsx
├── sktm/
│   └── page.tsx
├── belum-menikah/
│   └── page.tsx
└── penghasilan/
    └── page.tsx
```

---

## Notes

- Semua form menggunakan client-side rendering (`'use client'`)
- Form submission saat ini masih simulasi (setTimeout 2 detik)
- Perlu implementasi backend untuk menyimpan data ke database
- File upload belum terintegrasi dengan storage service
- Auto-calculate total penghasilan sudah diimplementasikan di form penghasilan
