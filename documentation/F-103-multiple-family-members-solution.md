# F-103 Template - Solusi Multiple Anggota Keluarga

## 🔍 Masalah

Template F-103.docx adalah formulir resmi pemerintah yang **hanya menyediakan 1 baris** untuk data anggota keluarga yang pindah.

**Placeholder yang tersedia:**
- `{nama_anggota_pindah}` - 1 field
- `{nik_anggota_pindah}` - 1 field  
- `{no_urut_anggota_pindah}` - 1 field
- `{shdk_anggota_pindah}` - 1 field

**Keterbatasan:**
- ❌ Tidak bisa menambah baris di template (format resmi pemerintah)
- ❌ Tidak ada placeholder untuk anggota ke-2, ke-3, dst
- ❌ Template tidak support looping/repeating sections

## ✅ Solusi yang Diimplementasikan

### **Solusi 1: Tampilkan Anggota Pertama (Default)**

Hanya menampilkan anggota keluarga pertama di PDF, tapi **semua data tersimpan di database**.

#### Implementasi:

```typescript
// API Route: /api/process-pindah-keluar/route.ts
const anggotaKeluarga = formData.anggota_keluarga || [];
const firstAnggota = anggotaKeluarga[0] || {
  no_urut: '1',
  nik: '',
  nama: '',
  shdk: '',
};

const templateData = {
  // ... fields lain
  
  // OPSI 1: Tampilkan anggota pertama saja (default)
  no_urut_anggota_pindah: firstAnggota.no_urut || '1',
  nik_anggota_pindah: firstAnggota.nik || '',
  nama_anggota_pindah: firstAnggota.nama || '',
  shdk_anggota_pindah: firstAnggota.shdk || '',
};
```

#### Hasil di PDF:
```
Nama Anggota: John Doe
NIK: 1234567890123456
SHDK: Kepala Keluarga
```

#### Data di Database:
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

**✅ Keuntungan:**
- Sesuai format template resmi
- Clean dan tidak berantakan
- Data lengkap tetap tersimpan di database

**❌ Kekurangan:**
- Hanya 1 anggota yang terlihat di PDF
- User harus check database untuk lihat semua anggota

---

### **Solusi 2: Gabungkan Semua Anggota dalam 1 Field**

Menampilkan semua anggota keluarga dalam 1 field dengan line breaks atau comma-separated.

#### Implementasi:

```typescript
// API Route: /api/process-pindah-keluar/route.ts

// Gabungkan semua nama dengan line breaks
const allNamaAnggota = anggotaKeluarga
  .map((a: any, i: number) => `${i + 1}. ${a.nama} (${a.shdk})`)
  .join('\n');

// Gabungkan semua NIK dengan comma
const allNikAnggota = anggotaKeluarga
  .map((a: any) => a.nik)
  .join(', ');

const templateData = {
  // ... fields lain
  
  // OPSI 2: Tampilkan semua anggota (gabung dalam 1 field)
  nama_anggota_pindah: allNamaAnggota || firstAnggota.nama || '',
  nik_anggota_pindah: allNikAnggota || firstAnggota.nik || '',
  no_urut_anggota_pindah: anggotaKeluarga.length.toString() || '1',
  shdk_anggota_pindah: 'Lihat daftar nama', // atau kosongkan
};
```

#### Hasil di PDF:
```
Nama Anggota: 
1. John Doe (Kepala Keluarga)
2. Jane Doe (Istri)
3. Baby Doe (Anak)

NIK: 1234567890123456, 9876543210987654, 1111222233334444
```

**✅ Keuntungan:**
- Semua anggota terlihat di PDF
- User tidak perlu check database
- Informasi lengkap dalam 1 dokumen

**❌ Kekurangan:**
- Bisa berantakan jika banyak anggota
- Tidak sesuai format template asli (1 baris jadi multi-line)
- Bisa overflow jika terlalu banyak

---

