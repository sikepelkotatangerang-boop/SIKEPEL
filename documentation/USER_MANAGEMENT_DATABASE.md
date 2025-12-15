# User Management - Database Integration

## 🎯 Overview

Halaman **Manajemen Pengguna** (`/pengguna`) adalah fitur admin untuk **Create, Read, Update, Delete (CRUD)** pengguna di database.

## ✨ Features

### 1. View All Users
- ✅ Fetch dari database `users` table
- ✅ Display: Nama, Email, Role, Status (Aktif/Nonaktif)
- ✅ Real-time data
- ✅ Loading state
- ✅ Error handling

### 2. Search & Filter
- ✅ Search by nama atau email
- ✅ Filter by role (admin/staff/user)
- ✅ Live filtering (client-side)

### 3. Create User
- ✅ Form modal dengan validasi
- ✅ Fields:
  - Nama Lengkap (required)
  - Email (required, unique)
  - Password (required, auto-hashed)
  - Role (admin/staff/user)
  - Kelurahan (jika role = staff)
- ✅ Password hashing dengan bcrypt (10 rounds)
- ✅ Insert ke database
- ✅ Success/error messages

### 4. Edit User
- ✅ Pre-fill form dengan data existing
- ✅ Update semua fields
- ✅ Password optional (kosongkan jika tidak diubah)
- ✅ Change role & kelurahan
- ✅ Update database
- ✅ Preserve password jika tidak diubah

### 5. Delete User
- ✅ Soft delete (set `is_active = false`)
- ✅ Confirmation dialog
- ✅ Cannot delete self
- ✅ Update database

## 🗄️ Database Schema

### users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'user')),
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

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
  "email": "newstaff@cibodas.go.id",
  "password": "password123",
  "name": "Staff Baru",
  "role": "staff",
  "kelurahan_id": 2
}
```

**Process:**
1. Validate required fields
2. Check email uniqueness
3. Hash password dengan bcrypt
4. Insert to database
5. Return user (without password_hash)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 9,
    "email": "newstaff@cibodas.go.id",
    "name": "Staff Baru",
    "role": "staff",
    "kelurahan_id": 2,
    "is_active": true
  }
}
```

### PUT /api/users?id=9
Update user (admin only)

**Request:**
```json
{
  "name": "Staff Updated",
  "email": "updated@cibodas.go.id",
  "password": "newpassword123",
  "role": "staff",
  "kelurahan_id": 3,
  "is_active": true
}
```

**Process:**
1. Check user exists
2. Prepare update data
3. Hash new password if provided
4. Update database
5. Return updated user

### DELETE /api/users?id=9
Delete user (admin only)

**Process:**
1. Soft delete: `UPDATE users SET is_active = false WHERE id = $1`
2. User still exists in DB but marked inactive
3. Can be reactivated later

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 📋 User Roles

### Admin
- **Access**: Full system access
- **Kelurahan**: NULL (tidak terikat)
- **Permissions**: 
  - Manage all users
  - View all data
  - System settings
  - Send notifications

### Staff
- **Access**: Limited to kelurahan
- **Kelurahan**: Required (1-6)
- **Permissions**:
  - Manage documents for their kelurahan
  - View kelurahan data
  - Process surat

### User
- **Access**: Basic access
- **Kelurahan**: NULL (optional)
- **Permissions**:
  - View own data
  - Submit requests

## 🔒 Security

### Password Hashing
```typescript
import bcrypt from 'bcrypt';

// Hash password (10 rounds)
const password_hash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, password_hash);
```

### Email Validation
- Check uniqueness before create
- Prevent duplicate emails
- Case-insensitive check

### Soft Delete
- Users not permanently deleted
- Set `is_active = false`
- Preserve data integrity
- Can reactivate if needed

## 🎨 UI Components

### Users Table
```
┌─────────────────────────────────────────────────────┐
│ Nama          │ Email              │ Role  │ Status │
├─────────────────────────────────────────────────────┤
│ Admin         │ admin@cibodas...   │ admin │ Aktif  │
│ Staff Cibodas │ staff@cibodas...   │ staff │ Aktif  │
└─────────────────────────────────────────────────────┘
```

### Add/Edit Modal
```
┌─────────────────────────────────────┐
│ Tambah Pengguna               [×]   │
├─────────────────────────────────────┤
│ Nama Lengkap: [________________]    │
│ Email:        [________________]    │
│ Password:     [________________]    │
│ Role:         [Staff ▼]             │
│ Kelurahan:    [CIBODAS ▼]          │
│                                     │
│ [Simpan] [Batal]                   │
└─────────────────────────────────────┘
```

## 🔄 Workflow

### Create User Flow
```
1. Admin click "Tambah Pengguna"
   ↓
2. Fill form & select role
   ↓
3. If role = staff, select kelurahan
   ↓
4. Click "Simpan"
   ↓
5. Validate form
   ↓
6. POST /api/users
   ↓
7. Hash password
   ↓
8. Insert to database
   ↓
9. Return success
   ↓
10. Refresh table
   ↓
11. Close modal
```

### Edit User Flow
```
1. Admin click Edit icon
   ↓
2. Modal opens with pre-filled data
   ↓
3. Update fields
   ↓
4. Password optional (leave empty to keep)
   ↓
5. Click "Simpan"
   ↓
6. PUT /api/users?id=X
   ↓
7. Hash new password if provided
   ↓
8. Update database
   ↓
9. Refresh table
```

### Delete User Flow
```
1. Admin click Delete icon
   ↓
2. Confirmation dialog
   ↓
3. Confirm deletion
   ↓
4. DELETE /api/users?id=X
   ↓
5. Soft delete (is_active = false)
   ↓
6. Refresh table
   ↓
7. User disappears from list
```

