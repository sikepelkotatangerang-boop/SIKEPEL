# 📝 Instruksi Menggabungkan Form Suami Istri

## File yang Sudah Dibuat:
1. ✅ `PART1_imports_state.tsx` - Imports, interfaces, state, handlers
2. ✅ `PART2_jsx_return.tsx` - JSX return statement (UI)

---

## 🔧 Cara Menggabungkan:

### Step 1: Buat File Baru
```
Buat file baru: page.tsx
```

### Step 2: Copy PART 1
1. Buka file `PART1_imports_state.tsx`
2. **Copy SEMUA isi file** (dari baris 1 sampai akhir)
3. Paste ke `page.tsx`

### Step 3: Copy PART 2
1. Buka file `PART2_jsx_return.tsx`
2. **Copy SEMUA isi file** (dari baris 1 sampai akhir)
3. Paste ke `page.tsx` **TEPAT SETELAH PART 1**

### Step 4: Hapus Comment Separator
Hapus baris ini yang ada di tengah-tengah (antara PART 1 dan PART 2):
```typescript
  // ============================================================================
  // LANJUT KE PART 2 untuk JSX/Return Statement
  // ============================================================================
```

Dan hapus juga comment di awal PART 2:
```typescript
// ============================================================================
// PART 2: JSX Return Statement (UI Components)
// ============================================================================
// Copy dari bawah "return (" sampai akhir, paste setelah PART 1
```

### Step 5: Verify
File `page.tsx` final harus terlihat seperti ini:

```typescript
'use client';

import { useState, useEffect } from 'react';
// ... imports lainnya

interface PejabatData {
  // ...
}

interface FormData {
  // ...
}

export default function FormSuamiIstriPage() {
  const router = useRouter();
  // ... state declarations
  
  // ... useEffect hooks
  
  // ... handler functions
  
  return (
    <DashboardLayout>
      {/* ... JSX content */}
    </DashboardLayout>
  );
}
```

---

## ✅ Checklist:

- [ ] File `page.tsx` dibuat
- [ ] PART 1 di-copy ke `page.tsx`
- [ ] PART 2 di-copy ke `page.tsx` (setelah PART 1)
- [ ] Comment separator dihapus
- [ ] File tidak ada error syntax
- [ ] Save file

---

## 🎯 Hasil Akhir:

File `page.tsx` akan berisi:
- ✅ 38 fields sesuai template KETERANGANSUAMIISTRI.docx
- ✅ Auto-fetch pejabat dari database
- ✅ Auto-populate kelurahan data
- ✅ Generate sample data button
- ✅ Checkbox "Alamat sama dengan suami"
- ✅ Validation sebelum preview
- ✅ Error handling
- ✅ Responsive design (grid MD:2 cols)
- ✅ Loading states
- ✅ Required field indicators (red asterisk)

---

## 📊 Total Lines: ~550 baris

**Struktur:**
- PART 1: ~300 baris (imports, interfaces, state, handlers)
- PART 2: ~250 baris (JSX/UI components)

---

## 🚀 Next Steps:

Setelah form selesai digabung, lanjut ke:
1. **Preview Page** - `/preview-suami-istri/page.tsx`
2. **API Generate PDF** - `/api/generate-suami-istri/route.ts`
3. **Testing** - End-to-end workflow

---

**Happy Coding! 🎉**
