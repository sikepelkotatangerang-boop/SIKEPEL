# Logo Setup Guide

## 📝 Overview

Aplikasi ini menggunakan logo custom untuk branding Kelurahan Cibodas. Logo ditampilkan di sidebar dan sebagai favicon browser.

## 🖼️ Logo Files Required

### 1. **logo_sikepel.png**
- **Location**: `public/logo_sikepel.png`
- **Usage**: Logo utama di sidebar
- **Specifications**:
  - Format: PNG (recommended with transparent background)
  - Minimum Size: 40x40 pixels
  - Recommended Size: 128x128 pixels atau lebih besar
  - Aspect Ratio: 1:1 (square)
  - Max File Size: < 100KB
  - Background: Transparent (recommended)

### 2. **logo_kota.png**
- **Location**: `public/logo_kota.png`
- **Usage**: Browser favicon
- **Specifications**:
  - Format: PNG
  - Size: 32x32px atau 64x64px
  - Aspect Ratio: 1:1 (square)
  - Max File Size: < 50KB

## 📁 File Structure

```
public/
├── logo_sikepel.png    ← Logo utama untuk sidebar
├── logo_kota.png       ← Favicon untuk browser
└── README.md           ← Dokumentasi assets
```

## 🚀 How to Add Logo

### Step 1: Prepare Logo Files
1. Siapkan file logo dengan spesifikasi di atas
2. Pastikan nama file sesuai: `logo_sikepel.png` dan `logo_kota.png`
3. Optimize file size (gunakan tools seperti TinyPNG)

### Step 2: Add to Public Folder
```bash
# Copy logo files ke folder public
cp /path/to/your/logo_sikepel.png public/
cp /path/to/your/logo_kota.png public/
```

### Step 3: Verify
1. Restart development server jika sedang running
2. Refresh browser
3. Logo akan muncul di sidebar

## 🎨 Implementation Details

### Sidebar Logo
Logo di sidebar menggunakan Next.js Image component dengan fitur:
- ✅ Automatic optimization
- ✅ Lazy loading (kecuali priority logo)
- ✅ Responsive images
- ✅ WebP conversion (automatic)
- ✅ Fallback to text logo "KC" jika image tidak ditemukan

**Code Location**: `src/components/layout/Sidebar.tsx`

```tsx
<Image
  src="/logo_sikepel.png"
  alt="Logo Sikepel"
  width={40}
  height={40}
  className="object-contain"
  priority
/>
```

### Fallback Behavior
Jika logo tidak ditemukan, aplikasi akan menampilkan fallback:
- Text logo "KC" dengan background primary-600
- Rounded square shape
- White text color

## 🔧 Customization

### Change Logo Size
Edit di `Sidebar.tsx`:
```tsx
// Change container size
<div className="w-10 h-10"> // Change to w-12 h-12 for larger

// Change image size
<Image width={40} height={40} /> // Change to width={48} height={48}
```

### Change Fallback Text
Edit di `Sidebar.tsx`:
```tsx
<span className="text-white font-bold text-xl">
  KC  // Change to your preferred text
</span>
```

### Remove Rounded Corners
Edit di `Sidebar.tsx`:
```tsx
<div className="rounded-lg"> // Remove or change to rounded-none
```

## 🎯 Best Practices

1. **Use SVG if possible** - Better quality at any size
2. **Optimize images** - Use TinyPNG or similar tools
3. **Transparent background** - For better integration
4. **High resolution** - Use 2x or 3x size for retina displays
5. **Consistent branding** - Use same logo across all platforms

## 🐛 Troubleshooting

### Logo tidak muncul
1. **Check file location**: Pastikan file ada di `public/logo_sikepel.png`
2. **Check file name**: Nama file harus exact match (case-sensitive)
3. **Restart server**: `npm run dev` untuk restart
4. **Clear cache**: Hard refresh browser (Ctrl+Shift+R)
5. **Check console**: Lihat error di browser console

### Logo terlalu besar/kecil
1. Edit `width` dan `height` di Image component
2. Edit container size `w-10 h-10`
3. Gunakan `object-contain` atau `object-cover` untuk fit

### Logo blur/pixelated
1. Gunakan image dengan resolusi lebih tinggi
2. Pastikan aspect ratio 1:1
3. Gunakan SVG format jika memungkinkan

## 📱 Responsive Behavior

Logo akan otomatis responsive:
- **Desktop**: Full size (40x40px)
- **Mobile**: Same size, tetap terlihat di sidebar
- **Retina displays**: Next.js otomatis serve 2x resolution

## 🔄 Update Logo

Untuk update logo:
1. Replace file di `public/logo_sikepel.png`
2. Clear browser cache
3. Restart development server
4. Logo baru akan muncul

## 📊 Performance

Next.js Image component memberikan:
- ✅ Automatic image optimization
- ✅ Lazy loading (except priority images)
- ✅ Responsive images
- ✅ Modern format (WebP, AVIF)
- ✅ Blur placeholder (optional)

## 🎨 Alternative: Using SVG

Untuk menggunakan SVG (recommended):

```tsx
// Change Image to img tag
<img
  src="/logo_sikepel.svg"
  alt="Logo Sikepel"
  className="w-10 h-10 object-contain"
/>
```

Benefits:
- ✅ Perfect quality at any size
- ✅ Smaller file size
- ✅ Scalable without quality loss
- ✅ Easy to customize colors

## 📝 Notes

- Logo saat ini menggunakan fallback "KC" jika image tidak ada
- Fallback otomatis hide saat logo berhasil dimuat
- Logo di-load dengan priority untuk performa optimal
- Background primary-600 untuk consistency dengan brand

---

**Status**: ✅ Configured  
**Last Updated**: 2025-10-07  
**Component**: Sidebar Logo