## 🧪 Testing

### Test 1: Create User

**Steps:**
1. Login as admin
2. Navigate to `/pengguna`
3. Click "Tambah Pengguna"
4. Fill form:
   - Name: Test Staff
   - Email: teststaff@cibodas.go.id
   - Password: password123
   - Role: staff
   - Kelurahan: CIBODAS
5. Click "Simpan"

**Expected:**
- Success message appears
- Table refreshes
- New user visible in table
- Can login with new credentials

**Verify in Database:**
```sql
SELECT * FROM users WHERE email = 'teststaff@cibodas.go.id';
-- Should show new user with hashed password
```

### Test 2: Edit User

**Steps:**
1. Click Edit icon on a user
2. Change name to "Updated Name"
3. Change role to "admin"
4. Click "Simpan"

**Expected:**
- Success message
- Table shows updated data
- Database updated

**Verify:**
```sql
SELECT name, role FROM users WHERE id = X;
-- Should show updated values
```

### Test 3: Delete User

**Steps:**
1. Click Delete icon
2. Confirm deletion
3. Check table

**Expected:**
- User removed from table
- Cannot login anymore

**Verify:**
```sql
SELECT is_active FROM users WHERE id = X;
-- Should be false
```

### Test 4: Duplicate Email

**Steps:**
1. Try to create user with existing email
2. Click "Simpan"

**Expected:**
- Error message: "Email already exists"
- User not created

### Test 5: Password Update

**Steps:**
1. Edit user
2. Leave password field empty
3. Update other fields
4. Save

**Expected:**
- Other fields updated
- Password unchanged
- Can still login with old password

**Steps (Change Password):**
1. Edit user
2. Enter new password
3. Save

**Expected:**
- Password updated
- Old password no longer works
- New password works

## 📊 Database Queries

### Get All Active Users
```sql
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.kelurahan_id,
  k.nama as kelurahan_nama,
  u.is_active,
  u.created_at
FROM users u
LEFT JOIN kelurahan k ON u.kelurahan_id = k.id
WHERE u.is_active = true
ORDER BY u.created_at DESC;
```

### Get User with Kelurahan
```sql
SELECT 
  u.*,
  k.nama as kelurahan_nama
FROM users u
LEFT JOIN kelurahan k ON u.kelurahan_id = k.id
WHERE u.id = $1;
```

### Check Email Exists
```sql
SELECT id FROM users WHERE email = $1;
```

### Soft Delete User
```sql
UPDATE users 
SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
```

### Reactivate User
```sql
UPDATE users 
SET is_active = true, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
```

## 🎯 Best Practices

### Do's ✅
- Always hash passwords
- Validate email uniqueness
- Use soft delete
- Show confirmation before delete
- Validate form inputs
- Handle errors gracefully
- Refresh data after operations
- Remove password_hash from API responses

### Don'ts ❌
- Don't store plain passwords
- Don't allow self-deletion
- Don't skip validation
- Don't permanently delete users
- Don't expose password hashes
- Don't allow duplicate emails

## 🐛 Common Issues

### Issue 1: "Email already exists"
**Cause:** Trying to create user with existing email

**Solution:** Use different email or update existing user

### Issue 2: Cannot delete user
**Cause:** Trying to delete self

**Solution:** Login as different admin

### Issue 3: Password not updating
**Cause:** Password field empty in edit form

**Solution:** Enter new password or leave empty to keep old

### Issue 4: Kelurahan not showing
**Cause:** Role not set to "staff"

**Solution:** Select role "staff" first, then kelurahan appears

## 📈 Statistics

### Current Users (from seed.sql)
- **Admin**: 1 user
- **Staff**: 6 users (one per kelurahan)
- **User**: 1 user
- **Total**: 8 users

### Default Credentials
All users have password: `password123`

**Admin:**
- admin@cibodas.go.id

**Staff:**
- staffkelcibodas@cibodas.go.id (Kel. Cibodas)
- staffkelcbb@cibodas.go.id (Kel. Cibodas Baru)
- staffpanbar@cibodas.go.id (Kel. Panunggangan Barat)
- staffcibodasari@cibodas.go.id (Kel. Cibodasari)
- staffuwungjaya@cibodas.go.id (Kel. Uwung Jaya)
- staffjatiuwung@cibodas.go.id (Kel. Jatiuwung)

## 📝 Files

```
src/app/
├── api/
│   └── users/
│       └── route.ts              ✅ CRUD API endpoints
├── pengguna/
│   └── page.tsx                  ✅ User management UI

src/lib/models/
└── user.ts                       ✅ User model (database)

database/
├── schema.sql                    ✅ Users table schema
└── seed.sql                      ✅ Sample users data
```

## ✅ Checklist

- [x] Users table in database
- [x] User model with CRUD methods
- [x] API endpoints (GET, POST, PUT, DELETE)
- [x] Password hashing (bcrypt)
- [x] Email uniqueness check
- [x] Soft delete functionality
- [x] Admin-only access control
- [x] User management UI
- [x] Search & filter
- [x] Add user form
- [x] Edit user form
- [x] Delete confirmation
- [x] Role selection
- [x] Kelurahan dropdown (for staff)
- [x] Loading states
- [x] Error handling
- [x] Success messages

---

**Status**: ✅ User Management Fully Integrated with Database
**Version**: 1.0.0
**Last Updated**: 2025-01-08

Halaman manajemen pengguna sekarang **fully functional** untuk CRUD pengguna di database!
