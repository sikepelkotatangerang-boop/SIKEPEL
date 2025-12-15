# Role-Based Access Control (RBAC)

## 📝 Overview

Aplikasi SIKEPEL sekarang memiliki **Role-Based Access Control** untuk membatasi akses menu dan halaman berdasarkan role user.

## 👥 User Roles

### 1. **Admin** (Administrator Kecamatan)
- **Full Access**: Akses ke semua menu dan fitur
- **User Management**: Dapat mengelola pengguna
- **All Features**: Dashboard, Surat Keterangan, Daftar Surat, Arsip, Surat Keluar, Surat Masuk, Statistik, Pengguna

### 2. **Staff** (Staff Kelurahan)
- **Limited Access**: Akses ke menu operasional
- **No User Management**: Tidak dapat mengelola pengguna
- **Features**: Dashboard, Surat Keterangan, Daftar Surat, Arsip, Surat Keluar, Surat Masuk, Statistik

### 3. **User** (User Biasa)
- **Minimal Access**: Hanya dashboard
- **Read Only**: Tidak dapat mengelola data
- **Features**: Dashboard only

## 🔒 Access Matrix

| Menu | Admin | Staff | User |
|------|-------|-------|------|
| Dashboard | ✅ | ✅ | ✅ |
| Surat Keterangan | ✅ | ✅ | ❌ |
| Daftar Surat | ✅ | ✅ | ❌ |
| Arsip Surat | ✅ | ✅ | ❌ |
| Surat Keluar | ✅ | ✅ | ❌ |
| Surat Masuk | ✅ | ✅ | ❌ |
| Statistik | ✅ | ✅ | ❌ |
| **Pengguna** | ✅ | ❌ | ❌ |

## 🎯 Implementation

### 1. Navigation Menu (Sidebar)

**File**: `src/components/layout/Sidebar.tsx`

Setiap menu item memiliki array `roles` yang menentukan siapa yang bisa mengakses:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'staff', 'user'] },
  { name: 'Surat Keterangan', href: '/surat-keterangan', icon: FileCheck, roles: ['admin', 'staff'] },
  { name: 'Pengguna', href: '/pengguna', icon: Users, roles: ['admin'] }, // Admin only
];
```

**Filtering Logic**:
```typescript
navigation
  .filter((item) => {
    if (!currentUser) return true;
    return item.roles.includes(currentUser.role);
  })
  .map((item) => {
    // Render menu
  })
```

### 2. Page Protection

**File**: `src/app/pengguna/page.tsx`

Halaman Pengguna dilindungi dengan check authorization:

```typescript
useEffect(() => {
  const currentUser = mockAuth.getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    router.push('/dashboard'); // Redirect if not admin
  } else {
    setIsAuthorized(true);
  }
}, [router]);
```

**Features**:
- ✅ Auto-redirect ke dashboard jika bukan admin
- ✅ Loading state saat check authorization
- ✅ Unauthorized message (fallback)
- ✅ Button untuk kembali ke dashboard

## 🔐 Security Layers

### Layer 1: UI/Navigation
- Menu tidak ditampilkan jika user tidak punya akses
- Sidebar auto-filter berdasarkan role

### Layer 2: Page Level
- Check authorization di setiap protected page
- Auto-redirect jika tidak authorized
- Loading state untuk UX yang lebih baik

### Layer 3: Future - API Level
- Validasi role di backend/API
- Token-based authentication
- Supabase Row Level Security (RLS)

## 📊 Role Hierarchy

```
Admin (Highest)
  ├─ Full access to all features
  ├─ User management
  ├─ System configuration
  └─ All data access

Staff (Medium)
  ├─ Operational features
  ├─ Document management
  ├─ Limited to own kelurahan
  └─ No user management

User (Lowest)
  ├─ View only
  ├─ Dashboard access
  └─ No data management
```

## 🧪 Testing

### Test Admin Access
```
1. Login: admin@cibodas.go.id
2. Check sidebar: Should see all 8 menus including "Pengguna"
3. Click "Pengguna": Should access successfully
4. Verify: Can manage users
```

### Test Staff Access
```
1. Login: staffkelcibodas@cibodas.go.id
2. Check sidebar: Should see 7 menus (no "Pengguna")
3. Try access /pengguna directly: Should redirect to dashboard
4. Verify: Cannot access user management
```

### Test User Access
```
1. Login: user@example.com
2. Check sidebar: Should see only "Dashboard"
3. Try access /pengguna directly: Should redirect to dashboard
4. Verify: Minimal access
```

## 🚀 Future Enhancements

### 1. Granular Permissions
```typescript
interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

const adminPermissions: Permission[] = [
  { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'documents', actions: ['create', 'read', 'update', 'delete'] },
];

const staffPermissions: Permission[] = [
  { resource: 'documents', actions: ['create', 'read', 'update'] },
  // No 'delete' permission
];
```

### 2. Kelurahan-Based Access
```typescript
// Staff can only access their own kelurahan data
const canAccess = (document: Document, user: User) => {
  if (user.role === 'admin') return true;
  if (user.role === 'staff') {
    return document.kelurahan === user.kelurahan;
  }
  return false;
};
```

### 3. Dynamic Roles
```typescript
// Load roles from database
const roles = await supabase
  .from('roles')
  .select('*')
  .eq('user_id', userId);
```

### 4. Audit Log
```typescript
// Track who accessed what
const logAccess = (user: User, resource: string, action: string) => {
  supabase.from('audit_logs').insert({
    user_id: user.id,
    resource,
    action,
    timestamp: new Date(),
  });
};
```

## 📝 Best Practices

1. **Always Check on Server**: Never trust client-side checks alone
2. **Fail Secure**: Default to deny access
3. **Audit Everything**: Log all access attempts
4. **Principle of Least Privilege**: Give minimum required access
5. **Regular Review**: Periodically review and update permissions

## 🔧 Customization

### Add New Protected Route

1. **Add role check to navigation**:
```typescript
{ name: 'New Feature', href: '/new-feature', icon: Icon, roles: ['admin'] }
```

2. **Add protection to page**:
```typescript
useEffect(() => {
  const currentUser = mockAuth.getCurrentUser();
  if (!currentUser || !['admin'].includes(currentUser.role)) {
    router.push('/dashboard');
  }
}, [router]);
```

### Change Access Levels

Edit `roles` array in navigation:
```typescript
// Before: Only admin
{ name: 'Statistik', roles: ['admin'] }

// After: Admin and staff
{ name: 'Statistik', roles: ['admin', 'staff'] }
```

## ⚠️ Important Notes

- Menu "Pengguna" **HANYA** bisa diakses oleh **Admin**
- Staff dan User tidak bisa melihat menu "Pengguna" di sidebar
- Akses langsung via URL `/pengguna` akan redirect ke dashboard
- Semua protected pages harus implement authorization check
- Loading state penting untuk UX yang baik

## 📊 Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Navigation Filtering | ✅ | Menu auto-hide based on role |
| Page Protection | ✅ | Redirect unauthorized access |
| Loading State | ✅ | Better UX during auth check |
| Unauthorized Message | ✅ | Clear feedback to users |
| Admin-Only Access | ✅ | Pengguna page restricted |

---

**Status**: ✅ **ACTIVE**  
**Last Updated**: 2025-10-07  
**Security Level**: Client-side (needs server-side validation)