## 🔧 Cara Mengaktifkan Solusi 2

### Step 1: Edit API Route

File: `src/app/api/process-pindah-keluar/route.ts`

**Uncomment baris berikut:**

```typescript
// SEBELUM (Solusi 1 - Default)
const templateData = {
  // ...
  nama_anggota_pindah: firstAnggota.nama || '',
  nik_anggota_pindah: firstAnggota.nik || '',
  // ...
};
```

**SESUDAH (Solusi 2 - All Members):**

```typescript
const templateData = {
  // ...
  // OPSI 2: Uncomment baris di bawah
  nama_anggota_pindah: allNamaAnggota || firstAnggota.nama || '',
  nik_anggota_pindah: allNikAnggota || firstAnggota.nik || '',
  // ...
};
```

### Step 2: Test

1. Isi form dengan multiple anggota keluarga
2. Generate PDF
3. Check apakah semua nama muncul

---

## 📊 Perbandingan Solusi

| Aspek | Solusi 1 (Default) | Solusi 2 (All Members) |
|-------|-------------------|------------------------|
| **Tampilan PDF** | Clean, 1 anggota | Semua anggota terlihat |
| **Sesuai Template** | ✅ Ya | ⚠️ Modified |
| **Data Lengkap** | ✅ Di database | ✅ Di PDF & database |
| **Readability** | ✅ Bagus | ⚠️ Tergantung jumlah |
| **Overflow Risk** | ✅ Tidak ada | ⚠️ Ada jika banyak |
| **User Experience** | ⚠️ Harus check DB | ✅ Semua di PDF |

---

## 🎯 Rekomendasi

### **Gunakan Solusi 1 (Default) jika:**
- ✅ Mengutamakan format resmi pemerintah
- ✅ Biasanya hanya 1-2 anggota yang pindah
- ✅ Ada akses ke database untuk lihat detail
- ✅ Ingin PDF yang clean dan professional

### **Gunakan Solusi 2 (All Members) jika:**
- ✅ Sering ada banyak anggota yang pindah
- ✅ User tidak punya akses database
- ✅ Perlu semua info dalam 1 dokumen
- ✅ Tidak masalah dengan format yang sedikit berbeda

---

## 🔄 Solusi Alternatif Lain

### **Opsi 3: Generate Multiple PDFs**

Generate 1 PDF per anggota keluarga.

```typescript
// Pseudocode
for (const anggota of anggotaKeluarga) {
  const templateData = {
    nama_anggota_pindah: anggota.nama,
    nik_anggota_pindah: anggota.nik,
    // ...
  };
  
  generatePDF(templateData, `pindah-keluar-${anggota.nama}.pdf`);
}
```

**✅ Keuntungan:**
- Setiap anggota punya dokumen sendiri
- Format tetap sesuai template

**❌ Kekurangan:**
- Banyak file PDF
- Proses lebih lama
- User harus download multiple files

---

### **Opsi 4: Lampiran Terpisah**

PDF utama hanya 1 anggota, sisanya di lampiran Excel/PDF.

```typescript
// Generate PDF utama (anggota pertama)
const mainPDF = generatePDF(firstAnggota);

// Generate Excel untuk semua anggota
const excelAttachment = generateExcel(anggotaKeluarga);

// Zip together
const zipFile = createZip([mainPDF, excelAttachment]);
```

**✅ Keuntungan:**
- PDF tetap clean
- Data lengkap di lampiran
- Flexible format

**❌ Kekurangan:**
- Lebih kompleks
- User harus buka 2 file
- Perlu library tambahan

---

## 💾 Data Storage

**Semua solusi tetap menyimpan data lengkap di database:**

```sql
-- Table: document_archives
INSERT INTO document_archives (
  -- ...
  data_detail
) VALUES (
  -- ...
  '{
    "anggota_keluarga": [
      {"no_urut": "1", "nik": "...", "nama": "...", "shdk": "..."},
      {"no_urut": "2", "nik": "...", "nama": "...", "shdk": "..."},
      {"no_urut": "3", "nik": "...", "nama": "...", "shdk": "..."}
    ]
  }'::jsonb
);
```

