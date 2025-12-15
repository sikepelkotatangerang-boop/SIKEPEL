# Template Placeholder Extractor - User Guide

## Overview

Tool Python untuk mengekstrak semua placeholder dari template DOCX dan menghasilkan dokumentasi lengkap serta code snippets TypeScript.

## Features

✅ **Universal** - Bekerja dengan template DOCX apapun
✅ **Comprehensive** - Extract dari paragraphs dan tables (termasuk nested tables)
✅ **Smart Detection** - Deteksi special characters dan duplicate placeholders
✅ **Auto Documentation** - Generate markdown documentation lengkap
✅ **TypeScript Ready** - Generate interface dan mapping code
✅ **Location Tracking** - Tahu dimana setiap placeholder berada
✅ **Usage Examples** - Include contoh implementasi

## Installation

### Requirements

```bash
pip install python-docx
```

### Verify Installation

```bash
python -c "import docx; print('✅ python-docx installed')"
```

## Usage

### Basic Usage

```bash
python extract_template_placeholders.py <path_to_template.docx>
```

### Examples

```bash
# Extract dari template SKTM
python extract_template_placeholders.py public/template/SKTM.docx

# Extract dari template F-103
python extract_template_placeholders.py public/template/F-103.docx

# Extract dari template SKU
python extract_template_placeholders.py public\template\SKU.docx

# Extract dari template custom
python extract_template_placeholders.py public/template/MyTemplate.docx
```

## Output

### 1. Console Output

Menampilkan daftar placeholder di console:

```
======================================================================
PLACEHOLDERS FROM F-103.docx
======================================================================

Total placeholders found: 31

 1. {alamat_asal}
 2. {alamat_pindah}
 3. {email_pemohon}
 ...
31. {tanggal_surat}

======================================================================
```

### 2. Markdown Documentation

File markdown lengkap disimpan di folder `documentation/`:

**Filename**: `{TEMPLATE_NAME}_PLACEHOLDERS.md`

**Contoh**: 
- `SKTM_PLACEHOLDERS.md`
- `F-103_PLACEHOLDERS.md`
- `SKU_PLACEHOLDERS.md`

**Isi Dokumentasi:**

1. **Placeholder List** - Daftar semua placeholder
2. **Placeholder Locations** - Lokasi setiap placeholder di dokumen
3. **TypeScript Interface** - Interface untuk form data
4. **Template Data Mapping** - Mapping code untuk Docxtemplater
5. **Usage Example** - Contoh implementasi lengkap
6. **Notes & Warnings** - Catatan penting dan special cases

## Documentation Structure

### 1. Placeholder List

```markdown
## Placeholder List

Total: **31** placeholders

1. `{alamat_asal}`
2. `{alamat_pindah}`
3. `{email_pemohon}`
...
```

### 2. Placeholder Locations

```markdown
## Placeholder Locations

### `{nama_pemohon}`

**Appears 2 times:**

- Table 1, Row 3, Cell 2
- Paragraph 15
```

### 3. TypeScript Interface

```typescript
interface F103FormData {
  alamatAsal: string;
  alamatPindah: string;
  emailPemohon: string;
  // ... all fields
}
```

### 4. Template Data Mapping

```typescript
const templateData = {
  alamat_asal: formData.alamat_asal || '',
  alamat_pindah: formData.alamat_pindah || '',
  email_pemohon: formData.email_pemohon || '',
  // ... all fields
};
```

### 5. Usage Example

Complete code example untuk menggunakan template dengan Docxtemplater.

## Features Detail

### 1. Smart Placeholder Detection

Mendukung berbagai format placeholder:

- ✅ `{simple_name}` - Standard
- ✅ `{name_with_underscore}` - Underscore
- ✅ `{kota/kab}` - Slash
- ✅ `{nama-panjang}` - Hyphen
- ✅ `{field.name}` - Dot notation

### 2. Location Tracking

Tahu persis dimana setiap placeholder berada:

- Paragraph number
- Table number
- Row and cell position
- Nested table location

### 3. Special Character Handling

Otomatis deteksi dan handle special characters:

```typescript
// Normal placeholder
nama_pemohon: formData.nama_pemohon || '',

// Special character (requires quotes)
'kota/kab_pindah': formData.kotaKabPindah || '',
```

### 4. Naming Convention

Auto-convert ke camelCase untuk TypeScript:

| Placeholder | TypeScript Field |
|-------------|------------------|
| `{nama_pemohon}` | `namaPemohon` |
| `{kota/kab_pindah}` | `kotaKabPindah` |
| `{no_hp_pemohon}` | `noHpPemohon` |

## Workflow

### Step 1: Extract Placeholders

```bash
python extract_template_placeholders.py public/template/NewTemplate.docx
```

### Step 2: Review Documentation

Buka file `documentation/NEWTEMPLATE_PLACEHOLDERS.md`

### Step 3: Create Form Interface

Copy TypeScript interface dari dokumentasi:

```typescript
interface NewTemplateFormData {
  field1: string;
  field2: string;
  // ... all fields from documentation
}
```

