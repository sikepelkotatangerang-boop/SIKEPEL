# Public Assets

## Logo Files

Letakkan file logo berikut di folder ini:

### Required Files:
1. **logo_sikepel.png** - Logo utama untuk sidebar (40x40px atau lebih besar)
2. **logo_kota.png** - Logo kota untuk favicon

### Recommended Specifications:

**logo_sikepel.png:**
- Format: PNG (dengan transparent background)
- Size: 40x40px minimum (bisa lebih besar, akan di-resize otomatis)
- Aspect Ratio: 1:1 (square)
- File size: < 50KB

**logo_kota.png:**
- Format: PNG
- Size: 32x32px atau 64x64px
- Untuk favicon di browser tab

## Usage

Logo akan otomatis dimuat oleh Next.js Image component dengan optimisasi:
- Lazy loading
- Responsive images
- Automatic format conversion (WebP)
- Priority loading untuk logo utama

## Current Implementation

Logo digunakan di:
- ✅ Sidebar header (`/logo_sikepel.png`)
- ✅ Browser favicon (`/logo_kota.png`)
