# F-103.docx Template - Placeholder Mapping

## Overview
Template F-103.docx adalah formulir resmi untuk Surat Pindah Keluar. Template ini memiliki 31 placeholder yang harus diisi dengan data dari form.

## Daftar Lengkap Placeholder (31 total)

### 1. Data Pemohon (7 fields)
| No | Placeholder | Form Field | Deskripsi |
|----|-------------|------------|-----------|
| 1 | `{nama_pemohon}` | `formData.nama_pemohon` | Nama lengkap pemohon |
| 2 | `{nik_pemohon}` | `formData.nik_pemohon` | NIK pemohon |
| 3 | `{no_kk_pemohon}` | `formData.no_kk_pemohon` | Nomor Kartu Keluarga |
| 4 | `{no_hp_pemohon}` | `formData.no_hp_pemohon` | Nomor HP pemohon |
| 5 | `{email_pemohon}` | `formData.email_pemohon` | Email pemohon |
| 6 | `{tanggal_surat}` | `formData.tanggal_surat` | Tanggal surat dibuat |

### 2. Alamat Asal (9 fields)
| No | Placeholder | Form Field | Deskripsi |
|----|-------------|------------|-----------|
| 7 | `{alamat_asal}` | `formData.alamat_asal` | Alamat lengkap asal |
| 8 | `{rt_asal}` | `formData.rt_asal` | RT asal |
| 9 | `{rw_asal}` | `formData.rw_asal` | RW asal |
| 10 | `{kel_asal}` | `formData.kel_asal` | Kelurahan asal |
| 11 | `{kec_asal}` | `formData.kec_asal` | Kecamatan asal |
| 12 | `{kota_asal}` | `formData.kota_asal` | Kota/Kabupaten asal |
| 13 | `{provinsi_asal}` | `formData.provinsi_asal` | Provinsi asal |
| 14 | `{pos_asal}` | `formData.pos_asal` | Kode pos asal |

### 3. Alamat Tujuan Pindah (9 fields)
| No | Placeholder | Form Field | Deskripsi |
|----|-------------|------------|-----------|
| 15 | `{alamat_pindah}` | `formData.alamat_pindah` | Alamat lengkap tujuan |
| 16 | `{rt_pindah}` | `formData.rt_pindah` | RT tujuan |
| 17 | `{rw_pindah}` | `formData.rw_pindah` | RW tujuan |
| 18 | `{kel_pindah}` | `formData.kel_pindah` | Kelurahan tujuan |
| 19 | `{kec_pindah}` | `formData.kec_pindah` | Kecamatan tujuan |
| 20 | `{kota/kab_pindah}` | `formData.kota_kab_pindah` | Kota/Kabupaten tujuan |
| 21 | `{provinsi_pindah}` | `formData.provinsi_pindah` | Provinsi tujuan |
| 22 | `{pos_pindah}` | `formData.pos_pindah` | Kode pos tujuan |
| 23 | `{no_klasifikasi_pindah}` | `formData.no_klasifikasi_pindah` | Klasifikasi pindah |

### 4. Jenis Kepindahan (4 fields)
| No | Placeholder | Form Field | Deskripsi |
|----|-------------|------------|-----------|
| 24 | `{no_alasan_pindah}` | `formData.no_alasan_pindah` | Nomor alasan pindah |
| 25 | `{no_jenis_pindah}` | `formData.no_jenis_pindah` | Nomor jenis pindah |
| 26 | `{no_anggota_pindah}` | `formData.no_anggota_pindah` | Nomor status anggota yang pindah |
| 27 | `{no_keluarga_pindah}` | `formData.no_keluarga_pindah` | Nomor status keluarga yang pindah |

### 5. Anggota Keluarga Yang Pindah (4 fields)
⚠️ **PENTING**: Template F-103 hanya menampilkan 1 anggota keluarga pertama!

| No | Placeholder | Source | Deskripsi |
|----|-------------|--------|-----------|
| 28 | `{no_urut_anggota_pindah}` | `anggota_keluarga[0].no_urut` | Nomor urut anggota |
| 29 | `{nik_anggota_pindah}` | `anggota_keluarga[0].nik` | NIK anggota keluarga |
| 30 | `{nama_anggota_pindah}` | `anggota_keluarga[0].nama` | Nama anggota keluarga |
| 31 | `{shdk_anggota_pindah}` | `anggota_keluarga[0].shdk` | Status Hubungan Dalam Keluarga |

## Implementasi di Code

### API Route (`/api/process-pindah-keluar/route.ts`)

