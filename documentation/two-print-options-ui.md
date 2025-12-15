# Two Print Options UI - Preview Page

## 🎯 Overview

Halaman preview sekarang memiliki 2 opsi cetak yang jelas untuk user:
1. **Cetak Preview** - Puppeteer (cepat, tidak disimpan)
2. **Cetak & Selesai** - ConvertAPI (final, disimpan)

---

## 🎨 UI Design

### Layout:
```
┌─────────────────────────────────────────────────────┐
│  Verifikasi Data                    [Edit Data]     │
├─────────────────────────────────────────────────────┤
│  Pilih Opsi Cetak:                                  │
│                                                     │
│  ┌──────────────────────┬──────────────────────┐   │
│  │  📄 Cetak Preview    │  ✅ Cetak & Selesai  │   │
│  │  (Puppeteer)         │  (ConvertAPI)        │   │
│  │                      │                      │   │
│  │  • Cepat (2-3s)      │  • Kualitas tinggi   │   │
│  │  • Tidak disimpan    │  • Disimpan ke DB    │   │
│  │  • Gratis            │  • Dokumen resmi     │   │
│  │                      │                      │   │
│  │  [Cetak Preview]     │  [Cetak & Selesai]   │   │
│  └──────────────────────┴──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Option Details

### Option 1: Cetak Preview

**Visual:**
- 🎨 Border: Gray (hover: Blue)
- 🎨 Icon: Blue Eye
- 🎨 Background: White

**Features:**
- ✅ Menggunakan Puppeteer
- ✅ Proses cepat (2-3 detik)
- ✅ Tidak ada biaya API
- ✅ Tidak disimpan ke database
- ✅ Tetap di halaman preview
- ✅ Bisa dicetak berkali-kali

**Use Case:**
- Verifikasi tampilan PDF
- Cek formatting
- Testing
- Belum yakin dengan data

---

### Option 2: Cetak & Selesai

**Visual:**
- 🎨 Border: Green
- 🎨 Icon: Green Download
- 🎨 Background: Light Green
- 🎨 Button: Green (prominent)

**Features:**
- ✅ Menggunakan ConvertAPI
- ✅ Kualitas tinggi
- ✅ Disimpan ke database
- ✅ Disimpan ke Supabase Storage
- ✅ Dokumen resmi
- ✅ Muncul di Daftar Surat

**Use Case:**
- Data sudah benar
- Siap untuk dokumen resmi
- Perlu disimpan permanen
- Production use

---

## 🔄 User Flow

```
User fills form
    ↓
Preview HTML
    ↓
User sees 2 options:
    ↓
┌─────────────────────────────────────┐
│  Option 1: Cetak Preview            │
│  ↓                                   │
│  Generate PDF (Puppeteer)           │
│  ↓                                   │
│  Open in new tab                    │
│  ↓                                   │
│  NOT saved to database              │
│  ↓                                   │
│  User stays on preview page         │
│  ↓                                   │
│  Can click again or choose Option 2 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Option 2: Cetak & Selesai          │
│  ↓                                   │
│  Generate DOCX                      │
│  ↓                                   │
│  Convert to PDF (ConvertAPI)        │
│  ↓                                   │
│  Upload to Supabase Storage         │
│  ↓                                   │
│  Save to database                   │
│  ↓                                   │
│  Download PDF                       │
│  ↓                                   │
│  Redirect to Daftar Surat           │
└─────────────────────────────────────┘
```

---

## 💻 Implementation

### File: `src/app/preview-sktm/page.tsx`

#### 1. Two Option Cards:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Option 1: Cetak Preview */}
  <div className="border-2 border-gray-200 rounded-lg p-4">
    <h5>Cetak Preview</h5>
    <p>Lihat hasil PDF sementara tanpa menyimpan</p>
    <ul>
      <li>• Menggunakan Puppeteer (cepat)</li>
      <li>• Tidak disimpan ke database</li>
      <li>• Tetap di halaman preview</li>
    </ul>
    <Button onClick={handlePreviewPDF}>
      Cetak Preview
    </Button>
  </div>

  {/* Option 2: Cetak & Selesai */}
  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
    <h5>Cetak & Selesai</h5>
    <p>Generate PDF final dan simpan ke database</p>
    <ul>
      <li>• Menggunakan ConvertAPI (kualitas tinggi)</li>
      <li>• Disimpan ke database</li>
      <li>• Dokumen resmi</li>
    </ul>
    <Button onClick={handleProcess}>
      Cetak & Selesai
    </Button>
  </div>
</div>
```

#### 2. Info Box:
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <h4>ℹ️ Perbedaan Opsi Cetak</h4>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p>📄 Cetak Preview:</p>
      <ul>
        <li>• Untuk verifikasi tampilan PDF</li>
        <li>• Proses cepat (2-3 detik)</li>
        <li>• Tidak ada biaya API</li>
        <li>• Bisa dicetak berkali-kali</li>
      </ul>
    </div>
    <div>
      <p>✅ Cetak & Selesai:</p>
      <ul>
        <li>• Dokumen resmi final</li>
        <li>• Kualitas tinggi</li>
        <li>• Tersimpan di database</li>
        <li>• Muncul di Daftar Surat</li>
      </ul>
    </div>
  </div>
