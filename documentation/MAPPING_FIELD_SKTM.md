# Mapping Field Form SKTM dengan Template

## ✅ Field yang Sudah Disesuaikan

Berikut adalah mapping antara placeholder di template SKTM.docx dengan field di form:

### Data Surat
| Placeholder Template | Field Form | Keterangan |
|---------------------|------------|------------|
| `{nomor_surat}` | `nomor_surat` | Nomor surat SKTM |
| `{tanggal_surat}` | Auto-generated | Tanggal saat ini (format Indonesia) |
| `{tahun_surat}` | Auto-generated | Tahun saat ini |
| `{bulan_romawi}` | Auto-generated | Bulan dalam angka Romawi (I-XII) |

### Data Pemohon
| Placeholder Template | Field Form | Keterangan |
|---------------------|------------|------------|
| `{nik_pemohon}` | `nik_pemohon` | NIK 16 digit |
| `{nama_pemohon}` | `nama_pemohon` | Nama lengkap pemohon |
| `{tempat_lahir}` | `tempat_lahir` | Tempat lahir |
| `{tanggal_lahir}` | `tanggal_lahir` | Tanggal lahir (auto-format Indonesia) |
| `{kelamin_pemohon}` | `kelamin_pemohon` | Laki-laki/Perempuan |
| `{agama}` | `agama` | Agama pemohon |
| `{pekerjaan}` | `pekerjaan` | Pekerjaan pemohon |
| `{perkawinan}` | `perkawinan` | Status perkawinan |
| `{negara}` | `negara` | Kewarganegaraan (default: Indonesia) |

### Alamat
| Placeholder Template | Field Form | Keterangan |
|---------------------|------------|------------|
| `{alamat}` | `alamat` | Alamat lengkap pemohon |
| `{rt}` | `rt` | RT |
| `{rw}` | `rw` | RW |
| `{kelurahan}` | `kelurahan` | Nama kelurahan (auto-fill dari user login) |
| `{alamat_kelurahan}` | `alamat_kelurahan` | Alamat kantor kelurahan (auto-fill) |
| `{kecamatan}` | `kecamatan` | Kecamatan (auto-fill dari user login) |
| `{kota_kabupaten}` | `kota_kabupaten` | Kabupaten/Kota (auto-fill) |

### Data Ekonomi
| Placeholder Template | Field Form | Keterangan |
|---------------------|------------|------------|
| `{desil}` | `desil` | Kategori desil (Desil 1-3) |

### Keperluan
| Placeholder Template | Field Form | Keterangan |
|---------------------|------------|------------|
| `{peruntukan}` | `peruntukan` | Keperluan/tujuan surat |
| `{pengantar_rt}` | `pengantar_rt` | Nomor surat pengantar RT |

### Data Pejabat
| Placeholder Template | Field Form | Keterangan |
|---------------------|------------|------------|
| `{nama_pejabat}` | `nama_pejabat` | Nama lurah/pejabat |
| `{nip_pejabat}` | `nip_pejabat` | NIP pejabat |
| `{jabatan}` | `jabatan` | Jabatan (default: Lurah Cibodas) |

## 📋 Perubahan dari Form Lama

### Field yang Dihapus
Field-field ini tidak ada di template, sehingga dihapus:
- `namaKepalaKeluarga`
- `jumlahAnggotaKeluarga`
- `jumlahTanggungan`
- `penghasilanPerBulan`
- `sumberPenghasilan`
- `kondisiRumah`
- `statusKepemilikanRumah`
- `provinsi`
- `keperluan` (diganti dengan `peruntukan`)
- `keteranganTambahan`

### Field yang Ditambahkan
Field baru yang sesuai template:
- `nomor_surat` - Nomor surat SKTM
- `pengantar_rt` - Nomor surat pengantar RT
- `negara` - Kewarganegaraan
- `desil` - Kategori ekonomi desil
- `nama_pejabat` - Nama pejabat penandatangan
- `nip_pejabat` - NIP pejabat
- `jabatan` - Jabatan pejabat

