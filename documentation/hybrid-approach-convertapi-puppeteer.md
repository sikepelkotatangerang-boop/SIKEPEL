# Hybrid Approach: ConvertAPI + Puppeteer

## 🎯 Strategi

Menggunakan **ConvertAPI untuk production** dan **Puppeteer untuk preview** - best of both worlds!

---

## 📊 Pembagian Tugas

| Fungsi | Tool | Alasan |
|--------|------|--------|
| **Preview PDF** | Puppeteer | Gratis, cepat untuk preview |
| **Final PDF** | ConvertAPI | Kualitas tinggi, reliable |
| **Preview HTML** | HTML Template | Instant, no processing |

---

## 🔄 Flow Diagram

```
User fills form
      ↓
┌─────────────────────────────────────┐
│     Preview Page                    │
│  (HTML preview with logo)           │
└─────────────────────────────────────┘
      ↓
User has 3 options:
      ↓
┌─────────────────────────────────────┐
│  1. Edit Data                       │
│     → Back to form                  │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│  2. Preview PDF (Puppeteer)         │
│     → Generate PDF for preview      │
│     → Open in new tab               │
│     → NOT saved to database         │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│  3. Proses & Simpan (ConvertAPI)    │
│     → Generate DOCX                 │
│     → Convert to PDF (ConvertAPI)   │
│     → Upload to Supabase            │
│     → Save to database              │
│     → Download PDF                  │
└─────────────────────────────────────┘
```

---

## 🎨 Implementation

### 1. Preview HTML (Instant)
**Endpoint:** `/api/preview-sktm-html`
**Tool:** HTML Template
**Purpose:** Quick preview in browser

```typescript
// Generate HTML with logo
const htmlContent = generatePreviewHTML(formData);
return new NextResponse(htmlContent);
```

**Features:**
- ✅ Instant preview
- ✅ Logo kota embedded (base64)
- ✅ A4 size (210mm x 297mm)
- ✅ Responsive

---

### 2. Preview PDF (Puppeteer)
**Endpoint:** `/api/preview-sktm-pdf`
**Tool:** Puppeteer
**Purpose:** PDF preview before saving

```typescript
// Generate PDF with Puppeteer
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(htmlContent);
const pdf = await page.pdf({ format: 'A4' });
await browser.close();

// Return PDF (NOT saved)
return new NextResponse(pdf, {
  headers: {
    'Content-Disposition': 'inline; filename="preview.pdf"'
  }
});
```

**Features:**
- ✅ Gratis (no API cost)
- ✅ Quick preview
- ✅ NOT saved to database
- ✅ Opens in new tab

---

### 3. Final PDF (ConvertAPI)
**Endpoint:** `/api/process-sktm`
**Tool:** ConvertAPI
**Purpose:** Production-quality PDF

```typescript
// Generate DOCX
const docx = generateDOCX(formData);

// Convert to PDF with ConvertAPI
const convertapi = new ConvertAPI(apiKey);
const result = await convertapi.convert('pdf', { File: docxPath }, 'docx');

// Upload to Supabase
const { publicUrl } = await uploadToSupabase(pdfBuffer, fileName);

// Save to database
await db.query(insertQuery, values);

// Return PDF for download
return new NextResponse(pdfBuffer);
```

**Features:**
- ✅ High quality
- ✅ Reliable
- ✅ Saved to database
- ✅ Saved to Supabase Storage
- ✅ Downloaded to user

---

## 💰 Cost Analysis

### Scenario: 100 documents per month

| Action | Tool | Cost | Count | Total |
|--------|------|------|-------|-------|
| Preview HTML | HTML | $0 | 100 | $0 |
| Preview PDF | Puppeteer | $0 | 50 | $0 |
| Final PDF | ConvertAPI | $0.0066 | 100 | $0.66 |
| **Total** | | | | **$0.66/month** |

**Savings:** ~50% compared to using ConvertAPI for all previews!

---

## 🎯 User Experience

### Preview Flow:
```
1. User fills form
   ↓
2. Click "Preview" → See HTML preview (instant)
   ↓
3. Click "Preview PDF" → See PDF preview (2-3s, not saved)
   ↓
4. Click "Proses & Simpan" → Generate final PDF (5-7s, saved)
```

### Benefits:
- ✅ **Fast feedback** - HTML preview instant
- ✅ **Verify before save** - PDF preview without cost
- ✅ **High quality final** - ConvertAPI for production
- ✅ **Cost effective** - Only pay for final PDFs

