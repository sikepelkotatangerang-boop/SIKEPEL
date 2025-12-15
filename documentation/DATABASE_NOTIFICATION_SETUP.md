# Database Notification Setup

## 🗄️ Database Schema

### Tables Created

#### 1. notifications
Stores notification data

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('info', 'success', 'warning', 'error')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  recipients VARCHAR(20) CHECK (recipients IN ('all', 'staff', 'specific')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. notification_recipients
Tracks read status per user

```sql
CREATE TABLE notification_recipients (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(notification_id, user_id)
);
```

## 🚀 Setup Instructions

### 1. Update Database Schema

**Di Supabase SQL Editor, jalankan:**

```sql
-- Copy dan paste isi file database/schema.sql yang sudah diupdate
-- Atau jalankan query berikut:

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  recipients VARCHAR(20) NOT NULL CHECK (recipients IN ('all', 'staff', 'specific')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: notification_recipients
CREATE TABLE IF NOT EXISTS notification_recipients (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(notification_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user ON notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_read ON notification_recipients(is_read);

-- Disable RLS (development only)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients DISABLE ROW LEVEL SECURITY;
```

### 2. Verify Tables Created

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_recipients');

-- Check structure
\d notifications
\d notification_recipients
```

## 📊 How It Works

### Send Notification Flow

```
1. Admin creates notification
   ↓
2. POST /api/notifications
   ↓
3. Insert into notifications table
   ↓
4. Determine recipients:
   - all: Get all active users
   - staff: Get all staff users
   - specific: Use selected user IDs
   ↓
5. Insert into notification_recipients
   (one row per recipient, is_read=false)
   ↓
6. Return success
```

### View Notification Flow

```
1. User opens app
   ↓
2. GET /api/notifications?userId=X
   ↓
3. Query:
   SELECT n.*, nr.is_read, nr.read_at
   FROM notifications n
   JOIN notification_recipients nr ON n.id = nr.notification_id
   WHERE nr.user_id = X
   ↓
4. Return notifications with read status
   ↓
5. Display in dropdown/page
```

### Mark as Read Flow

```
1. User clicks notification
   ↓
2. PUT /api/notifications?id=Y
   Body: { userId: X }
   ↓
3. UPDATE notification_recipients
   SET is_read = true, read_at = NOW()
   WHERE notification_id = Y AND user_id = X
   ↓
4. Return success
```

## 🔧 API Endpoints

### GET /api/notifications?userId=1&limit=10
Get notifications for user

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "info",
      "title": "Pengumuman",
      "message": "Sistem akan maintenance",
      "recipients": "all",
      "created_by": 1,
      "created_at": "2025-01-08T10:00:00Z",
      "is_read": false,
      "read_at": null
    }
  ],
  "unreadCount": 3
}
```

### POST /api/notifications
Create notification (admin only)

**Request:**
```json
{
  "type": "success",
  "title": "Selamat Datang",
  "message": "Sistem notifikasi aktif",
  "recipients": "all",
  "recipientIds": [],
  "createdBy": 1
}
```

### PUT /api/notifications?id=1
Mark as read

**Request:**
```json
{
  "userId": 2
}
```

### PUT /api/notifications?action=markAllRead
Mark all as read

**Request:**
```json
{
  "userId": 2
}
```

### DELETE /api/notifications?id=1
Delete notification (admin only)

## 📝 Model Methods

### NotificationModel.create()
```typescript
await NotificationModel.create({
  type: 'info',
  title: 'Test',
  message: 'Hello',
  recipients: 'all',
  created_by: 1,
  recipient_ids: []
});
```

### NotificationModel.getForUser()
```typescript
const notifications = await NotificationModel.getForUser(userId, 10);
```

### NotificationModel.getUnreadCount()
```typescript
const count = await NotificationModel.getUnreadCount(userId);
```

### NotificationModel.markAsRead()
```typescript
await NotificationModel.markAsRead(notificationId, userId);
```

### NotificationModel.markAllAsRead()
```typescript
await NotificationModel.markAllAsRead(userId);
```

## 🧪 Testing

### Test 1: Create Notification

```sql
-- Manual insert untuk testing
INSERT INTO notifications (type, title, message, recipients, created_by)
VALUES ('info', 'Test Notification', 'This is a test', 'all', 1);

-- Insert recipients (untuk user ID 2)
INSERT INTO notification_recipients (notification_id, user_id, is_read)
VALUES (1, 2, false);
```

### Test 2: Query User Notifications

```sql
SELECT 
  n.*,
  nr.is_read,
  nr.read_at
FROM notifications n
INNER JOIN notification_recipients nr ON n.id = nr.notification_id
WHERE nr.user_id = 2
ORDER BY n.created_at DESC;
```

### Test 3: Mark as Read

```sql
UPDATE notification_recipients
SET is_read = true, read_at = CURRENT_TIMESTAMP
WHERE notification_id = 1 AND user_id = 2;
```

### Test 4: Get Unread Count

```sql
SELECT COUNT(*) 
FROM notification_recipients
WHERE user_id = 2 AND is_read = false;
```

## 🔒 Security

### Row Level Security (Production)

```sql
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view their notifications"
ON notification_recipients
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Only admins can create notifications
CREATE POLICY "Admins can create notifications"
ON notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## 📊 Database Indexes

Indexes untuk performa optimal:

```sql
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_by ON notifications(created_by);
CREATE INDEX idx_notification_recipients_user ON notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_read ON notification_recipients(is_read);
```

## 🚀 Migration from localStorage

### Before (localStorage)
```typescript
const notifs = JSON.parse(localStorage.getItem('userNotifications') || '[]');
```

### After (Database)
```typescript
const response = await fetch(`/api/notifications?userId=${userId}`);
const { notifications } = await response.json();
```

## ✅ Checklist

- [x] Database schema created
- [x] Notification model implemented
- [x] API endpoints updated
- [x] Create notification with recipients
- [x] Get notifications for user
- [x] Mark as read functionality
- [x] Mark all as read
- [x] Delete notification
- [x] Unread count
- [x] Indexes for performance
- [x] Transaction support
- [x] Error handling

## 📁 Files Modified

```
database/
└── schema.sql                    ✅ Added notifications tables

src/lib/models/
└── notification.ts               ✅ NEW - Notification model

src/app/api/notifications/
└── route.ts                      ✅ UPDATED - Database integration
```

---

**Status**: ✅ Database Integration Complete
**Version**: 1.0.0
**Last Updated**: 2025-01-08

Notifikasi sekarang tersimpan di database dan bisa dilihat oleh semua pengguna yang menjadi penerima!
