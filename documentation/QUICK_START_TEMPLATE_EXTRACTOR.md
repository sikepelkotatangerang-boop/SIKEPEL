# Template Placeholder Extractor - Quick Start

## 🚀 Quick Start (30 seconds)

### 1. Extract Placeholders

```bash
python extract_template_placeholders.py public/template/YourTemplate.docx
```

### 2. Open Documentation

```bash
# File akan tersimpan di:
documentation/YOURTEMPLATE_PLACEHOLDERS.md
```

### 3. Copy & Use

Copy TypeScript interface dan mapping dari dokumentasi ke code Anda.

---

## 📋 Common Commands

```bash
# Extract dari template F-103
python extract_template_placeholders.py public\template\F-103.docx

# Extract dari template SKTM
python extract_template_placeholders.py public\template\SKTM.docx

# Extract dari template SKU
python extract_template_placeholders.py public\template\SKU.docx

# Extract semua template (Windows PowerShell)
Get-ChildItem public\template\*.docx | ForEach-Object { python extract_template_placeholders.py $_.FullName }

# Extract semua template (Linux/Mac)
for file in public/template/*.docx; do python extract_template_placeholders.py "$file"; done
```

---

## 📦 Installation

```bash
pip install python-docx
```

---

## 📄 Output Files

| Template | Output File |
|----------|-------------|
| `SKTM.docx` | `documentation/SKTM_PLACEHOLDERS.md` |
| `F-103.docx` | `documentation/F-103_PLACEHOLDERS.md` |
| `SKU.docx` | `documentation/SKU_PLACEHOLDERS.md` |

---

## 🎯 What You Get

### 1. Console Output
```
======================================================================
PLACEHOLDERS FROM F-103.docx
======================================================================

Total placeholders found: 31

 1. {alamat_asal}
 2. {alamat_pindah}
 ...
```

### 2. Markdown Documentation

Includes:
- ✅ Complete placeholder list
- ✅ Placeholder locations in document
- ✅ TypeScript interface
- ✅ Template data mapping
- ✅ Usage examples
- ✅ Special character warnings

---

## 💡 Usage in Code

### Step 1: Copy Interface

From documentation:

```typescript
interface F103FormData {
  alamatAsal: string;
  alamatPindah: string;
  emailPemohon: string;
  // ... all fields
}
```

### Step 2: Copy Mapping

From documentation:

```typescript
const templateData = {
  alamat_asal: formData.alamat_asal || '',
  alamat_pindah: formData.alamat_pindah || '',
  email_pemohon: formData.email_pemohon || '',
  // ... all fields
};
```

### Step 3: Render

```typescript
doc.render(templateData);
```

---

## ⚠️ Important Notes

### Special Characters

Placeholders with `/`, `-`, or `.` require quotes:

```typescript
// ❌ Wrong
kota/kab_pindah: formData.kotaKabPindah || '',

// ✅ Correct
'kota/kab_pindah': formData.kotaKabPindah || '',
```

### Naming Convention

Tool auto-converts to camelCase:

| Placeholder | TypeScript |
|-------------|------------|
| `{nama_pemohon}` | `namaPemohon` |
| `{no_hp_pemohon}` | `noHpPemohon` |
| `{kota/kab_pindah}` | `kotaKabPindah` |

---

## 🔧 Troubleshooting

### Error: Module not found

```bash
pip install python-docx
```

### Error: File not found

Check path:
```bash
# Windows
python extract_template_placeholders.py public\template\Template.docx

# Linux/Mac
python extract_template_placeholders.py public/template/Template.docx
```

### No placeholders found

1. Open template in Word
2. Ensure format is `{placeholder}` (curly braces)
3. No spaces: `{nama}` ✅ `{ nama }` ❌

---

## 📚 Full Documentation

For detailed guide, see: `documentation/TEMPLATE_EXTRACTOR_GUIDE.md`

---

## 🎓 Examples

### Example 1: New Template

```bash
# 1. Create new template in Word with placeholders
# 2. Save as NewTemplate.docx in public/template/
# 3. Extract placeholders
python extract_template_placeholders.py public/template/NewTemplate.docx

# 4. Open documentation
cat documentation/NEWTEMPLATE_PLACEHOLDERS.md

# 5. Copy interface and mapping to your code
```

### Example 2: Update Existing Template

```bash
# 1. Update template in Word
# 2. Re-extract
python extract_template_placeholders.py public/template/SKTM.docx

# 3. Compare changes
git diff documentation/SKTM_PLACEHOLDERS.md

# 4. Update code if placeholders changed
```

---

## ✅ Checklist

Before using extracted placeholders:

- [ ] Run extractor on template
- [ ] Review generated documentation
- [ ] Copy TypeScript interface
- [ ] Copy template data mapping
- [ ] Handle special characters (if any)
- [ ] Test with sample data
- [ ] Verify all placeholders filled in PDF

---

## 🚀 Pro Tips

1. **Run after every template change**
   ```bash
   python extract_template_placeholders.py public/template/Updated.docx
   ```

2. **Use git diff to see changes**
   ```bash
   git diff documentation/*_PLACEHOLDERS.md
   ```

3. **Keep documentation in sync**
   - Commit generated docs with code changes
   - Review docs in PR

4. **Validate placeholders**
   - Check all placeholders have corresponding form fields
   - Test with empty/missing data

---

## 📞 Support

- **Full Guide**: `documentation/TEMPLATE_EXTRACTOR_GUIDE.md`
- **Tool File**: `extract_template_placeholders.py`
- **Output**: `documentation/*_PLACEHOLDERS.md`

---

**Version**: 1.0.0
**Last Updated**: 2025-01-20