</div>
```

---

## 🎨 Visual Hierarchy

### Priority Indicators:

1. **Green Background** - Option 2 (Cetak & Selesai)
   - Most important action
   - Final step
   - Prominent color

2. **White Background** - Option 1 (Cetak Preview)
   - Secondary action
   - Optional step
   - Neutral color

3. **Button Colors:**
   - Preview: Outline (gray)
   - Final: Solid green

---

## 📊 Comparison Table

| Aspect | Cetak Preview | Cetak & Selesai |
|--------|---------------|-----------------|
| **Tool** | Puppeteer | ConvertAPI |
| **Speed** | 2-3s | 5-7s |
| **Cost** | Free | $0.0066 |
| **Quality** | Excellent | Excellent |
| **Saved** | No | Yes |
| **Database** | No | Yes |
| **Storage** | No | Yes |
| **Use Case** | Verification | Production |
| **Repeatable** | Yes | No (creates new) |

---

## 🧪 Testing

### Test 1: Cetak Preview
```bash
npm run dev
```
1. Buka `/form-surat/sktm`
2. Isi form → Preview
3. Klik "Cetak Preview"
4. **Verify:** PDF opens in new tab (2-3s)
5. **Verify:** Still on preview page
6. **Verify:** Can click again
7. **Verify:** NOT in database

### Test 2: Cetak & Selesai
1. On preview page
2. Klik "Cetak & Selesai"
3. **Verify:** PDF downloads (5-7s)
4. **Verify:** Redirects to /daftar-surat
5. **Verify:** Document in database
6. **Verify:** Document in Supabase Storage

---

## 💡 UX Benefits

### Clear Choice:
- ✅ Two distinct options
- ✅ Visual differentiation
- ✅ Clear descriptions
- ✅ Feature comparison

### Flexibility:
- ✅ Preview multiple times
- ✅ Verify before saving
- ✅ No commitment until final

### Guidance:
- ✅ Info box explains differences
- ✅ Icons indicate purpose
- ✅ Colors show priority

---

## 🎯 User Decision Tree

```
User on preview page
    ↓
Question: "Is data correct?"
    ↓
┌─────────────────────────────────────┐
│  Not sure?                          │
│  ↓                                   │
│  Click "Cetak Preview"              │
│  ↓                                   │
│  Verify PDF                         │
│  ↓                                   │
│  Still not sure? Click again        │
│  ↓                                   │
│  Need to edit? Click "Edit Data"    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Yes, data is correct!              │
│  ↓                                   │
│  Click "Cetak & Selesai"            │
│  ↓                                   │
│  Done! Document saved               │
└─────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Desktop (> 768px):
```
┌──────────────────────┬──────────────────────┐
│  Cetak Preview       │  Cetak & Selesai     │
│  (Side by side)      │  (Side by side)      │
└──────────────────────┴──────────────────────┘
```

### Mobile (< 768px):
```
┌──────────────────────┐
│  Cetak Preview       │
│  (Stacked)           │
├──────────────────────┤
│  Cetak & Selesai     │
│  (Stacked)           │
└──────────────────────┘
```

---

## 🔧 Customization

### Change Colors:
```tsx
// Option 1 - Blue theme
<div className="border-2 border-blue-200 hover:border-blue-400">
  <div className="bg-blue-50">
    <Eye className="text-blue-600" />
  </div>
</div>

// Option 2 - Green theme (current)
<div className="border-2 border-green-200 bg-green-50">
  <div className="bg-green-100">
    <Download className="text-green-600" />
  </div>
</div>
```

### Add Third Option:
```tsx
{/* Option 3: Save Draft */}
<div className="border-2 border-yellow-200">
  <h5>Simpan Draft</h5>
  <p>Simpan tanpa generate PDF</p>
  <Button onClick={handleSaveDraft}>
    Simpan Draft
  </Button>
</div>
```

---

## ✅ Checklist

- [x] Two clear options displayed
- [x] Visual differentiation (colors, icons)
- [x] Feature comparison shown
- [x] Info box with explanations
- [x] Responsive design
- [x] Proper button states (loading, disabled)
- [x] Clear call-to-action
- [x] User stays on page after preview
- [x] Redirect after final save

---

## 🎯 Result

**Before:**
```
[Edit Data] [Preview PDF] [Proses & Simpan]
```
- Unclear difference
- All buttons same level
- No guidance

**After:**
```
[Edit Data]

Pilih Opsi Cetak:
┌─────────────────┬─────────────────┐
│ Cetak Preview   │ Cetak & Selesai │
│ (Verification)  │ (Final)         │
└─────────────────┴─────────────────┘
```
- Clear choice
- Visual hierarchy
- Detailed explanations
- Better UX ✅

---

## 📚 Resources

- Preview API: `/api/preview-sktm-pdf` (Puppeteer)
- Final API: `/api/process-sktm` (ConvertAPI)
- Preview Page: `src/app/preview-sktm/page.tsx`

---

User sekarang memiliki pilihan yang jelas dan dapat memverifikasi PDF sebelum menyimpan! 🎉
