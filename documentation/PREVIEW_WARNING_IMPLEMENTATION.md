# Preview Warning Implementation - SKTM

**Date**: October 20, 2025  
**Purpose**: Menambahkan peringatan yang jelas bahwa tampilan preview HTML berbeda dengan PDF final

## Problem Statement

User mungkin bingung karena tampilan preview HTML di browser berbeda dengan PDF final yang dihasilkan dari template DOCX. Preview HTML hanya untuk verifikasi data, bukan untuk melihat tampilan akhir dokumen.

## Solution

~~Menambahkan **3 tingkat peringatan** di halaman preview untuk memastikan user memahami perbedaan:~~

**UPDATE (Oct 20, 2025)**: Berdasarkan feedback user, warning banner utama dihapus karena terlalu mencolok. Hanya menggunakan **1 tingkat peringatan** yang lebih subtle.

### ~~1. Peringatan Utama (Warning Banner)~~ [REMOVED]

~~**Lokasi**: Di bagian atas halaman, sebelum action buttons~~

**Status**: ❌ DIHAPUS - Terlalu mencolok dan mengganggu UX

**Alasan penghapusan**: User merasa warning banner terlalu besar dan mengganggu fokus pada preview dokumen.

### 1. Header Preview (Above iframe) [ACTIVE]

**Lokasi**: Tepat di atas iframe preview

**Fitur**:
- Background gradient kuning-orange
- Border bottom kuning tebal
- Icon mata (👁️)
- Badge "BUKAN TAMPILAN PDF FINAL"

**Pesan**:
```
Preview HTML - Hanya untuk Verifikasi Data
Tampilan ini berbeda dengan PDF final. Periksa kebenaran DATA, bukan tampilan visual.
```

### 2. Info Box (Existing - Enhanced)

**Lokasi**: Di bagian bawah halaman

**Fitur**:
- Tetap ada info box yang menjelaskan perbedaan opsi cetak
- Memberikan konteks tambahan tentang Cetak Preview vs Cetak & Selesai

## Visual Hierarchy (Updated)

```
┌─────────────────────────────────────────────┐
│  Header: "Preview Dokumen SKTM"            │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  Verifikasi Data + Action Buttons          │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  Pilih Opsi Cetak (2 cards)                │
│  - Cetak Preview (Puppeteer)               │
│  - Cetak & Selesai (ConvertAPI)            │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  👁️ HEADER PREVIEW (Orange gradient)      │
│  "Preview HTML - Hanya untuk Verifikasi"   │
│  Badge: "BUKAN TAMPILAN PDF FINAL"         │
├─────────────────────────────────────────────┤
│                                             │
│  [IFRAME - Preview HTML]                   │
│                                             │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  ℹ️ Info Box - Perbedaan Opsi Cetak       │
└─────────────────────────────────────────────┘
```

**Changes from original design:**
- ❌ Removed: Large yellow warning banner at top
- ✅ Kept: Subtle header above iframe with badge
- ✅ Kept: Info box at bottom

## Color Scheme

- **Warning Banner**: Yellow-50 background, Yellow-400 border
- **Header Preview**: Yellow-100 to Orange-100 gradient, Yellow-400 border
- **Badge**: Orange-200 background, Orange-700 text
- **Icons**: Yellow-600 (warning), Gray-900 (text)

## User Flow (Updated)

1. **User mengisi form** → Klik "Preview Dokumen"
2. **Melihat header preview** → Subtle reminder bahwa preview ≠ PDF final
3. **Verifikasi DATA** → Cek nama, NIK, alamat, dll (bukan tampilan)
4. **Pilih opsi**:
   - Jika ingin lihat PDF sebenarnya → "Cetak Preview"
   - Jika data sudah benar → "Cetak & Selesai"

## Benefits (Updated)

1. **Clean UX**: Tidak ada warning banner yang mengganggu
2. **Subtle Reminder**: Header preview memberikan informasi tanpa mencolok
3. **Fokus pada Data**: User fokus verifikasi data, bukan tampilan
4. **Clear Call-to-Action**: User tahu harus gunakan "Cetak Preview" untuk lihat PDF sebenarnya
5. **Professional Look**: Interface yang bersih dan tidak overwhelming

## Technical Implementation

**File Modified**: `src/app/preview-sktm/page.tsx`

**Changes (Latest)**:
1. ~~Added warning banner section~~ → **REMOVED** (Oct 20, 2025)
2. Added preview header with badge (above iframe) → **KEPT**
3. Maintained existing info box for context → **KEPT**

**Reason for Removal**: User feedback indicated that large warning banner was too intrusive and distracted from the main preview content.

**Current Implementation**: Only subtle header above iframe with badge remains as reminder.

**No Breaking Changes**: Semua fungsi existing tetap berfungsi normal

## Testing Checklist (Updated)

- [x] ~~Warning banner muncul dengan benar~~ → REMOVED
- [x] Header preview muncul di atas iframe
- [x] Badge "BUKAN TAMPILAN PDF FINAL" terlihat di desktop
- [x] Responsive di mobile (badge hidden di mobile)
- [x] Warna dan styling sesuai design
- [x] Text readable dan jelas
- [x] Tidak mengganggu fungsi existing
- [x] Preview HTML tetap berfungsi
- [x] Tombol "Cetak Preview" dan "Cetak & Selesai" tetap berfungsi
- [x] Interface lebih bersih tanpa warning banner besar

## Future Improvements

1. Tambahkan tooltip hover untuk penjelasan lebih detail
2. Tambahkan video tutorial singkat tentang perbedaan preview vs PDF
3. Implementasikan pattern yang sama untuk form lain (SKU, Belum Rumah, dll)
4. Pertimbangkan menambahkan comparison screenshot (preview vs PDF)

## Related Documentation

- Form SKTM: `src/app/form-surat/sktm/page.tsx`
- API Preview HTML: `src/app/api/preview-sktm-html/route.ts`
- API Process SKTM: `src/app/api/process-sktm/route.ts`

---

**Status**: ✅ Implemented  
**Next Steps**: Test dengan user dan gather feedback
