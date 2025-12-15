# Troubleshooting: Masalah $undefined di Dokumen SKTM

## Penyebab Masalah $undefined

Masalah `$undefined` muncul di dokumen Word yang dihasilkan karena:

1. **Format placeholder salah** - Harus menggunakan `{namaPlaceholder}` bukan `${namaPlaceholder}`
2. **Nama placeholder tidak sesuai** - Nama harus exact match dengan yang ada di kode
3. **Karakter khusus di template** - Word kadang menambahkan formatting yang merusak placeholder

## ✅ Solusi yang Sudah Diterapkan

API sudah diperbaiki dengan:
- `nullGetter` untuk menangani nilai undefined/null
- Error logging yang detail
- `setData()` sebelum `render()`

## 🔧 Cara Memperbaiki Template DOCX

### Langkah 1: Periksa Format Placeholder

**BENAR:**
```
Nama: {namaLengkap}
NIK: {nik}
Alamat: {alamatLengkap}
```

**SALAH:**
```
Nama: ${namaLengkap}    ❌ Jangan pakai $
NIK: {{nik}}            ❌ Jangan double kurung
Alamat: {alamat}        ❌ Nama tidak sesuai (harus alamatLengkap)
```

### Langkah 2: Bersihkan Formatting

Kadang Word memecah placeholder karena formatting. Cara membersihkan:

1. Buka SKTM.docx
2. Select placeholder (contoh: `{namaLengkap}`)
3. Klik kanan → Font → Hapus semua formatting
4. Atau ketik ulang placeholder tanpa copy-paste

### Langkah 3: Gunakan Plain Text

Untuk memastikan placeholder tidak rusak:

1. Ketik placeholder di Notepad dulu
2. Copy dari Notepad
3. Paste ke Word dengan "Keep Text Only" (Ctrl+Shift+V)

### Langkah 4: Verifikasi Nama Placeholder

Pastikan nama placeholder sesuai dengan daftar ini:

**Data Pemohon:**
- `{nik}`
- `{namaLengkap}`
- `{tempatLahir}`
- `{tanggalLahir}`
- `{jenisKelamin}`
- `{agama}`
- `{pekerjaan}`
- `{statusPerkawinan}`

**Data Keluarga:**
- `{namaKepalaKeluarga}`
- `{jumlahAnggotaKeluarga}`
- `{jumlahTanggungan}`

**Data Ekonomi:**
- `{penghasilanPerBulan}`
- `{sumberPenghasilan}`
- `{kondisiRumah}`
- `{statusKepemilikanRumah}`

**Alamat:**
- `{alamatLengkap}`
- `{rt}`
- `{rw}`
- `{kelurahan}`
- `{kecamatan}`
- `{kabupaten}`
- `{provinsi}`

**Keperluan:**
- `{keperluan}`
- `{keteranganTambahan}`

**Data Surat:**
- `{tanggalSurat}`

## 🧪 Testing

Setelah memperbaiki template:

1. Jalankan aplikasi: `npm run dev`
2. Buka form SKTM
3. Klik "Generate Data Contoh"
4. Submit form
5. Buka dokumen yang diunduh
6. Periksa apakah semua placeholder terisi

## 🐛 Debug

Jika masih ada masalah:

1. Buka browser console (F12)
2. Lihat tab "Console" untuk error
3. Atau lihat terminal server untuk log:
   ```
   Template Data: {
     "nik": "3201234567890123",
     "namaLengkap": "Budi Santoso",
     ...
   }
   ```

## 📝 Contoh Template yang Benar

```
PEMERINTAH KOTA TANGERANG
KECAMATAN [NAMA KECAMATAN]
KELURAHAN CIBODAS

SURAT KETERANGAN TIDAK MAMPU
Nomor: _______________

Yang bertanda tangan di bawah ini, Lurah Cibodas, Kecamatan {kecamatan}, 
Kota/Kabupaten {kabupaten}, menerangkan dengan sebenarnya bahwa:

    Nama                : {namaLengkap}
    NIK                 : {nik}
    Tempat/Tgl Lahir    : {tempatLahir}, {tanggalLahir}
    Jenis Kelamin       : {jenisKelamin}
    Agama               : {agama}
    Pekerjaan           : {pekerjaan}
    Status Perkawinan   : {statusPerkawinan}
    Alamat              : {alamatLengkap}
                          RT {rt} RW {rw}
                          Kelurahan {kelurahan}
                          Kecamatan {kecamatan}
                          {kabupaten}, {provinsi}

Adalah benar warga kami yang termasuk dalam kategori tidak mampu dengan 
kondisi ekonomi sebagai berikut:

    Kepala Keluarga     : {namaKepalaKeluarga}
    Jumlah Anggota KK   : {jumlahAnggotaKeluarga} orang
    Jumlah Tanggungan   : {jumlahTanggungan} orang
    Penghasilan/Bulan   : {penghasilanPerBulan}
    Sumber Penghasilan  : {sumberPenghasilan}
    Kondisi Rumah       : {kondisiRumah}
    Status Kepemilikan  : {statusKepemilikanRumah}

Surat keterangan ini dibuat untuk keperluan: {keperluan}

{keteranganTambahan}

Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat 
dipergunakan sebagaimana mestinya.

                                        Cibodas, {tanggalSurat}
                                        Lurah Cibodas,



                                        _____________________
                                        NIP.
```

## ⚠️ Catatan Penting

1. **Jangan gunakan $ di depan placeholder**
2. **Case sensitive** - `{namaLengkap}` ≠ `{NamaLengkap}`
3. **Spasi tidak boleh** - `{ nik }` ❌ harus `{nik}` ✅
4. **Satu kurung kurawal** - `{nik}` ✅ bukan `{{nik}}` ❌

## 📞 Masih Bermasalah?

Jika masih ada `$undefined`:

1. Hapus file SKTM.docx
2. Buat file Word baru
3. Copy contoh template di atas
4. Simpan sebagai SKTM.docx di folder `public/template/`
5. Test lagi
