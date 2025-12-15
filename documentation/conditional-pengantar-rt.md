# Conditional Pengantar RT Field

## 🎯 Requirement

Field `pengantar_rt` (Nomor Surat Pengantar RT) bersifat **optional**:
- Jika **diisi** → Tampilkan: "Berdasarkan Surat Pengantar RT Nomor: XXX"
- Jika **kosong** → Tampilkan: "Berdasarkan keterangan yang ada"

---

## 📝 Template Changes

### DOCX Template:
```
Before: Nomor: {pengantar_rt}
After:  {pengantar_rt}
```

**Reason:** Kata "Nomor:" sekarang ditambahkan di code, bukan di template.

---

## 💻 Implementation

### 1. API Process SKTM (ConvertAPI)

**File:** `src/app/api/process-sktm/route.ts`

```typescript
const templateData = {
  // ... other fields
  pengantar_rt: formData.pengantar_rt 
    ? `Nomor: ${formData.pengantar_rt}` 
    : '',
  // ... other fields
};
```

**Logic:**
- If `pengantar_rt` has value → Add "Nomor: " prefix
- If empty → Empty string

---

### 2. API Preview HTML

**File:** `src/app/api/preview-sktm-html/route.ts`

#### A. Template Data:
```typescript
const templateData = {
  // ... other fields
  pengantar_rt: formData.pengantar_rt 
    ? `Nomor: ${formData.pengantar_rt}` 
    : '',
  // ... other fields
};
```

#### B. HTML Content:
```html
<p>
  Berdasarkan 
  ${data.pengantar_rt 
    ? `Surat Pengantar RT ${data.pengantar_rt}` 
    : 'keterangan yang ada'
  }, 
  bahwa nama tersebut di atas benar-benar penduduk...
</p>
```

---

## 📊 Output Examples

### Example 1: With Pengantar RT

**Input:**
```json
{
  "pengantar_rt": "001/RT.003/RW.005/X/2025"
}
```

**DOCX Template:**
```
{pengantar_rt}
```

**Result in DOCX:**
```
Nomor: 001/RT.003/RW.005/X/2025
```

**HTML Output:**
```
Berdasarkan Surat Pengantar RT Nomor: 001/RT.003/RW.005/X/2025, 
bahwa nama tersebut di atas benar-benar penduduk...
```

---

### Example 2: Without Pengantar RT

**Input:**
```json
{
  "pengantar_rt": ""
}
```

**DOCX Template:**
```
{pengantar_rt}
```

**Result in DOCX:**
```
(empty/blank)
```

**HTML Output:**
```
Berdasarkan keterangan yang ada, 
bahwa nama tersebut di atas benar-benar penduduk...
```

---

## 🔄 Flow Diagram

```
User fills form
    ↓
Pengantar RT field?
    ↓
┌─────────────────────────────────────┐
│  Has Value (e.g., "001/RT/2025")    │
│  ↓                                   │
│  Add prefix "Nomor: "               │
│  ↓                                   │
│  Result: "Nomor: 001/RT/2025"       │
│  ↓                                   │
│  DOCX: Shows "Nomor: 001/RT/2025"   │
│  HTML: "Surat Pengantar RT Nomor:..." │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Empty/Null                         │
│  ↓                                   │
│  Return empty string                │
│  ↓                                   │
│  Result: ""                         │
│  ↓                                   │
│  DOCX: Shows nothing (blank)        │
│  HTML: "keterangan yang ada"        │
└─────────────────────────────────────┘
```

---

## 🎨 Visual Comparison

### With Pengantar RT:
```
┌─────────────────────────────────────────────────┐
│ Berdasarkan Surat Pengantar RT                  │
│ Nomor: 001/RT.003/RW.005/X/2025,                │
│ bahwa nama tersebut di atas benar-benar         │
│ penduduk Kelurahan CIBODAS...                   │
└─────────────────────────────────────────────────┘
```

