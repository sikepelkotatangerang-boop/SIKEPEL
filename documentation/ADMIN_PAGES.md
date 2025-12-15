# Admin Pages - Settings & Notifikasi

## 🔐 Overview

Dua halaman khusus admin untuk mengelola pengaturan sistem dan notifikasi.

## 📄 Halaman Settings (`/settings`)

### Access Control
- **Admin Only** - Non-admin redirect ke `/dashboard`
- Protected by middleware

### Features

#### 1. Pengaturan Aplikasi
- **Nama Aplikasi** - Customize nama aplikasi
- **URL Aplikasi** - Base URL aplikasi
- **Max Upload Size** - Limit ukuran file upload (MB)
- **Session Timeout** - Durasi session (menit)

#### 2. Pengaturan Email (SMTP)
- **SMTP Host** - Server email (e.g., smtp.gmail.com)
- **SMTP Port** - Port SMTP (default: 587)
- **SMTP Username** - Email username
- **SMTP Password** - Email password (encrypted)
- **From Email** - Email pengirim default
- **From Name** - Nama pengirim default

#### 3. Pengaturan Notifikasi
- ☑️ **Email Notifications** - Enable/disable email notif
- ☑️ **New User Notification** - Notif user baru
- ☑️ **Document Notification** - Notif dokumen baru
- ☑️ **System Alerts** - Alert error & warning

#### 4. Informasi Keamanan
- 🔑 **Password Hashing** - bcrypt 10 rounds
- 🗄️ **Database** - Supabase PostgreSQL SSL
- 🛡️ **Authentication** - Cookie-based 7 days

### Data Storage
- **Current**: localStorage (development)
- **Production**: Database API endpoint

### UI Components
- Card sections untuk setiap kategori
- Input fields dengan labels
- Checkbox untuk toggle settings
- Save button dengan loading state
- Success/error messages

---

## 🔔 Halaman Notifikasi (`/notifikasi`)

### Access Control
- **Admin Only** - Non-admin redirect ke `/dashboard`
- Protected by middleware

### Features

#### 1. Notification Types
- **Info** (blue) - Informasi umum
- **Success** (green) - Aksi berhasil
- **Warning** (yellow) - Peringatan
- **Error** (red) - Error sistem

#### 2. Notification Management
- **View All** - Lihat semua notifikasi
- **Filter Unread** - Filter belum dibaca
- **Mark as Read** - Tandai dibaca (per item)
- **Mark All as Read** - Tandai semua dibaca
- **Delete** - Hapus notifikasi (per item)
- **Delete All Read** - Hapus semua yang sudah dibaca

#### 3. Notification Display
- Icon berdasarkan type
- Background color berdasarkan type & status
- Border kiri untuk unread notifications
- Timestamp relative (e.g., "2 jam yang lalu")
- Title & message
- Action buttons (read/delete)

#### 4. Sample Notifications
- User baru terdaftar
- Dokumen baru
- Backup database reminder
- Update sistem
- Error login attempts

### Data Storage
- **Current**: localStorage
- **Production**: Database dengan real-time updates

### UI Features
- Empty state untuk no notifications
- Filter tabs (All/Unread)
- Unread count badge
- Hover effects
- Smooth transitions
- Responsive design

---

## 🎨 UI/UX

### Settings Page
```
┌─────────────────────────────────────┐
│ Pengaturan Sistem                   │
│ Kelola konfigurasi aplikasi         │
├─────────────────────────────────────┤
│ ✅ Success Message (if any)         │
├─────────────────────────────────────┤
│ ⚙️ Pengaturan Aplikasi              │
│ - Nama Aplikasi                     │
│ - URL Aplikasi                      │
│ - Max Upload / Session Timeout      │
├─────────────────────────────────────┤
│ ✉️ Pengaturan Email (SMTP)          │
│ - SMTP Host / Port                  │
│ - Username / Password               │
│ - From Email / Name                 │
├─────────────────────────────────────┤
│ 🔔 Pengaturan Notifikasi            │
│ ☑ Email Notifications               │
│ ☑ New User Notification             │
│ ☑ Document Notification             │
│ ☑ System Alerts                     │
├─────────────────────────────────────┤
│ 🛡️ Informasi Keamanan               │
│ - Password Hashing                  │
│ - Database                          │
│ - Authentication                    │
├─────────────────────────────────────┤
│                  [Simpan Pengaturan]│
└─────────────────────────────────────┘
```

