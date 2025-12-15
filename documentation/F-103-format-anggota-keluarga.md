# F-103 Template - Format Anggota Keluarga (Multiple Members)

## 📋 Format Saat Ini (AKTIF)

Semua anggota keluarga ditampilkan dalam 4 field terpisah, masing-masing dipisahkan dengan **line break** (`\n`).

### Format Output di PDF:

```
┌─────────────────────────────────────────────────────────┐
│ No Urut │ Nama              │ NIK               │ SHDK  │
├─────────────────────────────────────────────────────────┤
│ 1       │ John Doe          │ 1234567890123456  │ KK    │
│ 2       │ Jane Doe          │ 9876543210987654  │ Istri │
│ 3       │ Baby Doe          │ 1111222233334444  │ Anak  │
└─────────────────────────────────────────────────────────┘
```

### Placeholder Mapping:

| Placeholder | Value | Format |
|-------------|-------|--------|
| `{no_urut_anggota_pindah}` | `1\n2\n3` | Line break separated |
| `{nama_anggota_pindah}` | `John Doe\nJane Doe\nBaby Doe` | Line break separated |
| `{nik_anggota_pindah}` | `1234567890123456\n9876543210987654\n1111222233334444` | Line break separated (NO COMMA) |
| `{shdk_anggota_pindah}` | `KEP-KELG\nISTRI\nANAK` | Line break separated (ABBREVIATED) |

### SHDK Abbreviations:

| Full Name | Abbreviation |
|-----------|--------------|
| Kepala Keluarga | **KEP-KELG** |
| Suami | SUAMI |
| Istri | ISTRI |
| Anak | ANAK |
| Menantu | MENANTU |
| Cucu | CUCU |
| Orang Tua | ORTU |
| Mertua | MERTUA |
| Famili Lain | FAMILI LAIN |
| Pembantu | PEMBANTU |
| *Others* | UPPERCASE |

## 💻 Implementasi Code

### File: `src/app/api/process-pindah-keluar/route.ts`

```typescript
// Get family members
const anggotaKeluarga = formData.anggota_keluarga || [];

// Helper function untuk singkatan SHDK
const getShdkSingkatan = (shdk: string): string => {
  const shdkMap: { [key: string]: string } = {
    'Kepala Keluarga': 'KEP-KELG',
    'Suami': 'SUAMI',
    'Istri': 'ISTRI',
    'Anak': 'ANAK',
    'Menantu': 'MENANTU',
    'Cucu': 'CUCU',
    'Orang Tua': 'ORTU',
    'Mertua': 'MERTUA',
    'Famili Lain': 'FAMILI LAIN',
    'Pembantu': 'PEMBANTU',
  };
  return shdkMap[shdk] || shdk.toUpperCase();
};

// Format untuk menampilkan semua anggota dalam field terpisah
const allNoUrutAnggota = anggotaKeluarga
  .map((a: any, i: number) => `${i + 1}`)
  .join('\n');

const allNamaAnggota = anggotaKeluarga
  .map((a: any) => a.nama)
  .join('\n');

const allNikAnggota = anggotaKeluarga
  .map((a: any) => a.nik)
  .join('\n'); // Tanpa koma, pakai line break

const allShdkAnggota = anggotaKeluarga
  .map((a: any) => getShdkSingkatan(a.shdk))
  .join('\n'); // Dengan singkatan

// Template data
const templateData = {
  // ... fields lain
  
  // OPSI 2: Tampilkan semua anggota (AKTIF)
  no_urut_anggota_pindah: allNoUrutAnggota || firstAnggota.no_urut || '1',
  nama_anggota_pindah: allNamaAnggota || firstAnggota.nama || '',
  nik_anggota_pindah: allNikAnggota || firstAnggota.nik || '',
  shdk_anggota_pindah: allShdkAnggota || firstAnggota.shdk || '',
};
```

## 📊 Contoh Data

### Input (Form Data):

```json
{
  "anggota_keluarga": [
    {
      "no_urut": "1",
      "nik": "1234567890123456",
      "nama": "John Doe",
      "shdk": "Kepala Keluarga"
    },
    {
      "no_urut": "2",
      "nik": "9876543210987654",
      "nama": "Jane Doe",
      "shdk": "Istri"
    },
    {
      "no_urut": "3",
      "nik": "1111222233334444",
      "nama": "Baby Doe",
      "shdk": "Anak"
    }
  ]
}
```

### Output (Template Data):

```typescript
{
  no_urut_anggota_pindah: "1\n2\n3",
  nama_anggota_pindah: "John Doe\nJane Doe\nBaby Doe",
  nik_anggota_pindah: "1234567890123456\n9876543210987654\n1111222233334444",
  shdk_anggota_pindah: "Kepala Keluarga\nIstri\nAnak"
}
```

