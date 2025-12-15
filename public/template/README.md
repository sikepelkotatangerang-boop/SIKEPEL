# Template SKTM - Panduan Penggunaan

## ⚠️ PENTING: Format Placeholder

**HARUS menggunakan format `{namaPlaceholder}` - BUKAN `${namaPlaceholder}`**

Jika Anda melihat `$undefined` di dokumen hasil, berarti:
- Format placeholder salah (pakai `$` di depan)
- Nama placeholder tidak sesuai daftar
- Ada formatting Word yang merusak placeholder

Lihat file `TROUBLESHOOTING.md` untuk solusi lengkap.

## Daftar Placeholder yang Tersedia

Template SKTM.docx harus menggunakan placeholder berikut dengan format `{namaPlaceholder}`:

### Data Pemohon
- `{nik}` - Nomor Induk Kependudukan (16 digit)
- `{namaLengkap}` - Nama lengkap pemohon
- `{tempatLahir}` - Tempat lahir pemohon
- `{tanggalLahir}` - Tanggal lahir (format: DD Bulan YYYY, contoh: 15 Januari 1990)
- `{jenisKelamin}` - Jenis kelamin (Laki-laki/Perempuan)
- `{agama}` - Agama pemohon
- `{pekerjaan}` - Pekerjaan pemohon
- `{statusPerkawinan}` - Status perkawinan (Belum Kawin/Kawin/Cerai Hidup/Cerai Mati)

### Data Keluarga
- `{namaKepalaKeluarga}` - Nama kepala keluarga
- `{jumlahAnggotaKeluarga}` - Jumlah anggota keluarga
- `{jumlahTanggungan}` - Jumlah tanggungan

### Data Ekonomi
- `{penghasilanPerBulan}` - Penghasilan per bulan (contoh: Rp 1.000.000)
- `{sumberPenghasilan}` - Sumber penghasilan (contoh: Buruh harian, Pedagang)
- `{kondisiRumah}` - Kondisi rumah (Permanen/Semi Permanen/Non Permanen)
- `{statusKepemilikanRumah}` - Status kepemilikan rumah (Milik Sendiri/Sewa/Kontrak/Menumpang/Lainnya)

### Alamat
- `{alamatLengkap}` - Alamat lengkap
- `{rt}` - RT
- `{rw}` - RW
- `{kelurahan}` - Kelurahan (default: Cibodas)
- `{kecamatan}` - Kecamatan
- `{kabupaten}` - Kabupaten/Kota
- `{provinsi}` - Provinsi

### Keperluan
- `{keperluan}` - Keperluan surat (contoh: Berobat, Pendidikan)
- `{keteranganTambahan}` - Keterangan tambahan (opsional)

### Data Surat
- `{tanggalSurat}` - Tanggal pembuatan surat (otomatis, format: DD Bulan YYYY)

## Cara Menggunakan Template

1. Buka file `SKTM.docx` dengan Microsoft Word atau aplikasi pengolah kata lainnya
2. Tambahkan placeholder dengan format `{namaPlaceholder}` di posisi yang diinginkan
3. Contoh penggunaan dalam dokumen:
   ```
   Yang bertanda tangan di bawah ini, Lurah Cibodas, menerangkan bahwa:
   
   Nama            : {namaLengkap}
   NIK             : {nik}
   Tempat/Tgl Lahir: {tempatLahir}, {tanggalLahir}
   Jenis Kelamin   : {jenisKelamin}
   Agama           : {agama}
   Pekerjaan       : {pekerjaan}
   Status          : {statusPerkawinan}
   Alamat          : {alamatLengkap} RT {rt} RW {rw}
                     Kelurahan {kelurahan}, Kecamatan {kecamatan}
                     {kabupaten}, {provinsi}
   
   Adalah benar warga kami yang termasuk dalam kategori tidak mampu dengan kondisi:
   - Penghasilan per bulan: {penghasilanPerBulan}
   - Sumber penghasilan: {sumberPenghasilan}
   - Jumlah tanggungan: {jumlahTanggungan} orang
   - Kondisi rumah: {kondisiRumah}
   - Status kepemilikan: {statusKepemilikanRumah}
   
   Surat keterangan ini dibuat untuk keperluan: {keperluan}
   
   Demikian surat keterangan ini dibuat dengan sebenarnya.
   
   Cibodas, {tanggalSurat}
   Lurah Cibodas
   ```

4. Simpan file template
5. Sistem akan otomatis mengisi placeholder dengan data dari formulir

## Catatan Penting

- Pastikan menggunakan kurung kurawal `{}` untuk placeholder
- Nama placeholder harus sesuai dengan daftar di atas
- Placeholder bersifat case-sensitive
- Jika data tidak diisi di formulir, placeholder akan diganti dengan string kosong
- Format tanggal akan otomatis dikonversi ke format Indonesia (DD Bulan YYYY)
