# Notification System

## 🔔 Overview

Sistem notifikasi lengkap untuk mengirim notifikasi dari admin ke semua pengguna atau staff tertentu, dengan notification bell di header.

## ✨ Features

### 1. Halaman Kirim Notifikasi (`/notifikasi`) - Admin Only

#### Create Notification
- **Tipe Notifikasi**: Info, Success, Warning, Error
- **Judul**: Judul notifikasi
- **Pesan**: Isi pesan notifikasi
- **Penerima**:
  - Semua Pengguna
  - Semua Staff
  - Pilih Pengguna Tertentu (checkbox selection)

#### Dashboard Stats
- Total Pengguna
- Staff Aktif
- Notifikasi Terkirim

#### Instructions Card
- Panduan cara menggunakan sistem notifikasi

### 2. Notification Bell (Header)

#### Bell Icon
- Tampil di Navbar untuk semua user
- Red dot badge jika ada unread notifications
- Click to toggle dropdown

#### Notification Dropdown
- Show 5 latest notifications
- Icon berdasarkan type (Info/Success/Warning/Error)
- Color-coded icons
- Timestamp (format: 12 Jan, 14:30)
- Highlight unread (blue background)
- "Lihat Semua Notifikasi" button
- Click outside to close

### 3. API Endpoints

#### POST /api/notifications
Create new notification

**Request:**
```json
{
  "type": "info",
  "title": "Pengumuman Penting",
  "message": "Sistem akan maintenance besok",
  "recipients": "all",
  "recipientIds": [],
  "createdBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "notification": {...},
  "message": "Notifikasi berhasil dikirim"
}
```

#### GET /api/notifications?userId=1
Get notifications for user

**Response:**
```json
{
  "success": true,
  "notifications": [...]
}
```

## 🎨 UI Components

### Notification Form Modal
```
┌─────────────────────────────────────┐
│ Buat Notifikasi Baru           [×]  │
├─────────────────────────────────────┤
│ Tipe Notifikasi: [Info ▼]          │
│ Judul: [________________]           │
│ Pesan: [________________]           │
│        [________________]           │
│ Penerima: [Semua Pengguna ▼]       │
│                                     │
│ Ringkasan: Notifikasi akan dikirim │
│ ke 8 pengguna                       │
│                                     │
│ [Kirim Notifikasi] [Batal]         │
└─────────────────────────────────────┘
```

### Notification Dropdown
```
┌─────────────────────────────────────┐
│ Notifikasi                     [×]  │
├─────────────────────────────────────┤
│ ✓ User Baru Terdaftar              │
│   Staff baru "Ahmad" ditambahkan    │
│   12 Jan, 14:30                     │
├─────────────────────────────────────┤
│ ℹ Dokumen Baru                      │
│   5 dokumen menunggu verifikasi     │
│   12 Jan, 10:15                     │
├─────────────────────────────────────┤
│        Lihat Semua Notifikasi       │
└─────────────────────────────────────┘
```

## 📊 Data Structure

### Notification Object
```typescript
interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipients: 'all' | 'staff' | 'specific';
  recipientIds?: number[];
  createdBy: number;
  createdAt: string;
  readBy: number[];
  read: boolean; // Per user
}
```

## 🔄 Workflow

### Send Notification (Admin)
```
1. Admin navigate to /notifikasi
   ↓
2. Click "Buat Notifikasi Baru"
   ↓
3. Fill form:
   - Select type
   - Enter title & message
   - Choose recipients
   ↓
4. Click "Kirim Notifikasi"
   ↓
5. POST /api/notifications
   ↓
6. Save to localStorage
   ↓
7. Success message
   ↓
8. Notification appears for recipients
```

### View Notification (User)
```
1. User sees red dot on bell icon
   ↓
2. Click bell icon
   ↓
3. Dropdown shows notifications
   ↓
4. Click notification (optional)
   ↓
5. Mark as read
   ↓
6. Red dot disappears when all read
```

## 🎯 Recipient Types

