# SKTM - Nomor Pengantar RT (Optional Field)

## 📋 Overview

Field **Nomor Pengantar RT** pada form SKTM bersifat **optional**. Ketika field ini tidak diisi (kosong), template DOCX akan menampilkan teks alternatif.

---

## ✅ Implementasi

### 1. **Form Page** (`src/app/form-surat/sktm/page.tsx`)

Field Nomor Pengantar RT **tidak memiliki** attribute `required`:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Nomor Pengantar RT
    {/* ❌ TIDAK ADA <span className="text-red-500">*</span> */}
  </label>
  <Input
    type="text"
    name="pengantar_rt"
    value={formData.pengantar_rt}
    onChange={handleInputChange}
    placeholder="Contoh: 001/RT.001/X/2025"
    // ❌ TIDAK ADA required
  />
  <p className="text-xs text-gray-500 mt-1">
    Opsional - Kosongkan jika tidak ada surat pengantar RT
  </p>
</div>
```

---

### 2. **API Process SKTM** (`src/app/api/process-sktm/route.ts`)

**Implementation:**
```typescript
pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '',
```
✅ API menambahkan prefix "Nomor: " jika field diisi
✅ Jika kosong, kirim empty string

---

### 3. **API Preview HTML** (`src/app/api/preview-sktm-html/route.ts`)

**Implementation:**
```typescript
pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '',
```
✅ API menambahkan prefix "Nomor: " jika field diisi
✅ Jika kosong, kirim empty string

---

### 4. **HTML Template** (Conditional Display)

HTML template sudah benar menggunakan conditional:

```typescript
<p>
  Berdasarkan 
  ${data.pengantar_rt 
    ? `Surat Pengantar RT Nomor: ${data.pengantar_rt}` 
    : 'keterangan yang ada'
  }, 
  bahwa nama tersebut di atas benar-benar penduduk Kelurahan ${data.kelurahan}...
</p>
```

**Output:**
- **Jika diisi:** "Berdasarkan Surat Pengantar RT Nomor: 001/RT.001/X/2025, bahwa..."
- **Jika kosong:** "Berdasarkan keterangan yang ada, bahwa..."

---

### 5. **DOCX Template** (`public/template/SKTM.docx`)

Template DOCX harus menggunakan placeholder `{pengantar_rt}` dengan conditional text:

**Cara Edit Template DOCX:**

1. Buka `SKTM.docx` di Microsoft Word
2. Cari bagian yang menyebutkan "Berdasarkan..."
3. Edit menjadi:

```
Berdasarkan Surat Pengantar RT {pengantar_rt}keterangan yang ada, bahwa nama tersebut di atas...
```

**Penjelasan:**
- Jika `pengantar_rt` ada nilai → Akan replace dengan "Nomor: 001/RT.001/X/2025" (sudah include prefix dari API)
- Jika `pengantar_rt` kosong → Akan replace dengan "" (empty string), sehingga text "Surat Pengantar RT " hilang dan menjadi "Berdasarkan keterangan yang ada"

**ATAU gunakan conditional field di Word (lebih clean):**

```
Berdasarkan { IF "{pengantar_rt}" = "" "keterangan yang ada" "Surat Pengantar RT Nomor: {pengantar_rt}" }, bahwa...
```

---

## 🔄 Data Flow

```
1. User mengisi form
   ↓
   pengantar_rt = "001/RT.001/X/2025" ATAU "" (kosong)
   ↓
   
2. API Process/Preview
   ↓
   templateData.pengantar_rt = "Nomor: 001/RT.001/X/2025" ATAU ""
   ↓
   
3. Template DOCX
   ↓
   Placeholder: "Berdasarkan Surat Pengantar RT {pengantar_rt}keterangan yang ada"
   ↓
   Jika ada nilai → "Berdasarkan Surat Pengantar RT Nomor: 001/RT.001/X/2025"
   Jika kosong → "Berdasarkan keterangan yang ada"
   ↓
   
4. PDF Output
   ↓
   Teks yang sesuai dengan kondisi
```

---

## 📝 Testing

### Test Case 1: Dengan Nomor Pengantar RT
**User Input (Form):**
```
pengantar_rt: "001/RT.001/X/2025"
```

**API Output:**
```
templateData.pengantar_rt = "Nomor: 001/RT.001/X/2025"
```

**Expected Output (PDF):**
```
Berdasarkan Surat Pengantar RT Nomor: 001/RT.001/X/2025, bahwa nama tersebut 
di atas benar-benar penduduk Kelurahan CIBODAS...
```

### Test Case 2: Tanpa Nomor Pengantar RT
**User Input (Form):**
```
pengantar_rt: "" (kosong/tidak diisi)
```

**API Output:**
```
templateData.pengantar_rt = ""
```

**Expected Output (PDF):**
```
Berdasarkan keterangan yang ada, bahwa nama tersebut di atas benar-benar 
penduduk Kelurahan CIBODAS...
```

---

## ⚠️ Important Notes

1. **Jangan tambahkan prefix di API** - Biarkan template yang handle formatting
2. **Template DOCX harus di-update** - Tambahkan conditional text atau gunakan IF field
3. **HTML preview sudah benar** - Menggunakan ternary operator untuk conditional display
4. **Konsistensi** - Pastikan behavior sama antara preview HTML dan PDF final

---

## 🎯 Summary

| Component | Handling |
|-----------|----------|
| Form | Optional field (no `required`) |
| API Process | Add prefix: `formData.pengantar_rt ? 'Nomor: ...' : ''` |
| API Preview | Add prefix: `formData.pengantar_rt ? 'Nomor: ...' : ''` |
| HTML Template | Conditional: `${data.pengantar_rt ? 'Surat Pengantar RT ...' : 'keterangan yang ada'}` |
| DOCX Template | Use placeholder: `Surat Pengantar RT {pengantar_rt}keterangan yang ada` |

---

**Status:** ✅ Fixed - API routes add prefix "Nomor: " when field is filled, empty string when not filled
