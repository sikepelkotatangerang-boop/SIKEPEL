# SKU (Surat Keterangan Usaha) - Placeholders

## 📋 Placeholders dari Template SKU.docx

Total: **31 placeholders**

### 1. Data Surat
- `{nomor_surat}` - Nomor surat
- `{tanggal_surat}` - Tanggal surat
- `{pengantar_rt}` - Nomor surat pengantar RT (optional)

### 2. Data Pemohon/Pemilik Usaha
- `{nik_pemohon}` - NIK pemilik usaha
- `{nama_pemohon}` - Nama lengkap pemilik usaha
- `{tempat_lahir}` - Tempat lahir
- `{tanggal_lahir}` - Tanggal lahir
- `{kelamin_pemohon}` - Jenis kelamin (Laki-laki/Perempuan)
- `{agama}` - Agama
- `{pekerjaan}` - Pekerjaan
- `{perkawinan}` - Status perkawinan
- `{negara}` - Kewarganegaraan (default: Indonesia)

### 3. Alamat Pemohon
- `{alamat}` - Alamat lengkap pemohon
- `{rt}` - RT pemohon
- `{rw}` - RW pemohon
- `{kelurahan}` - Kelurahan pemohon
- `{kecamatan}` - Kecamatan pemohon
- `{kota_kabupaten}` - Kota/Kabupaten pemohon
- `{alamat_kelurahan}` - Alamat kantor kelurahan

### 4. Data Usaha
- `{nama_usaha}` - Nama usaha
- `{jenis_usaha}` - Jenis usaha (Perdagangan, Jasa, Kuliner, dll)
- `{alamat_usaha}` - Alamat lengkap usaha
- `{rt_usaha}` - RT usaha
- `{rw_usaha}` - RW usaha
- `{kel_usaha}` - Kelurahan usaha
- `{kec_usaha}` - Kecamatan usaha
- `{kota_kabupaten_usaha}` - Kota/Kabupaten usaha

### 5. Data Pejabat Penandatangan
- `{nama_pejabat}` - Nama pejabat
- `{nip_pejabat}` - NIP pejabat
- `{jabatan}` - Jabatan (LURAH / a.n LURAH)
- `{jabatan_detail}` - Detail jabatan (kosong jika Lurah)

---

## 🎯 Format Nomor Surat SKU

**Format:** `B/(nomor)/500.3.3/(bulan romawi)/(tahun)`

**Example:** `B/001/500.3.3/X/2025`

---

## 📊 Form Structure

### Section 1: Data Surat
- Nomor Surat (auto-generate, read-only)
- Nomor Pengantar RT (optional)

### Section 2: Data Pemilik Usaha
- NIK, Nama, Tempat/Tanggal Lahir
- Jenis Kelamin, Agama, Pekerjaan
- Status Perkawinan, Kewarganegaraan

### Section 3: Alamat Pemohon
- Alamat Lengkap
- RT, RW, Kelurahan, Kecamatan, Kota/Kabupaten

### Section 4: Data Usaha
- Nama Usaha
- Jenis Usaha
- Alamat Usaha (lengkap dengan RT/RW/Kel/Kec/Kota)

### Section 5: Data Pejabat
- Dropdown selection pejabat
- Auto-fill nama, NIP, jabatan

---

## 🔄 Workflow

```
Form → Preview → Process/Download
```

1. User mengisi form
2. Klik "Lihat Preview" → `/preview-sku`
3. Preview HTML → Pilih download method
4. Generate PDF → Save to database → Download

---

## 📁 Files to Create

1. ✅ `src/app/form-surat/usaha/page.tsx` - Form page
2. ⏳ `src/app/preview-sku/page.tsx` - Preview page
3. ⏳ `src/app/api/preview-sku-html/route.ts` - HTML preview API
4. ⏳ `src/app/api/process-sku/route.ts` - PDF generation API
5. ⏳ Update `src/app/api/generate-nomor-surat/route.ts` - Add SKU format

---

**Status:** Ready to implement following SKTM pattern
