# User Management - Admin Only

## 🔐 Overview

Halaman **Manajemen Pengguna** (`/pengguna`) adalah fitur khusus untuk admin yang digunakan untuk mengelola akun staff dan pengguna sistem.

## 🛡️ Access Control

- **Hanya Admin** yang bisa mengakses halaman ini
- Non-admin akan otomatis redirect ke `/dashboard`
- Middleware check di client-side

## ✨ Features

### 1. View All Users
- Tabel daftar semua pengguna
- Informasi: Nama, Email, Role, Status
- Real-time data dari database

### 2. Search & Filter
- **Search**: Cari berdasarkan nama atau email
- **Filter Role**: Filter by admin/staff/user
- Live filtering

### 3. Add New User
- Form tambah pengguna baru
- Fields:
  - Nama Lengkap
  - Email (unique)
  - Password
  - Role (admin/staff/user)
  - Kelurahan (untuk staff)
- Password auto-hashed dengan bcrypt

### 4. Edit User
- Update data pengguna
- Ubah password (optional)
- Ubah role & kelurahan
- Preserve existing password jika tidak diubah

### 5. Delete User
- Soft delete (set is_active = false)
- Confirmation dialog
- Cannot delete self

## 📋 User Roles

### Admin
- Full access ke semua fitur
- Bisa manage users
- Tidak terikat ke kelurahan tertentu

### Staff
- Terikat ke kelurahan tertentu
- Akses terbatas ke data kelurahan mereka
- Bisa manage surat

### User
- Akses terbatas
- Hanya bisa view data

## 🔧 API Endpoints

### GET /api/users
Get all users (admin only)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@cibodas.go.id",
      "name": "Admin Kecamatan",
      "role": "admin",
      "kelurahan_id": null,
      "is_active": true,
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /api/users
Create new user (admin only)

**Request:**
```json
{
  "email": "staff@example.com",
  "password": "password123",
  "name": "Staff Baru",
  "role": "staff",
  "kelurahan_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 9,
    "email": "staff@example.com",
    "name": "Staff Baru",
    "role": "staff",
    "kelurahan_id": 2
  }
}
```

### PUT /api/users?id=9
Update user (admin only)

**Request:**
```json
{
  "name": "Staff Updated",
  "password": "newpassword123",
  "role": "staff",
  "kelurahan_id": 3
}
```

### DELETE /api/users?id=9
Delete user (admin only)

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 🎨 UI Components

### Users Table
- Sortable columns
- Hover effects
- Role badges (color-coded)
- Status badges (Active/Inactive)
- Action buttons (Edit/Delete)

### Add/Edit Modal
- Form validation
- Error handling
- Loading states
- Conditional fields (Kelurahan for staff only)

### Search & Filter Bar
- Real-time search
- Role dropdown filter
- Refresh button

## 🔒 Security

### Password Hashing
```typescript
// Auto-hash with bcrypt (10 rounds)
const password_hash = await bcrypt.hash(password, 10);
```

### Email Validation
- Check unique email before create
- Prevent duplicate emails

### Soft Delete
- Users are not permanently deleted
- Set `is_active = false`
- Can be reactivated later

## 🧪 Testing

### Test 1: Access Control

**As Non-Admin:**
1. Login as staff
2. Navigate to `/pengguna`
3. **Expected**: Redirect to `/dashboard`

**As Admin:**
1. Login as admin
2. Navigate to `/pengguna`
3. **Expected**: See user management page

### Test 2: Add User

1. Click "Tambah Pengguna"
2. Fill form:
   - Name: Test Staff
   - Email: test@example.com
   - Password: password123
   - Role: staff
   - Kelurahan: CIBODAS
3. Click "Simpan"
4. **Expected**: User created, table refreshed

### Test 3: Edit User

1. Click Edit icon on a user
2. Update name
3. Click "Simpan"
4. **Expected**: User updated

### Test 4: Delete User

1. Click Delete icon
2. Confirm deletion
3. **Expected**: User deleted (is_active = false)

### Test 5: Search & Filter

1. Type in search box
2. **Expected**: Table filters in real-time
3. Select role filter
4. **Expected**: Shows only selected role

## 📊 Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Best Practices

### Do's ✅
- Always hash passwords
- Validate email uniqueness
- Check admin role before operations
- Use soft delete
- Show confirmation before delete
- Validate form inputs

### Don'ts ❌
- Don't store plain passwords
- Don't allow self-deletion
- Don't skip validation
- Don't permanently delete users
- Don't expose password hashes

## 🐛 Error Handling

### Email Already Exists
```json
{
  "error": "Email already exists"
}
```

### User Not Found
```json
{
  "error": "User not found"
}
```

### Validation Error
```json
{
  "error": "Email, password, name, and role are required"
}
```

## 📝 Future Improvements

- [ ] Bulk operations (delete multiple)
- [ ] Export users to CSV
- [ ] User activity logs
- [ ] Password strength meter
- [ ] Email verification
- [ ] Role-based permissions (granular)
- [ ] User profile pictures
- [ ] Last login tracking

## 🔄 Workflow

```
Admin Login
  ↓
Navigate to /pengguna
  ↓
View all users
  ↓
Search/Filter (optional)
  ↓
Add/Edit/Delete user
  ↓
Form validation
  ↓
API call (POST/PUT/DELETE)
  ↓
Password hashing (if new/changed)
  ↓
Database update
  ↓
Refresh table
  ↓
Success message
```

## 📋 Checklist

- [x] API endpoints created
- [x] User management page
- [x] Add user form
- [x] Edit user form
- [x] Delete user
- [x] Search functionality
- [x] Role filter
- [x] Password hashing
- [x] Admin-only access
- [x] Error handling
- [x] Loading states
- [x] Confirmation dialogs

---

**Status**: ✅ User Management Complete
**Version**: 1.0.0
**Last Updated**: 2025-10-08
