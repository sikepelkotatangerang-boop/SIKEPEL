# Cara Menyesuaikan Form SKTM dengan Template DOCX

## Langkah-langkah

### 1. Buka Template SKTM.docx

Buka file `public/template/SKTM.docx` dan catat semua placeholder yang ada.

### 2. Identifikasi Placeholder yang Dibutuhkan

Lihat semua placeholder dalam format `{namaPlaceholder}` di template. Contoh:
- `{nik}`
- `{namaLengkap}`
- `{nomorSurat}` (jika ada)
- dll.

### 3. Bandingkan dengan Form Saat Ini

**Form saat ini memiliki field:**

**Data Pemohon:**
- nik
- namaLengkap
- tempatLahir
- tanggalLahir
- jenisKelamin
- agama
- pekerjaan
- statusPerkawinan

**Data Keluarga:**
- namaKepalaKeluarga
- jumlahAnggotaKeluarga
- jumlahTanggungan

**Data Ekonomi:**
- penghasilanPerBulan
- sumberPenghasilan
- kondisiRumah
- statusKepemilikanRumah

**Alamat:**
- alamatLengkap
- rt
- rw
- kelurahan
- kecamatan
- kabupaten
- provinsi

**Keperluan:**
- keperluan
- keteranganTambahan

**Data Otomatis:**
- tanggalSurat (otomatis)

### 4. Tambahkan Field yang Kurang

Jika template memiliki placeholder yang belum ada di form, tambahkan dengan cara:

#### A. Tambah di State (formData)

Edit file: `src/app/form-surat/sktm/page.tsx`

```typescript
const [formData, setFormData] = useState({
  // ... field yang sudah ada ...
  
  // Tambahkan field baru di sini
  nomorSurat: '',
  namaLurah: '',
  nipLurah: '',
  // dst...
});
```

#### B. Tambah di Sample Data (generateSampleData)

```typescript
const generateSampleData = () => {
  const sampleData = {
    // ... data yang sudah ada ...
    
    // Tambahkan data contoh untuk field baru
    nomorSurat: '470/001/SKTM/2025',
    namaLurah: 'Drs. H. Ahmad Suryadi, M.Si',
    nipLurah: '196501011990031001',
    // dst...
  };
  // ...
};
```

#### C. Tambah Input Field di Form

Tambahkan di bagian form yang sesuai:

```typescript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Nomor Surat <span className="text-red-500">*</span>
  </label>
  <Input
    type="text"
    name="nomorSurat"
    value={formData.nomorSurat}
    onChange={handleInputChange}
    placeholder="Contoh: 470/001/SKTM/2025"
    required
  />
</div>
```

#### D. Tambah di API Route

Edit file: `src/app/api/generate-sktm/route.ts`

```typescript
const templateData = {
  // ... data yang sudah ada ...
  
  // Tambahkan field baru
  nomorSurat: formData.nomorSurat || '',
  namaLurah: formData.namaLurah || '',
  nipLurah: formData.nipLurah || '',
  // dst...
};
```

### 5. Hapus Field yang Tidak Perlu

Jika ada field di form yang tidak ada di template, Anda bisa:
- Tetap pertahankan (untuk fleksibilitas)
- Atau hapus jika tidak diperlukan

### 6. Contoh: Menambahkan Field Baru

Misalnya template memiliki placeholder `{nomorSurat}`:

**1. Update formData:**
```typescript
const [formData, setFormData] = useState({
  // ... existing fields ...
  nomorSurat: '',
});
```

**2. Update generateSampleData:**
```typescript
const sampleData = {
  // ... existing data ...
  nomorSurat: '470/001/SKTM/2025',
};
```

**3. Tambah input di form (setelah header, sebelum Data Pemohon):**
```typescript
{/* Nomor Surat */}
<Card>
  <CardContent className="p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-4">Nomor Surat</h2>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Nomor Surat <span className="text-red-500">*</span>
      </label>
      <Input
        type="text"
        name="nomorSurat"
        value={formData.nomorSurat}
        onChange={handleInputChange}
        placeholder="Contoh: 470/001/SKTM/2025"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        Format: [Kode]/[Nomor]/SKTM/[Tahun]
      </p>
    </div>
  </CardContent>
</Card>
```

**4. Update API route:**
```typescript
const templateData = {
  // ... existing fields ...
  nomorSurat: formData.nomorSurat || '',
};
```

## Field Umum yang Sering Ada di SKTM

Berikut field yang umum ada di template SKTM:

### Data Surat
- `{nomorSurat}` - Nomor surat
- `{tanggalSurat}` - Tanggal surat (sudah ada, otomatis)

### Data Pemohon (sudah ada semua)
- `{nik}`, `{namaLengkap}`, `{tempatLahir}`, `{tanggalLahir}`
- `{jenisKelamin}`, `{agama}`, `{pekerjaan}`, `{statusPerkawinan}`

### Data Keluarga (sudah ada semua)
- `{namaKepalaKeluarga}`, `{jumlahAnggotaKeluarga}`, `{jumlahTanggungan}`

### Data Ekonomi (sudah ada semua)
- `{penghasilanPerBulan}`, `{sumberPenghasilan}`
- `{kondisiRumah}`, `{statusKepemilikanRumah}`

### Alamat (sudah ada semua)
- `{alamatLengkap}`, `{rt}`, `{rw}`, `{kelurahan}`
- `{kecamatan}`, `{kabupaten}`, `{provinsi}`

### Keperluan (sudah ada semua)
- `{keperluan}`, `{keteranganTambahan}`

### Data Penandatangan (mungkin perlu ditambahkan)
- `{namaLurah}` - Nama lurah
- `{nipLurah}` - NIP lurah
- `{jabatanPenandatangan}` - Jabatan (default: "Lurah Cibodas")

### Data Tambahan (opsional)
- `{kodePos}` - Kode pos
- `{noTelepon}` - Nomor telepon pemohon
- `{pendidikan}` - Pendidikan terakhir
- `{kewarganegaraan}` - Kewarganegaraan (default: "Indonesia")

## Checklist

- [ ] Buka template SKTM.docx
- [ ] Catat semua placeholder yang ada
- [ ] Bandingkan dengan form saat ini
- [ ] Identifikasi field yang kurang
- [ ] Tambahkan field baru ke formData
- [ ] Tambahkan field baru ke generateSampleData
- [ ] Tambahkan input field di form
- [ ] Tambahkan field baru ke API route
- [ ] Test dengan generate data contoh
- [ ] Verifikasi dokumen hasil

## Tips

1. **Gunakan nama field yang sama** dengan placeholder di template (tanpa kurung kurawal)
2. **Kelompokkan field** berdasarkan kategori (Data Pemohon, Alamat, dll)
3. **Tambahkan validasi** untuk field yang wajib diisi
4. **Berikan placeholder** yang jelas di setiap input
5. **Test setiap perubahan** dengan generate data contoh

## Contoh Lengkap

Jika Anda ingin saya membantu menambahkan field tertentu, berikan informasi:
1. Nama placeholder di template (contoh: `{nomorSurat}`)
2. Jenis data (text, number, date, select)
3. Apakah wajib diisi atau opsional
4. Contoh nilai yang valid

Saya akan membantu generate kode yang lengkap!
