# Konfigurasi Ukuran A4 untuk Preview dan PDF

## ✅ Implementasi Selesai

Preview HTML dan PDF sekarang menggunakan ukuran kertas A4 yang konsisten.

---

## 📏 Ukuran Kertas A4

### Spesifikasi:
- **Width:** 210mm (8.27 inches)
- **Height:** 297mm (11.69 inches)
- **Margin:** 20mm (0.79 inches) pada semua sisi
- **Content Area:** 170mm x 257mm

### Konversi:
```
210mm = 21cm = 793.7px (at 96 DPI)
297mm = 29.7cm = 1122.5px (at 96 DPI)
```

---

## 🎨 CSS Configuration

### File: `src/app/api/preview-sktm-html/route.ts`

#### 1. Page Size Definition
```css
@page {
  size: A4;
  margin: 20mm;
}
```

#### 2. Preview Container
```css
.preview-container {
  /* A4 size: 210mm x 297mm */
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  padding: 20mm;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  position: relative;
}
```

#### 3. Print Media Query
```css
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
  
  body {
    background: white;
    padding: 0;
    margin: 0;
  }
  
  .preview-container {
    width: 100%;
    min-height: auto;
    box-shadow: none;
    padding: 0;
    margin: 0;
  }
}
```

---

## 🖨️ Puppeteer PDF Configuration

### File: `src/app/api/process-sktm-puppeteer/route.ts`

```typescript
const pdfUint8Array = await page.pdf({
  format: 'A4',              // Paper size
  printBackground: true,     // Print background colors/images
  preferCSSPageSize: false,  // Use format instead of CSS @page
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm',
  },
  scale: 1,                  // 100% scale
});
```

### Options Explained:

| Option | Value | Description |
|--------|-------|-------------|
| `format` | `'A4'` | Paper size (210mm x 297mm) |
| `printBackground` | `true` | Include background colors/images |
| `preferCSSPageSize` | `false` | Use `format` instead of CSS `@page` |
| `margin.top` | `'20mm'` | Top margin |
| `margin.right` | `'20mm'` | Right margin |
| `margin.bottom` | `'20mm'` | Bottom margin |
| `margin.left` | `'20mm'` | Left margin |
| `scale` | `1` | 100% scale (no zoom) |

---

## 📊 Layout Breakdown

```
┌─────────────────────────────────────────┐
│ ← 20mm margin                           │ ↑
│                                         │ 20mm
│   ┌─────────────────────────────────┐   │ ↓
│   │                                 │   │
│   │                                 │   │
│   │        Content Area             │   │
│   │        170mm x 257mm            │   │
│   │                                 │   │
│   │                                 │   │
│   │                                 │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│                           20mm margin → │
└─────────────────────────────────────────┘
        210mm (A4 Width)
```

---

## 🎯 Konsistensi Preview vs PDF

### Preview (Browser):
```css
width: 210mm;
min-height: 297mm;
padding: 20mm;
```

### PDF (Puppeteer):
```typescript
format: 'A4',  // 210mm x 297mm
margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
```

**Result:** Preview di browser akan terlihat **persis sama** dengan PDF yang di-generate! ✅

---

## 🧪 Testing

### Test 1: Preview Size
```bash
npm run dev
```
1. Buka `/form-surat/sktm`
2. Isi form → Preview
3. **Verify:** Container width = 210mm
4. **Verify:** Content area = 170mm (210mm - 40mm margin)

### Test 2: PDF Size
1. Klik "Proses & Simpan"
2. Download PDF
3. Buka di PDF reader
4. **Verify:** Page size = A4 (210mm x 297mm)
5. **Verify:** Margin = 20mm pada semua sisi

### Test 3: Print Preview
1. Di halaman preview, tekan `Ctrl+P` (Windows) atau `Cmd+P` (Mac)
2. **Verify:** Print preview shows A4 size
3. **Verify:** Content fits perfectly

---

## 📐 Measurement Tools

### Browser DevTools:
```javascript
// Check container size
const container = document.querySelector('.preview-container');
console.log('Width:', container.offsetWidth, 'px');
console.log('Height:', container.offsetHeight, 'px');

// Convert to mm (96 DPI)
const widthMM = (container.offsetWidth / 96) * 25.4;
const heightMM = (container.offsetHeight / 96) * 25.4;
console.log('Width:', widthMM.toFixed(2), 'mm');
console.log('Height:', heightMM.toFixed(2), 'mm');
```

