# Integrasi Template SKTM - Ringkasan Implementasi

## ✅ Yang Telah Dilakukan

### 1. Instalasi Package
- **docxtemplater**: Library untuk memproses template DOCX
- **pizzip**: Library untuk membaca/menulis file ZIP (DOCX adalah file ZIP)

```bash
npm install docxtemplater pizzip
```

### 2. API Route untuk Generate Dokumen
**File**: `src/app/api/generate-sktm/route.ts`

API endpoint ini:
- Menerima data formulir SKTM melalui POST request
- Membaca template dari `public/template/SKTM.docx`
- Mengisi placeholder di template dengan data formulir
- Mengembalikan file DOCX yang sudah terisi untuk diunduh

**Fitur Khusus**:
- Format tanggal otomatis ke bahasa Indonesia (contoh: 15 Januari 2024)
- Nama file otomatis dengan format: `SKTM_NamaPemohon_Timestamp.docx`

### 3. Update Form SKTM
**File**: `src/app/form-surat/sktm/page.tsx`

Perubahan pada fungsi `handleSubmit`:
- Mengirim data ke API `/api/generate-sktm`
- Otomatis mengunduh dokumen yang dihasilkan
- Menampilkan pesan sukses/error yang sesuai

### 4. Dokumentasi Template
**File**: `public/template/README.md`

Berisi:
- Daftar lengkap placeholder yang tersedia
- Cara menggunakan template
- Contoh penggunaan dalam dokumen
- Catatan penting

## 📋 Placeholder yang Tersedia

Template SKTM.docx harus menggunakan format `{namaPlaceholder}`:

### Data Pemohon
- `{nik}`, `{namaLengkap}`, `{tempatLahir}`, `{tanggalLahir}`
- `{jenisKelamin}`, `{agama}`, `{pekerjaan}`, `{statusPerkawinan}`

### Data Keluarga
- `{namaKepalaKeluarga}`, `{jumlahAnggotaKeluarga}`, `{jumlahTanggungan}`

### Data Ekonomi
- `{penghasilanPerBulan}`, `{sumberPenghasilan}`
- `{kondisiRumah}`, `{statusKepemilikanRumah}`

### Alamat
- `{alamatLengkap}`, `{rt}`, `{rw}`, `{kelurahan}`
- `{kecamatan}`, `{kabupaten}`, `{provinsi}`

### Keperluan
- `{keperluan}`, `{keteranganTambahan}`

### Data Surat
- `{tanggalSurat}` - Otomatis terisi dengan tanggal saat ini

## 🔧 Cara Menggunakan

### 1. Persiapan Template
1. Buka file `public/template/SKTM.docx`
2. Edit template sesuai kebutuhan
3. Gunakan placeholder dengan format `{namaPlaceholder}`
4. Simpan file

**Contoh Template**:
```
SURAT KETERANGAN TIDAK MAMPU

Yang bertanda tangan di bawah ini, Lurah Cibodas, menerangkan bahwa:

Nama            : {namaLengkap}
NIK             : {nik}
Tempat/Tgl Lahir: {tempatLahir}, {tanggalLahir}
Jenis Kelamin   : {jenisKelamin}
Agama           : {agama}
Pekerjaan       : {pekerjaan}
Alamat          : {alamatLengkap} RT {rt} RW {rw}

Adalah benar warga kami yang termasuk dalam kategori tidak mampu.

Surat ini dibuat untuk keperluan: {keperluan}

Cibodas, {tanggalSurat}
Lurah Cibodas
```

### 2. Penggunaan di Aplikasi
1. Buka halaman Form SKTM: `/form-surat/sktm`
2. Isi semua data yang diperlukan
3. Klik tombol "Ajukan Permohonan"
4. Dokumen SKTM akan otomatis terunduh

## 🎯 Alur Kerja

```
User mengisi form → Submit → API generate-sktm → 
Baca template SKTM.docx → Isi placeholder dengan data → 
Generate dokumen baru → Download otomatis
```

## ⚠️ Catatan Penting

1. **Template DOCX harus ada** di `public/template/SKTM.docx`
2. **Placeholder case-sensitive**: `{namaLengkap}` ≠ `{NamaLengkap}`
3. **Format kurung kurawal**: Harus menggunakan `{}` bukan `[]` atau `()`
4. **Data kosong**: Jika field tidak diisi, placeholder akan diganti dengan string kosong
5. **Format tanggal**: Otomatis dikonversi ke format Indonesia

## 🔍 Testing

Untuk menguji implementasi:
1. Jalankan development server: `npm run dev`
2. Buka browser ke `http://localhost:3000`
3. Navigate ke "Pelayanan Administrasi" → "SKTM"
4. Isi formulir dengan data test
5. Submit dan periksa dokumen yang diunduh

## 🐛 Troubleshooting

### Error: "Failed to generate document"
- Pastikan file `SKTM.docx` ada di folder `public/template/`
- Periksa format placeholder di template
- Lihat console browser untuk detail error

### Dokumen tidak terunduh
- Periksa browser settings untuk download otomatis
- Cek console untuk error JavaScript

### Placeholder tidak terisi
- Pastikan nama placeholder sesuai dengan daftar di atas
- Periksa ejaan dan case sensitivity
- Pastikan menggunakan kurung kurawal `{}`

## 📝 Pengembangan Selanjutnya

Jika ingin menambahkan field baru:
1. Tambahkan field di form (`src/app/form-surat/sktm/page.tsx`)
2. Tambahkan ke `templateData` di API route (`src/app/api/generate-sktm/route.ts`)
3. Tambahkan placeholder di template DOCX
4. Update dokumentasi di `public/template/README.md`

## 📞 Support

Jika ada pertanyaan atau masalah, silakan hubungi tim development.