### Notifikasi Page
```
┌─────────────────────────────────────┐
│ Notifikasi                          │
│ 3 notifikasi belum dibaca           │
│           [Tandai Semua] [Hapus]    │
├─────────────────────────────────────┤
│ [Semua (5)] [Belum Dibaca (3)]      │
├─────────────────────────────────────┤
│ ✅ User Baru Terdaftar         [✓][×]│
│    Staff baru "Ahmad" ditambahkan   │
│    Baru saja                        │
├─────────────────────────────────────┤
│ ℹ️ Dokumen Baru                [✓][×]│
│    5 dokumen menunggu verifikasi    │
│    1 jam yang lalu                  │
├─────────────────────────────────────┤
│ ⚠️ Backup Database                [×]│
│    Backup terakhir 7 hari lalu      │
│    1 hari yang lalu                 │
└─────────────────────────────────────┘
```

---

## 🔧 Implementation

### Settings Page Structure
```typescript
interface AppSettings {
  appName: string;
  appUrl: string;
  maxUploadSize: string;
  sessionTimeout: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  newUserNotification: boolean;
  documentNotification: boolean;
  systemAlerts: boolean;
}
```

### Notification Structure
```typescript
interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
```

---

## 🧪 Testing

### Test Settings Page

**1. Access Control**
```
Login as staff → Navigate to /settings
Expected: Redirect to /dashboard
```

**2. Save Settings**
```
Login as admin → Navigate to /settings
Update app name → Click Save
Expected: Success message, data saved
```

**3. Toggle Notifications**
```
Toggle checkboxes → Click Save
Expected: Settings persisted
```

### Test Notifikasi Page

**1. Access Control**
```
Login as staff → Navigate to /notifikasi
Expected: Redirect to /dashboard
```

**2. Mark as Read**
```
Login as admin → Navigate to /notifikasi
Click ✓ on unread notification
Expected: Notification marked as read, styling changes
```

**3. Filter**
```
Click "Belum Dibaca" tab
Expected: Show only unread notifications
```

**4. Delete**
```
Click × on notification
Expected: Notification removed
```

---

## 📊 Sidebar Menu

Menu baru untuk admin:

```
Dashboard          (All users)
Pelayanan Admin    (Admin, Staff)
Daftar Surat       (Admin, Staff)
Surat Keluar       (Admin, Staff)
Surat Masuk        (Admin, Staff)
Statistik          (Admin, Staff)
────────────────
Pengguna           (Admin only) ⭐
Notifikasi         (Admin only) ⭐ NEW
Pengaturan         (Admin only) ⭐ NEW
```

---

## 🔒 Security

### Route Protection
- Middleware check authentication
- Client-side role check
- Auto redirect non-admin

### Data Security
- Passwords encrypted in localStorage
- SMTP credentials masked
- No sensitive data in URL

---

## 🚀 Future Enhancements

### Settings
- [ ] Database API for settings
- [ ] Email test function
- [ ] Backup/restore settings
- [ ] Theme customization
- [ ] Logo upload
- [ ] Multi-language support

### Notifikasi
- [ ] Real-time notifications
- [ ] Push notifications
- [ ] Email notifications
- [ ] Notification categories
- [ ] Search notifications
- [ ] Export notifications
- [ ] Notification preferences per user

---

## 📝 Files Created

```
src/app/
├── settings/
│   └── page.tsx          ✅ Settings page
├── notifikasi/
│   └── page.tsx          ✅ Notifikasi page

src/components/layout/
└── Sidebar.tsx           ✅ Updated menu

src/middleware.ts         ✅ Protected routes
```

---

## ✅ Checklist

- [x] Settings page created
- [x] Notifikasi page created
- [x] Admin-only access control
- [x] Sidebar menu updated
- [x] Middleware protection
- [x] localStorage persistence
- [x] UI/UX polished
- [x] Sample data provided
- [x] Empty states
- [x] Loading states
- [x] Error handling

---

**Status**: ✅ Admin Pages Complete
**Version**: 1.0.0
**Last Updated**: 2025-10-08