### PDF Properties:
```
Right-click PDF → Properties → Description
Page Size: 8.27 x 11.69 in (210 x 297 mm)
```

---

## 🎨 Responsive Design

### Desktop (> 1024px):
```css
.preview-container {
  width: 210mm;  /* Full A4 width */
}
```

### Tablet (768px - 1024px):
```css
@media (max-width: 1024px) {
  .preview-container {
    width: 95%;  /* Fit screen */
    max-width: 210mm;
  }
}
```

### Mobile (< 768px):
```css
@media (max-width: 768px) {
  body {
    padding: 10px;
  }
  
  .preview-container {
    width: 100%;
    padding: 10mm;  /* Smaller padding */
  }
}
```

---

## 🔧 Customization

### Change Paper Size to Letter:
```typescript
// Puppeteer
const pdf = await page.pdf({
  format: 'Letter',  // 8.5" x 11" (215.9mm x 279.4mm)
  margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
});
```

```css
/* CSS */
@page {
  size: Letter;
  margin: 1in;
}

.preview-container {
  width: 215.9mm;
  min-height: 279.4mm;
  padding: 25.4mm; /* 1 inch */
}
```

### Change Margin:
```typescript
// Smaller margin (15mm)
margin: {
  top: '15mm',
  right: '15mm',
  bottom: '15mm',
  left: '15mm',
}
```

```css
.preview-container {
  padding: 15mm;
}
```

### Custom Size:
```typescript
// Custom size
width: '200mm',
height: '280mm',
```

```css
.preview-container {
  width: 200mm;
  min-height: 280mm;
}
```

---

## 📊 Size Comparison

| Format | Width | Height | Aspect Ratio |
|--------|-------|--------|--------------|
| **A4** | 210mm | 297mm | 1:1.414 |
| Letter | 215.9mm | 279.4mm | 1:1.294 |
| Legal | 215.9mm | 355.6mm | 1:1.647 |
| A3 | 297mm | 420mm | 1:1.414 |
| A5 | 148mm | 210mm | 1:1.414 |

---

## 🐛 Troubleshooting

### Preview tidak pas dengan PDF
**Penyebab:** CSS dan Puppeteer margin tidak sama

**Solusi:**
```typescript
// Pastikan margin sama
CSS: padding: 20mm;
Puppeteer: margin: { top: '20mm', ... }
```

### Content terpotong di PDF
**Penyebab:** Content lebih tinggi dari 297mm

**Solusi:**
```css
/* Allow multiple pages */
.preview-container {
  min-height: 297mm;  /* Not max-height */
}
```

### Font size berbeda
**Penyebab:** DPI rendering berbeda

**Solusi:**
```typescript
// Set viewport
await page.setViewport({
  width: 794,   // 210mm at 96 DPI
  height: 1123, // 297mm at 96 DPI
  deviceScaleFactor: 1,
});
```

---

## ✅ Checklist

- [x] CSS `@page` size set to A4
- [x] Preview container width = 210mm
- [x] Preview container min-height = 297mm
- [x] Preview container padding = 20mm
- [x] Puppeteer format = 'A4'
- [x] Puppeteer margin = 20mm all sides
- [x] Print media query configured
- [x] Scale = 1 (100%)
- [x] preferCSSPageSize = false

---

## 🎯 Result

**Before:**
- Preview: Flexible width (max-width: 21cm)
- PDF: A4 with 20mm margin
- **Issue:** Preview tidak persis sama dengan PDF

**After:**
- Preview: Fixed width 210mm, min-height 297mm
- PDF: A4 with 20mm margin
- **Result:** Preview **persis sama** dengan PDF! ✅

---

## 📚 Resources

- [CSS Paged Media](https://www.w3.org/TR/css-page-3/)
- [Puppeteer PDF Options](https://pptr.dev/#?product=Puppeteer&show=api-pagepdfoptions)
- [A4 Paper Size](https://www.papersizes.org/a-paper-sizes.htm)
- [Print CSS](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)

---

## 📝 Summary

| Aspect | Value |
|--------|-------|
| **Paper Size** | A4 (210mm x 297mm) |
| **Margin** | 20mm all sides |
| **Content Area** | 170mm x 257mm |
| **Preview Width** | 210mm (fixed) |
| **PDF Format** | A4 |
| **Scale** | 1 (100%) |
| **Consistency** | ✅ Perfect match |

Preview sekarang menggunakan ukuran A4 yang persis sama dengan PDF! 🎉
