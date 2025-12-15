# Puppeteer Quick Start Guide

## 🚀 Setup

### 1. Install Dependencies
Puppeteer sudah terinstall di `package.json`:
```json
{
  "dependencies": {
    "puppeteer": "^24.23.0"
  }
}
```

Jika belum:
```bash
npm install puppeteer
```

### 2. Test Puppeteer
```bash
node scripts/test-puppeteer.js
```

Output yang diharapkan:
```
✅ Browser launched in 1500ms
✅ PDF generated in 300ms
✅ PDF size: 45.23 KB
✅ PDF saved to: test-output/test-puppeteer-xxx.pdf
```

---

## 📝 Implementasi

### API Endpoint: `/api/process-sktm-puppeteer`

**File:** `src/app/api/process-sktm-puppeteer/route.ts`

#### Flow:
```
1. Terima form data dari frontend
2. Generate HTML dari template
3. Launch Puppeteer browser
4. Convert HTML → PDF
5. Upload PDF ke Supabase Storage
6. Save metadata ke database
7. Return PDF untuk download
```

#### Code Structure:
```typescript
export async function POST(request: NextRequest) {
  let browser = null;
  
  try {
    // 1. Get form data
    const { formData, userId } = await request.json();
    
    // 2. Generate HTML
    const htmlResponse = await fetch('/api/preview-sktm-html', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    const htmlContent = await htmlResponse.text();
    
    // 3. Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    // 4. Generate PDF
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });
    
    const pdfBuffer = Buffer.from(pdfUint8Array);
    
    // 5. Close browser
    await browser.close();
    
    // 6. Upload to Supabase
    const { fileId, publicUrl } = await uploadToSupabase(
      pdfBuffer,
      fileName,
      'documents'
    );
    
    // 7. Save to database
    await db.query(insertQuery, values);
    
    // 8. Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
    
  } catch (error) {
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 🎨 HTML Template

### Styling untuk PDF
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .kop-surat {
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    .content {
      text-align: justify;
      margin: 20px 0;
    }
    
    .signature {
      margin-top: 50px;
      text-align: right;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    td {
      padding: 5px;
      vertical-align: top;
    }
    
    /* Print-specific styles */
    @media print {
      .no-print {
        display: none;
      }
      
      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Content here -->
</body>
</html>
```

---

## 🔧 Configuration

### Puppeteer Launch Options
```typescript
const browser = await puppeteer.launch({
  headless: true,                    // Run without UI
  args: [
    '--no-sandbox',                  // Required for Docker/Linux
    '--disable-setuid-sandbox',      // Required for Docker/Linux
    '--disable-dev-shm-usage',       // Reduce memory usage
    '--disable-gpu',                 // Disable GPU acceleration
    '--disable-software-rasterizer', // Disable software rasterizer
    '--disable-extensions',          // Disable extensions
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Custom Chrome path
});
```

### PDF Options
```typescript
const pdf = await page.pdf({
  format: 'A4',              // Paper size: A4, Letter, Legal
  printBackground: true,     // Print background colors/images
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm',
  },
  preferCSSPageSize: true,   // Use CSS @page size
  displayHeaderFooter: false, // Show header/footer
  scale: 1,                  // Scale: 0.1 to 2
});
```

---

## 🧪 Testing

### 1. Test Puppeteer Installation
```bash
node scripts/test-puppeteer.js
```

### 2. Test API Endpoint
```bash
# Via curl
curl -X POST http://localhost:3000/api/process-sktm-puppeteer \
  -H "Content-Type: application/json" \
  -d '{"formData": {...}, "userId": 1}' \
  --output test.pdf
```

### 3. Test via UI
1. Buka `/form-surat/sktm`
2. Isi form lengkap
3. Klik "Preview"
4. Klik "Proses & Simpan"
5. PDF akan terdownload otomatis

---

## 📊 Performance

### Benchmark (Single PDF)
```
Browser launch: ~1500ms (first time)
Browser launch: ~500ms (subsequent)
HTML to PDF: ~300ms
Total: ~1800ms (first), ~800ms (subsequent)
```

### Memory Usage
```
Browser: ~150MB
PDF generation: ~50MB
Total: ~200MB per request
```

### Optimization Tips
1. **Reuse browser instance** - Jangan launch/close setiap request
2. **Use page pool** - Reuse pages untuk multiple PDFs
3. **Limit concurrent** - Max 3-5 concurrent PDF generations
4. **Add timeout** - Set timeout untuk prevent hanging

---

## 🐛 Troubleshooting

### Error: "Failed to launch browser"

**Windows:**
```bash
npm install puppeteer --save
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils
```

**Docker:**
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache chromium nss freetype harfbuzz
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Error: "Timeout waiting for page"
```typescript
await page.setContent(htmlContent, {
  waitUntil: 'networkidle0',
  timeout: 30000, // Increase timeout to 30s
});
```

### Error: "Out of memory"
```typescript
// Always close browser in finally block
try {
  const pdf = await page.pdf(...);
  return pdf;
} finally {
  if (browser) {
    await browser.close();
  }
}
```

---

## 🚀 Deployment

### Vercel
```json
// vercel.json
{
  "functions": {
    "api/process-sktm-puppeteer/route.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**Note:** Vercel memiliki Chromium built-in untuk Puppeteer.

### Docker
```dockerfile
FROM node:18-alpine

# Install Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY . .
RUN npm ci --only=production
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```env
# .env.local
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## ✅ Checklist

- [x] Puppeteer installed
- [x] Test script created
- [x] API endpoint created
- [x] Preview page updated
- [ ] Test PDF generation locally
- [ ] Test upload to Supabase
- [ ] Test database save
- [ ] Test download PDF
- [ ] Deploy to production
- [ ] Monitor performance

---

## 📚 Resources

- [Puppeteer Docs](https://pptr.dev/)
- [PDF Options](https://pptr.dev/#?product=Puppeteer&show=api-pagepdfoptions)
- [Troubleshooting](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md)
- [Best Practices](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md)

---

## 🎯 Next Steps

1. **Test locally:**
   ```bash
   npm run dev
   node scripts/test-puppeteer.js
   ```

2. **Create SKTM via UI:**
   - Buka `/form-surat/sktm`
   - Isi form
   - Preview & Simpan

3. **Verify:**
   - PDF terdownload
   - File tersimpan di Supabase
   - Data tersimpan di database
   - Muncul di `/daftar-surat`

4. **Optimize:**
   - Implement browser pooling
   - Add caching
   - Monitor memory usage

5. **Deploy:**
   - Test di staging
   - Deploy ke production
   - Monitor performance