---

## 🔧 Configuration

### Environment Variables:
```env
# ConvertAPI (for final PDF)
CONVERTAPI_SECRET=your_convertapi_secret

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Base URL (for API calls)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📁 File Structure

```
src/app/api/
├── preview-sktm-html/
│   └── route.ts          # HTML preview (instant)
├── preview-sktm-pdf/
│   └── route.ts          # PDF preview (Puppeteer, not saved)
└── process-sktm/
    └── route.ts          # Final PDF (ConvertAPI, saved)
```

---

## 🧪 Testing

### Test 1: HTML Preview
```bash
npm run dev
```
1. Buka `/form-surat/sktm`
2. Isi form → Preview
3. **Verify:** HTML preview muncul instant
4. **Verify:** Logo kota muncul

### Test 2: PDF Preview (Puppeteer)
1. Di halaman preview, klik "Preview PDF"
2. **Verify:** PDF opens in new tab (2-3s)
3. **Verify:** Logo kota muncul
4. **Verify:** NOT saved to database

### Test 3: Final PDF (ConvertAPI)
1. Klik "Proses & Simpan"
2. **Verify:** PDF downloads (5-7s)
3. **Verify:** Saved to Supabase Storage
4. **Verify:** Saved to database
5. **Verify:** Muncul di `/daftar-surat`

---

## 📊 Performance Comparison

| Action | Tool | Time | Quality | Cost | Saved |
|--------|------|------|---------|------|-------|
| HTML Preview | HTML | <100ms | Good | $0 | No |
| PDF Preview | Puppeteer | 2-3s | Excellent | $0 | No |
| Final PDF | ConvertAPI | 5-7s | Excellent | $0.0066 | Yes |

---

## 🎨 UI Changes

### Preview Page Buttons:

**Before:**
```
[Edit Data] [Proses & Simpan]
```

**After:**
```
[Edit Data] [Preview PDF] [Proses & Simpan]
```

### Button Functions:

1. **Edit Data** - Back to form
2. **Preview PDF** - Generate PDF with Puppeteer (not saved)
3. **Proses & Simpan** - Generate PDF with ConvertAPI (saved)

---

## 💡 Best Practices

### When to use Preview PDF:
- ✅ User wants to see exact PDF output
- ✅ User wants to verify formatting
- ✅ User is not sure about data yet
- ✅ Testing/development

### When to use Proses & Simpan:
- ✅ User is sure about data
- ✅ Ready to save to database
- ✅ Need official document
- ✅ Production use

---

## 🐛 Troubleshooting

### Preview PDF slow
**Cause:** Puppeteer launch time

**Solution:**
```typescript
// Reuse browser instance (advanced)
let browserInstance: Browser | null = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch();
  }
  return browserInstance;
}
```

### ConvertAPI fails
**Cause:** API key invalid or quota exceeded

**Solution:**
```bash
# Check API key
echo $CONVERTAPI_SECRET

# Check quota
curl https://v2.convertapi.com/user -u $CONVERTAPI_SECRET:
```

### Preview PDF different from final
**Cause:** Different rendering engines

**Solution:**
- Use same HTML template for both
- Use same CSS styles
- Test both outputs

---

## ✅ Advantages

| Aspect | Benefit |
|--------|---------|
| **Cost** | 50% savings on preview |
| **Speed** | Fast preview with Puppeteer |
| **Quality** | High quality final with ConvertAPI |
| **Flexibility** | Users can preview before saving |
| **UX** | Better user experience |

---

## 📝 Summary

### Hybrid Approach:
```
HTML Preview (instant, free)
    ↓
PDF Preview (Puppeteer, free, not saved)
    ↓
Final PDF (ConvertAPI, paid, saved)
```

### Benefits:
- ✅ **Cost effective** - Only pay for final PDFs
- ✅ **Fast preview** - Puppeteer for quick feedback
- ✅ **High quality** - ConvertAPI for production
- ✅ **Flexible** - Users can preview multiple times
- ✅ **Best of both worlds** - Combine strengths of both tools

---

## 🎯 Result

**Before:**
- Only ConvertAPI
- Every preview costs money
- Slow feedback loop

**After:**
- HTML + Puppeteer for preview (free)
- ConvertAPI for final (paid)
- Fast feedback, cost effective
- Better UX

**Savings:** ~50% on API costs! 💰✨
