import zipfile
import re
from pathlib import Path

def extract_placeholders_from_docx(docx_path):
    """Extract all placeholders from DOCX template"""
    placeholders = set()
    
    with zipfile.ZipFile(docx_path, 'r') as zip_ref:
        # Read document.xml which contains the main content
        xml_content = zip_ref.read('word/document.xml').decode('utf-8')
        
        # Find all placeholders in format {placeholder_name}
        pattern = r'\{([^}]+)\}'
        matches = re.findall(pattern, xml_content)
        
        for match in matches:
            placeholders.add(match)
    
    return sorted(placeholders)

# Path to template
template_path = Path('public/template/KETERANGANBELUMMENIKAH.docx')

if template_path.exists():
    placeholders = extract_placeholders_from_docx(template_path)
    
    print("=" * 60)
    print("PLACEHOLDERS FROM KETERANGANBELUMMENIKAH.docx")
    print("=" * 60)
    print(f"\nTotal placeholders found: {len(placeholders)}\n")
    
    for i, placeholder in enumerate(placeholders, 1):
        print(f"{i:2d}. {{{placeholder}}}")
    
    print("\n" + "=" * 60)
    
    # Save to markdown file
    md_content = f"""# Surat Keterangan Belum Menikah - Placeholders

## 📋 Placeholders dari Template KETERANGANBELUMMENIKAH.docx

Total: **{len(placeholders)} placeholders**

"""
    
    # Group placeholders by category
    categories = {
        'Data Surat': [],
        'Data Pemohon': [],
        'Alamat': [],
        'Data Pejabat': []
    }
    
    for p in placeholders:
        if 'nomor' in p.lower() or 'tanggal_surat' in p.lower() or 'pengantar' in p.lower():
            categories['Data Surat'].append(p)
        elif 'pejabat' in p.lower() or 'jabatan' in p.lower() or 'nip' in p.lower():
            categories['Data Pejabat'].append(p)
        elif 'alamat' in p.lower() or 'kelurahan' in p.lower() or 'kecamatan' in p.lower() or 'kota' in p.lower() or 'rt' in p.lower() or 'rw' in p.lower():
            categories['Alamat'].append(p)
        else:
            categories['Data Pemohon'].append(p)
    
    for category, items in categories.items():
        if items:
            md_content += f"### {category}\n"
            for item in sorted(items):
                md_content += f"- `{{{item}}}` - {item.replace('_', ' ').title()}\n"
            md_content += "\n"
    
    md_content += """---

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
"""
    
    # Save to documentation folder
    output_path = Path('documentation/BELUM_MENIKAH_PLACEHOLDERS.md')
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text(md_content, encoding='utf-8')
    
    print(f"\n✅ Documentation saved to: {output_path}")
    
else:
    print(f"❌ Template not found: {template_path}")