```typescript
// Get first family member for template (F-103 only has 1 row)
const anggotaKeluarga = formData.anggota_keluarga || [];
const firstAnggota = anggotaKeluarga[0] || {
  no_urut: '1',
  nik: '',
  nama: '',
  shdk: '',
};

// Prepare template data
const templateData = {
  tanggal_surat: formData.tanggal_surat || '',
  no_kk_pemohon: formData.no_kk_pemohon || '',
  nama_pemohon: formData.nama_pemohon || '',
  nik_pemohon: formData.nik_pemohon || '',
  no_hp_pemohon: formData.no_hp_pemohon || '',
  email_pemohon: formData.email_pemohon || '',
  
  // Alamat asal
  alamat_asal: formData.alamat_asal || '',
  rt_asal: formData.rt_asal || '',
  rw_asal: formData.rw_asal || '',
  kel_asal: formData.kel_asal || '',
  kec_asal: formData.kec_asal || '',
  kota_asal: formData.kota_asal || '',
  provinsi_asal: formData.provinsi_asal || '',
  pos_asal: formData.pos_asal || '',
  
  // Alamat pindah
  no_klasifikasi_pindah: formData.no_klasifikasi_pindah || '',
  alamat_pindah: formData.alamat_pindah || '',
  rt_pindah: formData.rt_pindah || '',
  rw_pindah: formData.rw_pindah || '',
  kel_pindah: formData.kel_pindah || '',
  kec_pindah: formData.kec_pindah || '',
  'kota/kab_pindah': formData.kota_kab_pindah || '',
  provinsi_pindah: formData.provinsi_pindah || '',
  pos_pindah: formData.pos_pindah || '',
  
  // Jenis pindah
  no_alasan_pindah: formData.no_alasan_pindah || '',
  no_jenis_pindah: formData.no_jenis_pindah || '',
  no_anggota_pindah: formData.no_anggota_pindah || '',
  no_keluarga_pindah: formData.no_keluarga_pindah || '',
  
  // Anggota keluarga yang pindah (first member only)
  no_urut_anggota_pindah: firstAnggota.no_urut || '1',
  nik_anggota_pindah: firstAnggota.nik || '',
  nama_anggota_pindah: firstAnggota.nama || '',
  shdk_anggota_pindah: firstAnggota.shdk || '',
};
```

## Catatan Penting

### 1. Naming Convention
⚠️ **Placeholder untuk anggota keluarga menggunakan `_anggota_pindah` bukan `_pindah`**

**SALAH:**
```typescript
nama_pindah: firstAnggota.nama,
nik_pindah: firstAnggota.nik,
```

**BENAR:**
```typescript
nama_anggota_pindah: firstAnggota.nama,
nik_anggota_pindah: firstAnggota.nik,
```

### 2. Keterbatasan Template F-103
- Template hanya menampilkan **1 anggota keluarga** pertama
- Jika ada lebih dari 1 anggota, hanya yang pertama yang muncul di PDF
- Data lengkap semua anggota tetap disimpan di database (field `data_detail` sebagai JSONB)

### 3. Special Characters
- Placeholder `{kota/kab_pindah}` menggunakan slash `/` di dalam kurung kurawal
- Di JavaScript object, harus ditulis sebagai string: `'kota/kab_pindah'`

### 4. Default Values
Semua field menggunakan empty string `''` sebagai default jika data tidak ada:
```typescript
field_name: formData.field_name || '',
```

## Form Data Structure

```typescript
interface FormData {
  // Data pemohon
  tanggal_surat: string;
  no_kk_pemohon: string;
  nama_pemohon: string;
  nik_pemohon: string;
  no_hp_pemohon: string;
  email_pemohon: string;
  jenis_permohonan: string;
  
  // Alamat asal
  alamat_asal: string;
  rt_asal: string;
  rw_asal: string;
  kel_asal: string;
  kec_asal: string;
  kota_asal: string;
  provinsi_asal: string;
  pos_asal: string;
  
  // Alamat pindah
  no_klasifikasi_pindah: string;
  alamat_pindah: string;
  rt_pindah: string;
  rw_pindah: string;
  kel_pindah: string;
  kec_pindah: string;
  kota_kab_pindah: string;
  provinsi_pindah: string;
  pos_pindah: string;
  
  // Jenis pindah
  no_alasan_pindah: string;
  no_jenis_pindah: string;
  no_anggota_pindah: string;
  no_keluarga_pindah: string;
  
  // Anggota keluarga (array)
  anggota_keluarga: Array<{
    no_urut: string;
    nik: string;
    nama: string;
    shdk: string;
  }>;
}
```

## Testing Checklist

Pastikan semua placeholder terisi dengan benar:

- [ ] Data pemohon (6 fields)
- [ ] Alamat asal (8 fields)
- [ ] Alamat pindah (9 fields)
- [ ] Jenis kepindahan (4 fields)
- [ ] Anggota keluarga pertama (4 fields)
- [ ] Total: 31 fields terisi semua

## Troubleshooting

### Placeholder tidak terisi di PDF
1. **Check spelling**: Pastikan nama placeholder di code sama persis dengan template
2. **Check data**: Pastikan formData memiliki field yang sesuai
3. **Check array**: Untuk anggota keluarga, pastikan array tidak kosong

### Anggota keluarga tidak muncul
1. Pastikan `formData.anggota_keluarga` adalah array
2. Pastikan array memiliki minimal 1 element
3. Pastikan menggunakan `_anggota_pindah` bukan `_pindah`

### Error saat render
1. Check console log untuk error dari Docxtemplater
2. Pastikan template F-103.docx tidak corrupt
3. Pastikan semua placeholder di template valid (tidak ada typo)

## References

- Template: `public/template/F-103.docx`
- API Route: `src/app/api/process-pindah-keluar/route.ts`
- Form: `src/app/form-surat/pindah-keluar/page.tsx`
- Preview: `src/app/preview-pindah-keluar/page.tsx`

---
**Last Updated**: 2025-01-20
**Template Version**: F-103.docx
**Total Placeholders**: 31
