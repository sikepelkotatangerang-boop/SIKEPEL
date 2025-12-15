# Setup ConvertAPI untuk Konversi PDF

## Tentang ConvertAPI

ConvertAPI adalah service online untuk konversi dokumen. Keuntungan menggunakan ConvertAPI:

✅ **Tidak perlu install software** - Semua konversi di cloud  
✅ **Mudah di-deploy** - Support semua platform (Vercel, Netlify, VPS)  
✅ **Free tier tersedia** - 250 konversi/bulan gratis  
✅ **Cepat dan reliable** - Infrastruktur cloud yang stabil  
✅ **Tidak perlu Chromium/LibreOffice** - Ringan dan simple  

## Cara Setup

### 1. Daftar ConvertAPI (Gratis)

1. Buka: https://www.convertapi.com/a/signup
2. Daftar dengan email Anda (gratis)
3. Verifikasi email
4. Login ke dashboard

### 2. Dapatkan API Secret

1. Setelah login, buka: https://www.convertapi.com/a/auth
2. Copy **Secret** Anda (format: `xxxxxxxxxxxxxx`)
3. Simpan secret ini dengan aman

### 3. Setup Environment Variable

Tambahkan ConvertAPI secret ke file `.env.local`:

```bash
# .env.local
CONVERTAPI_SECRET=your_secret_key_here
```

**PENTING:** Jangan commit `.env.local` ke Git!

### 4. Install Package

```bash
npm install convertapi
```

### 5. Restart Development Server

```bash
npm run dev
```

## Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Konversi per bulan | 250 |
| File size max | 50 MB |
| Concurrent requests | 1 |
| Support | Community |

**Catatan:** 250 konversi/bulan cukup untuk testing dan usage ringan. Untuk production dengan traffic tinggi, pertimbangkan upgrade ke paid plan.

## Cara Kerja

1. User submit form SKTM
2. API generate DOCX dari template
3. DOCX dikirim ke ConvertAPI
4. ConvertAPI convert DOCX → PDF
5. PDF dikembalikan ke user

## Pricing (Jika Perlu Upgrade)

Jika 250 konversi/bulan tidak cukup:

| Plan | Konversi/Bulan | Harga |
|------|----------------|-------|
| Free | 250 | $0 |
| Starter | 1,500 | $9/month |
| Professional | 10,000 | $49/month |
| Business | 50,000 | $199/month |

Lihat detail: https://www.convertapi.com/prices

## Monitoring Usage

Cek usage Anda di dashboard:
https://www.convertapi.com/a/usage

Dashboard menampilkan:
- Total konversi bulan ini
- Sisa quota
- History konversi
- Error logs

## Troubleshooting

### Error: "ConvertAPI configuration missing"

**Penyebab:** Environment variable `CONVERTAPI_SECRET` tidak ditemukan

**Solusi:**
1. Pastikan file `.env.local` ada di root project
2. Pastikan ada baris: `CONVERTAPI_SECRET=your_secret_key`
3. Restart development server

### Error: "Unauthorized" atau "Invalid secret"

**Penyebab:** API secret salah atau expired

**Solusi:**
1. Login ke https://www.convertapi.com/a/auth
2. Copy secret yang benar
3. Update `.env.local`
4. Restart server

### Error: "Quota exceeded"

**Penyebab:** Sudah mencapai limit 250 konversi/bulan

**Solusi:**
1. Tunggu bulan berikutnya (quota reset)
2. Atau upgrade ke paid plan
3. Atau gunakan akun lain untuk testing

### Error: "File too large"

**Penyebab:** File DOCX > 50MB

**Solusi:**
1. Optimize template DOCX
2. Kurangi ukuran gambar di template
3. Atau upgrade ke paid plan (limit lebih besar)

## Keamanan

### Jangan Expose API Secret

❌ **JANGAN:**
```typescript
// JANGAN hardcode secret di code
const convertapi = new ConvertAPI('your_secret_here');
```

✅ **LAKUKAN:**
```typescript
// Gunakan environment variable
const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);
```

### Environment Variables

- `.env.local` - Untuk development (tidak di-commit)
- `.env.production` - Untuk production (set di hosting platform)

### Vercel/Netlify

Set environment variable di dashboard:

**Vercel:**
1. Project Settings → Environment Variables
2. Add: `CONVERTAPI_SECRET` = `your_secret`

**Netlify:**
1. Site Settings → Build & Deploy → Environment
2. Add: `CONVERTAPI_SECRET` = `your_secret`

## Alternative (Jika Tidak Ingin Pakai ConvertAPI)

Jika tidak ingin menggunakan service online:

1. **LibreOffice** - Perlu install di server
2. **Puppeteer** - Perlu Chromium (~170MB)
3. **Pandoc** - Command line tool
4. **Microsoft Graph API** - Perlu Microsoft account

ConvertAPI adalah yang paling mudah dan reliable untuk production.

## Testing

Test konversi dengan curl:

```bash
curl -F "File=@document.docx" \
     -F "StoreFile=true" \
     https://v2.convertapi.com/convert/docx/to/pdf?Secret=YOUR_SECRET
```

## Support

- Documentation: https://www.convertapi.com/doc
- API Reference: https://www.convertapi.com/doc/node
- Support: support@convertapi.com

## Kesimpulan

ConvertAPI adalah solusi terbaik untuk konversi DOCX ke PDF karena:

1. ✅ Mudah setup (hanya perlu API key)
2. ✅ Tidak perlu install dependencies berat
3. ✅ Support semua platform hosting
4. ✅ Free tier cukup untuk testing
5. ✅ Reliable dan cepat
6. ✅ Maintenance minimal

Untuk aplikasi production dengan budget, ConvertAPI sangat recommended!