**Query untuk lihat semua anggota:**

```sql
SELECT 
  nama_subjek,
  data_detail->'anggota_keluarga' as all_members
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar';
```

---

## 🎨 UI/UX Considerations

### **Preview Page**

Tampilkan warning jika ada multiple anggota:

```tsx
{formData.anggota_keluarga && formData.anggota_keluarga.length > 1 && (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-sm text-yellow-800">
      ⚠️ Template F-103 hanya menampilkan 1 anggota pertama di PDF.
      <br />
      Data lengkap {formData.anggota_keluarga.length} anggota tersimpan di database.
    </p>
  </div>
)}
```

### **Daftar Anggota Card**

Sudah diimplementasikan di preview page:

```tsx
<Card>
  <CardContent className="p-6">
    <h3 className="font-semibold text-gray-900 mb-3 text-sm">
      👥 Anggota Keluarga Yang Pindah ({formData.anggota_keluarga.length} orang)
    </h3>
    <div className="space-y-2">
      {formData.anggota_keluarga.map((anggota: any, index: number) => (
        <div key={index} className="text-xs bg-gray-50 p-2 rounded">
          <div className="font-medium text-gray-900">
            {index + 1}. {anggota.nama || '-'}
          </div>
          <div className="text-gray-600">NIK: {anggota.nik || '-'}</div>
          <div className="text-gray-600">SHDK: {anggota.shdk || '-'}</div>
        </div>
      ))}
    </div>
    <p className="text-xs text-gray-500 mt-3">
      * Template F-103 hanya menampilkan 1 anggota pertama. 
      Data lengkap tersimpan di database.
    </p>
  </CardContent>
</Card>
```

---

## 📝 Testing Checklist

- [ ] Test dengan 1 anggota keluarga
- [ ] Test dengan 2 anggota keluarga
- [ ] Test dengan 5+ anggota keluarga
- [ ] Verify data tersimpan lengkap di database
- [ ] Check PDF tidak overflow
- [ ] Check line breaks berfungsi (jika Solusi 2)
- [ ] Verify preview page menampilkan semua anggota
- [ ] Test download PDF
- [ ] Verify database query returns all members

---

## 🚀 Future Enhancements

### **1. Custom Template dengan Multiple Rows**

Buat template custom yang support multiple rows:

```
Template F-103-Extended.docx
- Row 1: {nama_anggota_1}, {nik_anggota_1}, {shdk_anggota_1}
- Row 2: {nama_anggota_2}, {nik_anggota_2}, {shdk_anggota_2}
- Row 3: {nama_anggota_3}, {nik_anggota_3}, {shdk_anggota_3}
...
```

### **2. Dynamic Table Generation**

Gunakan Docxtemplater dengan table looping:

```typescript
const templateData = {
  anggota_keluarga: formData.anggota_keluarga.map((a, i) => ({
    no_urut: i + 1,
    nik: a.nik,
    nama: a.nama,
    shdk: a.shdk,
  }))
};

// Template dengan loop
// {#anggota_keluarga}
// {no_urut} | {nik} | {nama} | {shdk}
// {/anggota_keluarga}
```

### **3. Lampiran Otomatis**

Generate lampiran PDF terpisah untuk daftar lengkap anggota keluarga.

---

## 📞 Support

Jika ada pertanyaan atau issue:
- Check dokumentasi ini
- Review implementation di `src/app/api/process-pindah-keluar/route.ts`
- Check preview page di `src/app/preview-pindah-keluar/page.tsx`

---

**Last Updated**: 2025-01-20
**Current Solution**: Solusi 1 (Default) - Tampilkan anggota pertama
**Alternative**: Solusi 2 (Available) - Uncomment untuk tampilkan semua