### Without Pengantar RT:
```
┌─────────────────────────────────────────────────┐
│ Berdasarkan keterangan yang ada,                │
│ bahwa nama tersebut di atas benar-benar         │
│ penduduk Kelurahan CIBODAS...                   │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Case 1: With Pengantar RT
```bash
npm run dev
```

1. Buka `/form-surat/sktm`
2. Isi form dengan Pengantar RT: `001/RT.003/RW.005/X/2025`
3. Preview
4. **Verify HTML:** "Berdasarkan Surat Pengantar RT Nomor: 001/RT.003/RW.005/X/2025"
5. Cetak & Selesai
6. **Verify PDF:** Shows "Nomor: 001/RT.003/RW.005/X/2025"

### Test Case 2: Without Pengantar RT
1. Buka `/form-surat/sktm`
2. Isi form, **kosongkan** Pengantar RT
3. Preview
4. **Verify HTML:** "Berdasarkan keterangan yang ada"
5. Cetak & Selesai
6. **Verify PDF:** No "Nomor:" text, just blank

### Test Case 3: Database Save
```sql
-- Check saved data
SELECT nomor_surat, pengantar_rt 
FROM sktm_documents 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected:**
- With value: `"001/RT.003/RW.005/X/2025"`
- Without value: `""` or `NULL`

---

## 📝 Code Changes Summary

### Files Modified:
1. ✅ `src/app/api/process-sktm/route.ts`
   - Added conditional prefix "Nomor: "
   
2. ✅ `src/app/api/preview-sktm-html/route.ts`
   - Added conditional prefix "Nomor: "
   - Updated HTML to show alternative text

### Template File:
3. ✅ `public/template/SKTM.docx`
   - Changed from: `Nomor: {pengantar_rt}`
   - Changed to: `{pengantar_rt}`

---

## 🔧 Maintenance

### Adding Similar Conditional Fields:

```typescript
// Pattern for optional fields with prefix
const templateData = {
  field_name: formData.field_name 
    ? `Prefix: ${formData.field_name}` 
    : '',
};
```

```html
<!-- Pattern for HTML with fallback -->
<p>
  ${data.field_name 
    ? `Text with ${data.field_name}` 
    : 'Fallback text'
  }
</p>
```

---

## 💡 Best Practices

### 1. Consistent Handling:
- Always check if field has value before adding prefix
- Provide meaningful fallback text

### 2. Template Flexibility:
- Keep templates clean (no hardcoded prefixes)
- Add prefixes in code for better control

### 3. User Experience:
- Optional fields should not break document flow
- Fallback text should make sense in context

---

## 🐛 Troubleshooting

### Issue: "Nomor:" appears even when empty

**Cause:** Template still has "Nomor: {pengantar_rt}"

**Solution:**
1. Update DOCX template to only `{pengantar_rt}`
2. Restart application
3. Test again

### Issue: Shows "undefined" or "null"

**Cause:** Not handling empty values properly

**Solution:**
```typescript
// Wrong
pengantar_rt: formData.pengantar_rt

// Correct
pengantar_rt: formData.pengantar_rt 
  ? `Nomor: ${formData.pengantar_rt}` 
  : ''
```

### Issue: HTML shows blank instead of fallback

**Cause:** Missing conditional in HTML template

**Solution:**
```html
<!-- Add conditional -->
${data.pengantar_rt 
  ? `Surat Pengantar RT ${data.pengantar_rt}` 
  : 'keterangan yang ada'
}
```

---

## ✅ Checklist

- [x] Updated `process-sktm/route.ts` with conditional
- [x] Updated `preview-sktm-html/route.ts` with conditional
- [x] Updated HTML template with fallback text
- [x] Updated DOCX template (remove "Nomor:")
- [ ] Test with value
- [ ] Test without value
- [ ] Verify PDF output
- [ ] Verify HTML preview
- [ ] Verify database save

---

## 🎯 Result

**Before:**
- Template: `Nomor: {pengantar_rt}`
- Empty field shows: `Nomor: ` (awkward)
- No flexibility

**After:**
- Template: `{pengantar_rt}`
- With value: `Nomor: 001/RT/2025` ✅
- Without value: (blank in PDF, fallback in HTML) ✅
- Flexible and clean! ✅

---

Field Pengantar RT sekarang bersifat optional dengan handling yang proper! 🎉
