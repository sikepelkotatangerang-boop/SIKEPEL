# SKTM - Keterangan Desil (Conditional Logic)

## 📋 Overview

Template SKTM menggunakan placeholder `{keterangan}` dan `{desil}` yang bersifat **conditional** berdasarkan pilihan desil di form.

---

## 🎯 Business Logic

### **Desil 1-5:**
- **Keterangan:** "Sesuai dengan yang tercantum dalam DTSEN (Data Tunggal Sosial Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang mampu dengan Peringkat Kesejahteraan Warga / Desil"
- **Desil:** Tampilkan nilai desil (contoh: "Desil 1", "Desil 2", dst)

### **Desil 6-10:**
- **Keterangan:** "Menurut pengakuan yang bersangkutan nama tersebut keluarga berpenghasilan rendah"
- **Desil:** **Kosong** (tidak ditampilkan)

---

## 🔧 Implementation

### 1. **Form Options** (`src/app/form-surat/sktm/page.tsx`)

```tsx
<select name="desil" required>
  <option value="">Pilih kategori desil</option>
  <option value="Desil 1">Desil 1</option>
  <option value="Desil 2">Desil 2</option>
  <option value="Desil 3">Desil 3</option>
  <option value="Desil 4">Desil 4</option>
  <option value="Desil 5">Desil 5</option>
  <option value="Desil 6-10">Desil 6-10</option>
</select>
```

---

### 2. **API Process SKTM** (`src/app/api/process-sktm/route.ts`)

```typescript
// Determine keterangan and desil based on desil selection
let keterangan = '';
let desilValue = '';

if (formData.desil === 'Desil 6-10') {
  // Desil 6-10: Gunakan kalimat alternatif, desil kosong
  keterangan = 'Menurut pengakuan yang bersangkutan nama tersebut keluarga berpenghasilan rendah';
  desilValue = '';
} else {
  // Desil 1-5: Gunakan kalimat DTSEN, tampilkan desil
  keterangan = 'Sesuai dengan yang tercantum dalam DTSEN (Data Tunggal Sosial Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang mampu dengan Peringkat Kesejahteraan Warga / Desil';
  desilValue = formData.desil || '';
}

const templateData = {
  // ... other fields
  keterangan: keterangan,
  desil: desilValue,
  // ... other fields
};
```

---

### 3. **API Preview HTML** (`src/app/api/preview-sktm-html/route.ts`)

Same logic as Process SKTM:

```typescript
// Determine keterangan and desil based on desil selection
let keterangan = '';
let desilValue = '';

if (formData.desil === 'Desil 6-10') {
  keterangan = 'Menurut pengakuan yang bersangkutan nama tersebut keluarga berpenghasilan rendah';
  desilValue = '';
} else {
  keterangan = 'Sesuai dengan yang tercantum dalam DTSEN (Data Tunggal Sosial Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang mampu dengan Peringkat Kesejahteraan Warga / Desil';
  desilValue = formData.desil || '';
}
```

---

### 4. **HTML Template** (`preview-sktm-html/route.ts`)

```typescript
<p>
  Berdasarkan ${data.pengantar_rt ? `Surat Pengantar RT ${data.pengantar_rt}` : 'keterangan yang ada'}, 
  bahwa nama tersebut di atas benar-benar penduduk Kelurahan ${data.kelurahan}. 
  ${data.keterangan}${data.desil ? ` <strong>${data.desil}</strong>` : ''}.
</p>
```

---

### 5. **DOCX Template** (`public/template/SKTM.docx`)

**Template Structure:**

```
Berdasarkan Surat Pengantar RT {pengantar_rt}keterangan yang ada, bahwa nama tersebut 
di atas benar-benar penduduk Kelurahan {kelurahan}. {keterangan} {desil}.
```

**Cara Edit Template:**

1. Buka `SKTM.docx` di Microsoft Word
2. Cari kalimat lama yang panjang tentang DTSEN
3. Replace dengan placeholder: `{keterangan} {desil}`
4. Save template

---

## 📊 Output Examples

### **Example 1: Desil 1**

**User Input:**
```
desil: "Desil 1"
```

**API Output:**
```typescript
{
  keterangan: "Sesuai dengan yang tercantum dalam DTSEN (Data Tunggal Sosial Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang mampu dengan Peringkat Kesejahteraan Warga / Desil",
  desil: "Desil 1"
}
```

**PDF Output:**
```
Berdasarkan Surat Pengantar RT Nomor: 001/RT.001/X/2025, bahwa nama tersebut di atas 
benar-benar penduduk Kelurahan CIBODAS. Sesuai dengan yang tercantum dalam DTSEN 
(Data Tunggal Sosial Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang 
mampu dengan Peringkat Kesejahteraan Warga / Desil Desil 1.
```

---

### **Example 2: Desil 3**

**User Input:**
```
desil: "Desil 3"
```