### All Users
- Notifikasi dikirim ke semua user terdaftar
- Count: Total users in database

### All Staff
- Notifikasi hanya ke user dengan role 'staff'
- Count: Total staff users

### Specific Users
- Admin pilih user tertentu via checkbox
- Show: Name, Email, Role
- Count: Selected users

## 🎨 Notification Types

### Info (Blue)
- Icon: Info circle
- Color: Blue (#3B82F6)
- Use: General information

### Success (Green)
- Icon: Check circle
- Color: Green (#10B981)
- Use: Success messages, confirmations

### Warning (Yellow)
- Icon: Alert triangle
- Color: Yellow (#F59E0B)
- Use: Warnings, reminders

### Error (Red)
- Icon: Alert triangle
- Color: Red (#EF4444)
- Use: Errors, critical alerts

## 💾 Data Storage

### Current Implementation
- **localStorage**: `userNotifications`
- Format: Array of Notification objects
- Persists across sessions

### Production Implementation
- **Database Table**: `notifications`
- **Columns**:
  - id, type, title, message
  - recipients, recipient_ids
  - created_by, created_at
  - read_by (JSON array)

## 🔒 Security

### Access Control
- **Create Notification**: Admin only
- **View Notifications**: All authenticated users
- **Middleware**: Protected routes

### Data Validation
- Required fields validation
- Type checking
- Recipient count validation

## 🧪 Testing

### Test 1: Send to All Users
```
1. Login as admin
2. Navigate to /notifikasi
3. Click "Buat Notifikasi Baru"
4. Fill form:
   - Type: Info
   - Title: "Test Notification"
   - Message: "This is a test"
   - Recipients: "Semua Pengguna"
5. Click "Kirim Notifikasi"
6. Expected: Success message, notification saved
```

### Test 2: Send to Specific Users
```
1. Select "Pilih Pengguna Tertentu"
2. Check 2-3 users
3. Verify count shows correct number
4. Send notification
5. Expected: Only selected users receive
```

### Test 3: View Notification
```
1. Login as staff (recipient)
2. Check bell icon has red dot
3. Click bell icon
4. Expected: Dropdown shows notification
5. Verify type, title, message, timestamp
```

### Test 4: Notification Dropdown
```
1. Click bell icon
2. Verify dropdown appears
3. Click outside dropdown
4. Expected: Dropdown closes
5. Click "Lihat Semua Notifikasi"
6. Expected: Navigate to /notifikasi page
```

## 📱 Responsive Design

### Desktop
- Full dropdown (320px width)
- Show 5 notifications
- Scrollable if more

### Mobile
- Adjusted dropdown width
- Touch-friendly buttons
- Optimized spacing

## 🚀 Future Enhancements

- [ ] Real-time notifications (WebSocket/SSE)
- [ ] Push notifications (Service Worker)
- [ ] Email notifications
- [ ] Mark as read functionality
- [ ] Delete notifications
- [ ] Notification preferences per user
- [ ] Notification history
- [ ] Search notifications
- [ ] Filter by type
- [ ] Pagination
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification analytics

## 📝 Files Modified/Created

```
src/app/
├── api/
│   └── notifications/
│       └── route.ts          ✅ NEW - API endpoints
├── notifikasi/
│   └── page.tsx              ✅ UPDATED - Send notifications

src/components/layout/
└── Navbar.tsx                ✅ UPDATED - Bell + dropdown
```

## ✅ Checklist

- [x] API endpoints created
- [x] Send notification form
- [x] Recipient selection (all/staff/specific)
- [x] Notification bell in header
- [x] Notification dropdown
- [x] Unread count badge
- [x] Type-based icons & colors
- [x] Timestamp display
- [x] Click outside to close
- [x] Navigate to full page
- [x] localStorage persistence
- [x] Admin-only access
- [x] Form validation
- [x] Success/error messages
- [x] Responsive design

---

**Status**: ✅ Notification System Complete
**Version**: 1.0.0
**Last Updated**: 2025-10-08
