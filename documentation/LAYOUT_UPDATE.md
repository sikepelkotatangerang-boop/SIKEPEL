# Layout Update - Sidebar Navigation

## ✅ Perubahan yang Dilakukan

Aplikasi sekarang menggunakan **Sidebar Navigation** untuk navigasi yang lebih modern dan user-friendly.

## 🎨 Komponen Baru

### 1. **Sidebar** (`src/components/layout/Sidebar.tsx`)

**Fitur:**
- ✅ Fixed sidebar di desktop (lg breakpoint)
- ✅ Slide-in sidebar di mobile/tablet
- ✅ Logo Kelurahan Cibodas
- ✅ Menu navigasi dengan icons
- ✅ Active state highlighting
- ✅ Footer dengan info aplikasi
- ✅ Smooth animations
- ✅ Overlay backdrop di mobile

**Menu Items:**
- 🏠 Dashboard
- 📄 Surat Masuk
- 📤 Surat Keluar
- 👥 Pengguna

### 2. **Navbar** (Updated)

**Fitur:**
- ✅ Hamburger menu button (mobile)
- ✅ Title aplikasi
- ✅ Notification bell dengan badge
- ✅ User info (avatar, nama, role)
- ✅ Logout button
- ✅ Responsive design

### 3. **DashboardLayout** (Updated)

**Fitur:**
- ✅ Sidebar state management
- ✅ Responsive layout
- ✅ Auto-close sidebar di mobile setelah klik menu
- ✅ Proper spacing dan padding

## 📱 Responsive Behavior

### Desktop (≥1024px)
- Sidebar: **Fixed** di sebelah kiri (width: 256px)
- Navbar: Sticky di atas
- Content: Margin left 256px untuk sidebar

### Tablet & Mobile (<1024px)
- Sidebar: **Hidden** by default
- Hamburger menu: Visible di navbar
- Sidebar: Slide dari kiri saat dibuka
- Overlay: Dark backdrop saat sidebar terbuka
- Auto-close: Sidebar tertutup setelah klik menu

## 🎯 Cara Menggunakan

Layout otomatis diterapkan ke semua halaman yang menggunakan `DashboardLayout`:

```tsx
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MyPage() {
  return (
    <DashboardLayout>
      {/* Your page content */}
    </DashboardLayout>
  );
}
```

## 🔧 Customization

### Mengubah Menu Items

Edit file `src/components/layout/Sidebar.tsx`:

```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Surat Masuk', href: '/surat-masuk', icon: FileText },
  // Tambah menu baru di sini
];
```

### Mengubah Warna Sidebar

Edit di `Sidebar.tsx`:

```tsx
// Background sidebar
className="bg-white" // Ganti dengan bg-gray-900 untuk dark mode

// Active menu
className="bg-primary-50 text-primary-700" // Customize sesuai kebutuhan
```

### Mengubah Lebar Sidebar

1. Edit `Sidebar.tsx`:
```tsx
className="w-64" // Ganti dengan w-72 atau w-80
```

2. Edit `DashboardLayout.tsx`:
```tsx
className="lg:pl-64" // Sesuaikan dengan lebar sidebar
```

## 🎨 Design Features

### Sidebar
- **Width**: 256px (16rem)
- **Background**: White
- **Border**: Right border gray-200
- **Logo**: Primary-600 rounded square
- **Active menu**: Primary-50 background
- **Hover**: Gray-100 background
- **Footer**: Primary-50 info box

### Navbar
- **Height**: 64px (4rem)
- **Background**: White
- **Border**: Bottom border gray-200
- **Position**: Sticky top
- **Z-index**: 30

### Icons
- **Library**: Lucide React
- **Size**: 20px (w-5 h-5)
- **Color**: Matches text color

## 📊 Layout Structure

```
┌─────────────────────────────────────────┐
│ Sidebar (Fixed)  │  Navbar (Sticky)     │
│                  ├──────────────────────┤
│  • Dashboard     │                      │
│  • Surat Masuk   │  Main Content Area   │
│  • Surat Keluar  │                      │
│  • Pengguna      │                      │
│                  │                      │
│  [Footer Info]   │                      │
└─────────────────────────────────────────┘
```

## 🚀 Benefits

1. **Better UX**: Menu selalu terlihat di desktop
2. **More Space**: Content area lebih luas
3. **Modern Look**: Sidebar navigation adalah standard modern
4. **Easy Navigation**: Akses cepat ke semua menu
5. **Mobile Friendly**: Slide-in menu di mobile
6. **Consistent**: Layout konsisten di semua halaman

## 🔄 Migration dari Old Layout

Tidak perlu migration! Semua halaman yang sudah menggunakan `DashboardLayout` otomatis mendapat sidebar baru.

### Before
```tsx
// Old: Navbar di atas dengan menu horizontal
<Navbar /> 
```

### After
```tsx
// New: Sidebar + Navbar
<Sidebar />
<Navbar />
```

## 💡 Tips

1. **Customize Icons**: Ganti icon di navigation array
2. **Add Submenu**: Bisa tambahkan nested menu jika diperlukan
3. **Dark Mode**: Tinggal ganti color scheme
4. **Collapse Sidebar**: Bisa tambahkan fitur collapse untuk desktop
5. **User Menu**: Bisa tambahkan dropdown menu di user avatar

## 📝 Files Modified

1. ✅ `src/components/layout/Sidebar.tsx` - **NEW**
2. ✅ `src/components/layout/Navbar.tsx` - **UPDATED**
3. ✅ `src/components/layout/DashboardLayout.tsx` - **UPDATED**

## 🎯 Next Steps (Optional)

- [ ] Add submenu support
- [ ] Add sidebar collapse/expand
- [ ] Add user dropdown menu
- [ ] Add breadcrumbs
- [ ] Add search in sidebar
- [ ] Add keyboard shortcuts
- [ ] Add dark mode toggle

---

**Status:** ✅ **ACTIVE**  
**Last Updated:** 2025-10-07  
**Version:** 2.0.0
