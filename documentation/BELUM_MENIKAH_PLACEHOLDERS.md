# Surat Keterangan Belum Menikah - Placeholders

## 📋 Placeholders dari Template KETERANGANBELUMMENIKAH.docx

Total: **26 placeholders**

### Data Surat
- `{nomor_surat}` - Nomor Surat
- `{pengantar_rt}` - Pengantar Rt
- `{tanggal_surat}` - Tanggal Surat

### Data Pemohon
- `{28A0092B-C50C-407E-A947-70E740481C1C}` - 28A0092B-C50C-407E-A947-70E740481C1C
- `{909E8E84-426E-40DD-AFC4-6F175D3DCCD1}` - 909E8E84-426E-40Dd-Afc4-6F175D3Dccd1
- `{agama}` - Agama
- `{kelamin_pemohon}` - Kelamin Pemohon
- `{nama_pemohon}` - Nama Pemohon
- `{negara}` - Negara
- `{nik_pemohon}` - Nik Pemohon
- `{pekerjaan}` - Pekerjaan
- `{perkawinan}` - Perkawinan
- `{peruntukan}` - Peruntukan
- `{tanggal_lahir}` - Tanggal Lahir
- `{tempat_lahir}` - Tempat Lahir

### Alamat
- `{alamat}` - Alamat
- `{alamat</w:t></w:r><w:r w:rsidR="00485E56"><w:rPr><w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>_kelurahan</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>}` - Alamat</W:T></W:R><W:R W:Rsidr="00485E56"><W:Rpr><W:Rfonts W:Ascii="Tahoma" W:Hansi="Tahoma" W:Cs="Tahoma"/><W:Sz W:Val="28"/><W:Szcs W:Val="28"/></W:Rpr><W:T> Kelurahan</W:T></W:R><W:R><W:Rpr><W:Rfonts W:Ascii="Tahoma" W:Hansi="Tahoma" W:Cs="Tahoma"/><W:Sz W:Val="28"/><W:Szcs W:Val="28"/></W:Rpr><W:T>
- `{kecamatan}` - Kecamatan
- `{kelurahan}` - Kelurahan
- `{kota_kabupaten}` - Kota Kabupaten
- `{rt}` - Rt
- `{rw}` - Rw

### Data Pejabat
- `{jabatan}` - Jabatan
- `{jabatan_detail}` - Jabatan Detail
- `{nama_pejabat}` - Nama Pejabat
- `{nip_pejabat}` - Nip Pejabat

---

## 🎯 Format Nomor Surat

**Format:** `B/(nomor)/400.12.3.2/(bulan romawi)/(tahun)`

**Example:** `B/001/400.12.3.2/X/2025`

---

## 📊 Form Structure

### Section 1: Data Surat
- Nomor Surat (auto-generate, read-only)
- Nomor Pengantar RT (optional)

### Section 2: Data Pemohon
- NIK, Nama, Tempat/Tanggal Lahir
- Jenis Kelamin, Agama, Pekerjaan
- Status Perkawinan, Kewarganegaraan

### Section 3: Alamat Pemohon
- Alamat Lengkap
- RT, RW, Kelurahan, Kecamatan, Kota/Kabupaten

### Section 4: Data Pejabat
- Dropdown selection pejabat
- Auto-fill nama, NIP, jabatan

---

## 🔄 Workflow

```
Form → Preview → Process/Download
```

1. User mengisi form
2. Klik "Lihat Preview" → `/preview-belum-menikah`
3. Preview HTML → Pilih download method
4. Generate PDF → Save to database → Download

---

## 📁 Files to Create

1. ✅ `src/app/form-surat/belum-menikah/page.tsx` - Form page
2. ⏳ `src/app/preview-belum-menikah/page.tsx` - Preview page
3. ⏳ `src/app/api/preview-belum-menikah-html/route.ts` - HTML preview API
4. ⏳ `src/app/api/process-belum-menikah/route.ts` - PDF generation API
5. ⏳ Update `src/app/api/generate-nomor-surat/route.ts` - Add format

---

**Status:** Ready to implement following SKTM pattern