**API Output:**
```typescript
{
  keterangan: "Sesuai dengan yang tercantum dalam DTSEN (Data Tunggal Sosial Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang mampu dengan Peringkat Kesejahteraan Warga / Desil",
  desil: "Desil 3"
}
```

**PDF Output:**
```
Berdasarkan keterangan yang ada, bahwa nama tersebut di atas benar-benar penduduk 
Kelurahan CIBODAS. Sesuai dengan yang tercantum dalam DTSEN (Data Tunggal Sosial 
Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang mampu dengan 
Peringkat Kesejahteraan Warga / Desil Desil 3.
```

---

### **Example 3: Desil 6-10**

**User Input:**
```
desil: "Desil 6-10"
```

**API Output:**
```typescript
{
  keterangan: "Menurut pengakuan yang bersangkutan nama tersebut keluarga berpenghasilan rendah",
  desil: ""
}
```

**PDF Output:**
```
Berdasarkan Surat Pengantar RT Nomor: 001/RT.001/X/2025, bahwa nama tersebut di atas 
benar-benar penduduk Kelurahan CIBODAS. Menurut pengakuan yang bersangkutan nama 
tersebut keluarga berpenghasilan rendah.
```

**Note:** Tidak ada "Desil 6-10" yang ditampilkan di output!

---

## 🔄 Data Flow

```
1. User memilih desil di form
   ↓
   Desil 1-5: "Desil 1", "Desil 2", dst
   Desil 6-10: "Desil 6-10"
   ↓
   
2. API Process/Preview
   ↓
   IF desil === "Desil 6-10":
     keterangan = "Menurut pengakuan..."
     desil = "" (kosong)
   ELSE:
     keterangan = "Sesuai dengan yang tercantum dalam DTSEN..."
     desil = "Desil 1" / "Desil 2" / dst
   ↓
   
3. Template DOCX
   ↓
   {keterangan} {desil}
   ↓
   
4. PDF Output
   ↓
   Desil 1-5: "Sesuai dengan... Desil X"
   Desil 6-10: "Menurut pengakuan..." (tanpa desil)
```

---

## 🎯 Comparison Table

| Desil Selection | Keterangan | Desil Value | Output |
|----------------|------------|-------------|---------|
| **Desil 1** | DTSEN text | "Desil 1" | "...DTSEN... Desil 1" |
| **Desil 2** | DTSEN text | "Desil 2" | "...DTSEN... Desil 2" |
| **Desil 3** | DTSEN text | "Desil 3" | "...DTSEN... Desil 3" |
| **Desil 4** | DTSEN text | "Desil 4" | "...DTSEN... Desil 4" |
| **Desil 5** | DTSEN text | "Desil 5" | "...DTSEN... Desil 5" |
| **Desil 6-10** | "Menurut pengakuan..." | "" (empty) | "Menurut pengakuan..." |

---

## ⚠️ Important Notes

1. **Placeholder di Template DOCX:**
   - Gunakan `{keterangan}` untuk kalimat conditional
   - Gunakan `{desil}` untuk nilai desil (akan kosong untuk 6-10)
   - Jangan hardcode kalimat DTSEN di template!

2. **Spasi di Template:**
   - Pastikan ada spasi antara `{keterangan}` dan `{desil}`
   - Template: `{keterangan} {desil}.`
   - Jika desil kosong, hanya ada 1 spasi sebelum titik

3. **Konsistensi:**
   - Logic yang sama di `process-sktm` dan `preview-sktm-html`
   - Pastikan conditional check: `formData.desil === 'Desil 6-10'`

---

## 📝 Testing Checklist

### Test Case 1: Desil 1
- ✅ Form: Pilih "Desil 1"
- ✅ Preview: Tampil kalimat DTSEN + "Desil 1"
- ✅ PDF: Tampil kalimat DTSEN + "Desil 1"

### Test Case 2: Desil 5
- ✅ Form: Pilih "Desil 5"
- ✅ Preview: Tampil kalimat DTSEN + "Desil 5"
- ✅ PDF: Tampil kalimat DTSEN + "Desil 5"

### Test Case 3: Desil 6-10
- ✅ Form: Pilih "Desil 6-10"
- ✅ Preview: Tampil "Menurut pengakuan..." (tanpa desil)
- ✅ PDF: Tampil "Menurut pengakuan..." (tanpa desil)

---

## 🎯 Summary

| Component | Implementation |
|-----------|----------------|
| Form | 6 options (Desil 1-5 + Desil 6-10) |
| API Logic | Conditional based on `desil === 'Desil 6-10'` |
| Template Placeholders | `{keterangan}` + `{desil}` |
| Desil 1-5 Output | DTSEN text + desil value |
| Desil 6-10 Output | Alternative text + no desil |

---

**Status:** ✅ Implemented - Conditional keterangan and desil based on user selection