### Step 4: Implement API Route

Copy template data mapping dari dokumentasi:

```typescript
const templateData = {
  field1: formData.field1 || '',
  field2: formData.field2 || '',
  // ... all fields from documentation
};

doc.render(templateData);
```

### Step 5: Test

Pastikan semua placeholder terisi dengan benar di PDF output.

## Best Practices

### 1. Run Setiap Kali Template Berubah

```bash
# Template updated? Re-extract!
python extract_template_placeholders.py public/template/UpdatedTemplate.docx
```

### 2. Compare Dokumentasi

Gunakan git diff untuk melihat perubahan placeholder:

```bash
git diff documentation/TEMPLATE_PLACEHOLDERS.md
```

### 3. Update API Route

Setelah extract, update API route dengan placeholder baru.

### 4. Validate All Placeholders

Pastikan semua placeholder di dokumentasi ada di form data.

## Troubleshooting

### Error: Module 'docx' not found

```bash
pip install python-docx
```

### Error: File not found

Pastikan path ke template benar:

```bash
# Windows
python extract_template_placeholders.py public\template\Template.docx

# Linux/Mac
python extract_template_placeholders.py public/template/Template.docx
```

### No Placeholders Found

1. Buka template di Word
2. Pastikan menggunakan format `{placeholder}` dengan curly braces
3. Pastikan tidak ada spasi: `{nama}` ✅ `{ nama }` ❌

### Special Characters Not Working

Tool mendukung: `_`, `/`, `-`, `.`

Jika ada karakter lain, placeholder mungkin tidak terdeteksi.

## Advanced Usage

### Custom Output Directory

Edit script dan ubah `output_dir`:

```python
filepath = extractor.save_documentation(output_dir="custom/path")
```

### Programmatic Usage

```python
from extract_template_placeholders import PlaceholderExtractor

extractor = PlaceholderExtractor('path/to/template.docx')
extractor.extract_all()

placeholders = extractor.get_sorted_placeholders()
print(f"Found {len(placeholders)} placeholders")

# Generate docs
md_content = extractor.generate_markdown_doc()
```

## Examples

### Example 1: New Template

```bash
# 1. Extract
python extract_template_placeholders.py public/template/SuratKuasa.docx

# 2. Review
cat documentation/SURATKUASA_PLACEHOLDERS.md

# 3. Implement
# Copy interface and mapping from documentation
```

### Example 2: Updated Template

```bash
# 1. Re-extract
python extract_template_placeholders.py public/template/SKTM.docx

# 2. Compare
git diff documentation/SKTM_PLACEHOLDERS.md

# 3. Update code if placeholders changed
```

### Example 3: Batch Extract

```bash
# Extract all templates
for file in public/template/*.docx; do
    python extract_template_placeholders.py "$file"
done
```

## Integration with Development Workflow

### 1. Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
# Re-extract placeholders if template changed
git diff --cached --name-only | grep "public/template/.*\.docx$" | while read file; do
    python extract_template_placeholders.py "$file"
    git add documentation/*_PLACEHOLDERS.md
done
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/extract-placeholders.yml
name: Extract Template Placeholders
on:
  push:
    paths:
      - 'public/template/*.docx'
jobs:
  extract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: pip install python-docx
      - name: Extract placeholders
        run: |
          for file in public/template/*.docx; do
            python extract_template_placeholders.py "$file"
          done
      - name: Commit documentation
        run: |
          git add documentation/*_PLACEHOLDERS.md
          git commit -m "Update placeholder documentation"
          git push
```

## FAQ

**Q: Apakah tool ini bekerja dengan template .doc (bukan .docx)?**
A: Tidak, hanya mendukung format .docx (Office 2007+)

**Q: Apakah bisa extract dari PDF?**
A: Tidak, hanya dari DOCX. Convert PDF ke DOCX terlebih dahulu.

**Q: Bagaimana jika placeholder ada di header/footer?**
A: Saat ini belum support header/footer. Akan ditambahkan di versi berikutnya.

**Q: Apakah case-sensitive?**
A: Ya, `{Nama}` dan `{nama}` dianggap berbeda.

**Q: Bisa extract placeholder dengan format lain?**
A: Saat ini hanya `{placeholder}`. Format lain seperti `{{placeholder}}` atau `${placeholder}` tidak didukung.

## Support

Jika ada issue atau pertanyaan:
1. Check dokumentasi ini
2. Review generated markdown documentation
3. Check console output untuk error messages

## Version History

- **v1.0.0** (2025-01-20)
  - Initial release
  - Support paragraphs and tables
  - Generate TypeScript interface
  - Generate template data mapping
  - Location tracking
  - Special character handling

## Future Enhancements

- [ ] Support header/footer extraction
- [ ] Support multiple placeholder formats
- [ ] Generate React form components
- [ ] Validate placeholder naming conventions
- [ ] Export to JSON/YAML
- [ ] GUI version
- [ ] VS Code extension

---

**Created**: 2025-01-20
**Tool**: `extract_template_placeholders.py`
**Documentation**: Auto-generated in `documentation/` folder
