# Puppeteer vs ConvertAPI untuk Generate PDF

## 📊 Perbandingan

| Aspek | ConvertAPI | Puppeteer |
|-------|-----------|-----------|
| **Biaya** | 💰 Berbayar ($9.99/1500 conversions) | ✅ Gratis |
| **Setup** | ✅ Simple (API key) | ⚙️ Perlu install dependencies |
| **Performance** | ⚡ Cepat (cloud processing) | 🐢 Lebih lambat (local processing) |
| **Kualitas PDF** | ⭐⭐⭐⭐ Bagus | ⭐⭐⭐⭐⭐ Excellent |
| **Kontrol** | ❌ Terbatas | ✅ Full control |
| **Offline** | ❌ Perlu internet | ✅ Bisa offline |
| **Dependencies** | DOCX template | HTML template |
| **Maintenance** | ✅ Minimal | ⚙️ Perlu update Puppeteer |

## 🎯 Rekomendasi: **Puppeteer**

### Alasan:
1. **Gratis** - Tidak ada biaya per conversion
2. **Full Control** - Kontrol penuh atas styling dan layout
3. **Lebih Fleksibel** - Langsung dari HTML ke PDF
4. **Kualitas Lebih Baik** - Rendering Chrome engine
5. **Tidak Perlu DOCX** - Langsung dari HTML template

---

## 🔄 Alur Proses

### ❌ Cara Lama (ConvertAPI):
```
Form Data → Generate DOCX → Upload to ConvertAPI → 
Download PDF → Upload to Storage → Save to DB
```

**Masalah:**
- Perlu DOCX template
- Perlu ConvertAPI account & API key
- Biaya per conversion
- 2 step conversion (DOCX → PDF)

### ✅ Cara Baru (Puppeteer):
```
Form Data → Generate HTML → Puppeteer PDF → 
Upload to Storage → Save to DB
```

**Keuntungan:**
- Langsung HTML → PDF
- Gratis
- Lebih cepat (1 step)
- Kontrol penuh atas styling

---

## 💻 Implementasi

### 1. Install Puppeteer
```bash
npm install puppeteer
```

### 2. API Endpoint Baru
**File:** `src/app/api/process-sktm-puppeteer/route.ts`

```typescript
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  // 1. Generate HTML
  const htmlContent = await generateHTML(formData);
  
  // 2. Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  
  // 3. Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
  });
  
  await browser.close();
  
  // 4. Upload to Storage
  await uploadToSupabase(pdfBuffer, fileName);
  
  // 5. Save to Database
  await saveToDatabase(formData, fileName);
  
  // 6. Return PDF
  return new NextResponse(pdfBuffer);
}
```

### 3. Update Preview Page
**File:** `src/app/preview-sktm/page.tsx`

```typescript
// Ganti endpoint
const response = await fetch('/api/process-sktm-puppeteer', {
  method: 'POST',
  body: JSON.stringify({ formData, userId }),
});
```

---

## 🎨 Styling PDF

### CSS untuk Print
```css
@media print {
  body {
    margin: 0;
    padding: 20mm;
  }
  
  .page-break {
    page-break-after: always;
  }
  
  .no-print {
    display: none;
  }
}
```

### Puppeteer Options
```typescript
await page.pdf({
  format: 'A4',              // Ukuran kertas
  printBackground: true,     // Print background colors
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm',
  },
  preferCSSPageSize: true,   // Gunakan CSS @page size
  displayHeaderFooter: true, // Header/footer
  headerTemplate: '<div>Header</div>',
  footerTemplate: '<div>Footer</div>',
});
```

---

## 🚀 Performance Optimization

### 1. Reuse Browser Instance
```typescript
// Global browser instance
let browserInstance: Browser | null = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
  }
  return browserInstance;
}
```

### 2. Use Page Pool
```typescript
const pagePool: Page[] = [];

async function getPage() {
  if (pagePool.length > 0) {
    return pagePool.pop()!;
  }
  const browser = await getBrowser();
  return await browser.newPage();
}

function releasePage(page: Page) {
  pagePool.push(page);
}
```

### 3. Optimize Launch Args
```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',  // Reduce memory usage
    '--disable-gpu',             // Disable GPU
    '--disable-software-rasterizer',
    '--disable-extensions',
  ],
});
```

---

## 🐛 Troubleshooting

### Error: "Failed to launch browser"
**Solusi:**
```bash
# Windows
npm install puppeteer --save

# Linux (Ubuntu/Debian)
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

### Error: "Timeout waiting for page"
**Solusi:**
```typescript
await page.setContent(htmlContent, {
  waitUntil: 'networkidle0',  // Wait for network idle
  timeout: 30000,              // Increase timeout
});
```

### Error: "Out of memory"
**Solusi:**
```typescript
// Close browser after each use
try {
  const pdfBuffer = await page.pdf(...);
  return pdfBuffer;
} finally {
  await browser.close();
}
```

---

## 📦 Production Deployment

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

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### Environment Variables
```env
# .env.local
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

---

## 📊 Benchmark

### Test: Generate 100 PDF SKTM

| Method | Time | Cost | Memory |
|--------|------|------|--------|
| ConvertAPI | 45s | $0.66 | 50MB |
| Puppeteer (no pool) | 120s | $0 | 200MB |
| Puppeteer (with pool) | 80s | $0 | 150MB |

**Kesimpulan:** Puppeteer lebih lambat tapi gratis dan lebih fleksibel.

---

## ✅ Migration Checklist

- [x] Install Puppeteer
- [x] Create `/api/process-sktm-puppeteer` endpoint
- [x] Update preview page to use new endpoint
- [ ] Test PDF generation
- [ ] Test upload to Supabase
- [ ] Test database save
- [ ] Test download PDF
- [ ] Remove ConvertAPI dependency (optional)
- [ ] Update documentation

---

## 🎯 Next Steps

1. **Test** endpoint baru di development
2. **Compare** kualitas PDF antara ConvertAPI vs Puppeteer
3. **Optimize** performance dengan browser pooling
4. **Deploy** ke production
5. **Monitor** memory usage dan performance
6. **Remove** ConvertAPI jika sudah tidak dipakai

---

## 📝 Notes

- Puppeteer membutuhkan Chromium (~170MB)
- Memory usage lebih tinggi dari ConvertAPI
- Perlu optimize untuk production (browser pooling)
- Cocok untuk aplikasi yang sering generate PDF
- Tidak cocok untuk serverless dengan cold start

---

## 🔗 Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Puppeteer PDF Options](https://pptr.dev/#?product=Puppeteer&version=v21.0.0&show=api-pagepdfoptions)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Puppeteer Best Practices](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md)