### Tampilan di PDF:

**Field: No Urut**
```
1
2
3
```

**Field: Nama**
```
John Doe
Jane Doe
Baby Doe
```

**Field: NIK**
```
1234567890123456
9876543210987654
1111222233334444
```

**Field: SHDK**
```
KEP-KELG
ISTRI
ANAK
```

## ⚙️ Konfigurasi

### Aktif (Current):
- ✅ Semua anggota ditampilkan
- ✅ Setiap field dipisahkan dengan line break
- ✅ Tidak ada koma di NIK
- ✅ SHDK ditampilkan terpisah

### Untuk Kembali ke Opsi 1 (Hanya Anggota Pertama):

Comment OPSI 2 dan uncomment OPSI 1:

```typescript
// OPSI 1: Tampilkan anggota pertama saja
no_urut_anggota_pindah: firstAnggota.no_urut || '1',
nik_anggota_pindah: firstAnggota.nik || '',
nama_anggota_pindah: firstAnggota.nama || '',
shdk_anggota_pindah: firstAnggota.shdk || '',

// OPSI 2: Tampilkan semua anggota
// no_urut_anggota_pindah: allNoUrutAnggota || firstAnggota.no_urut || '1',
// nama_anggota_pindah: allNamaAnggota || firstAnggota.nama || '',
// nik_anggota_pindah: allNikAnggota || firstAnggota.nik || '',
// shdk_anggota_pindah: allShdkAnggota || firstAnggota.shdk || '',
```

## 🎯 Keuntungan Format Ini

### ✅ Advantages:

1. **Semua Data Terlihat**
   - Semua anggota keluarga muncul di PDF
   - Tidak perlu check database

2. **Format Terstruktur**
   - Setiap field terpisah dengan jelas
   - No Urut, Nama, NIK, SHDK masing-masing punya kolom

3. **Mudah Dibaca**
   - Line break membuat data lebih rapi
   - Tidak ada koma yang membingungkan di NIK

4. **Konsisten**
   - Semua field menggunakan format yang sama
   - Urutan data tetap terjaga

### ⚠️ Considerations:

1. **Template Limitation**
   - Template F-103 asli hanya 1 baris
   - Format ini menggunakan line break dalam 1 cell

2. **Overflow Risk**
   - Jika terlalu banyak anggota (>10), bisa overflow
   - Cell height akan bertambah otomatis

3. **Printing**
   - Pastikan printer support multi-line dalam cell
   - Check preview sebelum print

## 📝 Testing

### Test Cases:

1. **1 Anggota Keluarga**
   ```
   No Urut: 1
   Nama: John Doe
   NIK: 1234567890123456
   SHDK: Kepala Keluarga
   ```

2. **3 Anggota Keluarga**
   ```
   No Urut: 1
            2
            3
   
   Nama: John Doe
         Jane Doe
         Baby Doe
   
   NIK: 1234567890123456
        9876543210987654
        1111222233334444
   
   SHDK: Kepala Keluarga
         Istri
         Anak
   ```

3. **5+ Anggota Keluarga**
   - Verify tidak overflow
   - Check readability
   - Test print preview

## 🔍 Troubleshooting

### Line Breaks Tidak Muncul di PDF

**Penyebab:**
- Docxtemplater tidak recognize `\n`
- Template cell tidak support multi-line

**Solusi:**
1. Pastikan Docxtemplater config menggunakan `linebreaks: true`:
   ```typescript
   const doc = new Docxtemplater(zip, {
     paragraphLoop: true,
     linebreaks: true, // ← PENTING!
     nullGetter: function() {
       return '';
     },
   });
   ```

2. Atau gunakan `|` sebagai separator:
   ```typescript
   const allNikAnggota = anggotaKeluarga
     .map((a: any) => a.nik)
     .join(' | '); // Gunakan | sebagai separator
   ```

### NIK Masih Ada Koma

**Check:**
- Pastikan menggunakan `.join('\n')` bukan `.join(', ')`
- Verify variable `allNikAnggota` tidak ada koma

### SHDK Tidak Muncul

**Check:**
- Pastikan field `shdk_anggota_pindah` ada di templateData
- Verify placeholder `{shdk_anggota_pindah}` ada di template F-103.docx

## 📚 Related Documentation

- **Placeholder Mapping**: `F-103-placeholder-mapping.md`
- **Multiple Members Solution**: `F-103-multiple-family-members-solution.md`
- **Template Extractor**: `TEMPLATE_EXTRACTOR_GUIDE.md`

---

**Last Updated**: 2025-01-20
**Format**: Line Break Separated (No Comma)
**Status**: ✅ Active