### Field yang Diganti Nama
| Nama Lama | Nama Baru | Alasan |
|-----------|-----------|--------|
| `nik` | `nik_pemohon` | Sesuai template |
| `namaLengkap` | `nama_pemohon` | Sesuai template |
| `tempatLahir` | `tempat_lahir` | Sesuai template (snake_case) |
| `tanggalLahir` | `tanggal_lahir` | Sesuai template (snake_case) |
| `jenisKelamin` | `kelamin_pemohon` | Sesuai template |
| `statusPerkawinan` | `perkawinan` | Sesuai template |
| `alamatLengkap` | `alamat` | Sesuai template |
| `kabupaten` | `kota_kabupaten` | Sesuai template |
| `keperluan` | `peruntukan` | Sesuai template |

## 🎯 Contoh Data

### Input Form:
```javascript
{
  nomor_surat: '470/001/SKTM/X/2025',
  nik_pemohon: '3201234567890123',
  nama_pemohon: 'Budi Santoso',
  tempat_lahir: 'Bandung',
  tanggal_lahir: '1985-05-15',
  kelamin_pemohon: 'Laki-laki',
  agama: 'Islam',
  pekerjaan: 'Buruh Harian Lepas',
  perkawinan: 'Kawin',
  negara: 'Indonesia',
  alamat: 'Jl. Merdeka No. 123',
  rt: '003',
  rw: '005',
  kelurahan: 'Cibodas',
  kecamatan: 'Tangerang',
  kota_kabupaten: 'Kota Tangerang',
  desil: 'Desil 1 (Sangat Miskin)',
  peruntukan: 'Berobat di Rumah Sakit',
  pengantar_rt: '001/RT.003/RW.005/X/2025',
  nama_pejabat: 'Drs. H. Ahmad Suryadi, M.Si',
  nip_pejabat: '196501011990031001',
  jabatan: 'Lurah Cibodas'
}
```

### Output di Template:
```
SURAT KETERANGAN TIDAK MAMPU
Nomor: 470/001/SKTM/X/2025

Yang bertanda tangan di bawah ini, Lurah Cibodas, menerangkan bahwa:

Nama            : Budi Santoso
NIK             : 3201234567890123
Tempat/Tgl Lahir: Bandung, 15 Mei 1985
Jenis Kelamin   : Laki-laki
Agama           : Islam
Pekerjaan       : Buruh Harian Lepas
Status          : Kawin
Kewarganegaraan : Indonesia
Alamat          : Jl. Merdeka No. 123
                  RT 003 RW 005
                  Kelurahan Cibodas
                  Kecamatan Tangerang
                  Kota Tangerang

Kategori Ekonomi: Desil 1 (Sangat Miskin)

Surat ini dibuat untuk keperluan: Berobat di Rumah Sakit

Berdasarkan Surat Pengantar RT Nomor: 001/RT.003/RW.005/X/2025

Cibodas, 8 Oktober 2025
Lurah Cibodas,

Drs. H. Ahmad Suryadi, M.Si
NIP. 196501011990031001
```

## 🔄 Auto-Generated Fields

Field yang otomatis di-generate oleh sistem:
- `tanggal_surat` - Tanggal saat ini (format: DD Bulan YYYY)
- `tahun_surat` - Tahun saat ini (format: YYYY)
- `bulan_romawi` - Bulan dalam angka Romawi (I-XII)

## ✅ Checklist Verifikasi

- [x] Semua placeholder di template ada di templateData
- [x] Form memiliki input untuk semua field yang diperlukan
- [x] Sample data sudah disesuaikan
- [x] API route sudah update
- [x] Format tanggal otomatis ke bahasa Indonesia
- [x] Bulan romawi auto-generated
- [x] Default values sudah di-set (kelurahan, negara, jabatan)

## 🧪 Testing

Untuk menguji:
1. Jalankan aplikasi: `npm run dev`
2. Buka form SKTM: `/form-surat/sktm`
3. Klik "Generate Data Contoh"
4. Submit form
5. Buka dokumen yang diunduh
6. Verifikasi semua placeholder terisi dengan benar

## 📝 Notes

- Template menggunakan format `{placeholder}` bukan `${placeholder}`
- Nama field menggunakan snake_case sesuai template
- Tanggal otomatis diformat ke bahasa Indonesia
- Bulan romawi untuk nomor surat otomatis di-generate
