# Authentication & Route Protection

## 🔐 Overview

Aplikasi sekarang memiliki proteksi route untuk mencegah akses ke halaman yang memerlukan authentication.

## 🛡️ Protected Routes

Routes berikut **hanya bisa diakses** jika sudah login:

- `/dashboard` - Dashboard utama
- `/surat-masuk` - Surat masuk
- `/surat-keluar` - Surat keluar
- `/pengguna` - Manajemen pengguna
- `/form-surat/*` - Semua form surat (SKTM, dll)

## 🌐 Public Routes

Routes yang bisa diakses tanpa login:

- `/` - Homepage
- `/login` - Login page
- `/register` - Register page (jika ada)
- `/api/*` - Semua API routes

## 🔄 Authentication Flow

### Login Flow

```
1. User input email & password
   ↓
2. POST /api/auth/login
   ↓
3. Verify credentials dengan database
   ↓
4. Return user data
   ↓
5. Save to localStorage
   ↓
6. Set auth cookie (auth-token)
   ↓
7. Redirect to /dashboard
```

### Logout Flow

```
1. User click logout
   ↓
2. Clear localStorage
   ↓
3. Clear auth cookie
   ↓
4. Redirect to /login
```

### Access Protected Route

```
1. User navigate to /dashboard
   ↓
2. Middleware check auth cookie
   ↓
3a. Has cookie → Allow access
3b. No cookie → Redirect to /login?redirect=/dashboard
```

## 🔧 Implementation

### Middleware (`src/middleware.ts`)

```typescript
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  const hasAuth = !!authToken;

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
```

### Login Page (`src/app/login/page.tsx`)

```typescript
// Set auth cookie on successful login
document.cookie = `auth-token=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
```

### Logout (`src/components/layout/Navbar.tsx`)

```typescript
const handleLogout = () => {
  // Clear localStorage
  mockAuth.logout();
  
  // Clear auth cookie
  document.cookie = 'auth-token=; path=/; max-age=0';
  
  router.push('/login');
};
```

## 🧪 Testing

### Test 1: Access Protected Route Without Login

1. **Logout** jika sudah login
2. **Navigate** ke `http://localhost:3000/dashboard`
3. **Expected**: Redirect ke `/login?redirect=/dashboard`

### Test 2: Login & Access Dashboard

1. **Login** dengan credentials valid
2. **Expected**: Redirect ke `/dashboard`
3. **Verify**: Dashboard accessible

### Test 3: Access Login While Logged In

1. **Login** terlebih dahulu
2. **Navigate** ke `http://localhost:3000/login`
3. **Expected**: Redirect ke `/dashboard`

### Test 4: Logout

1. **Click** logout button
2. **Expected**: Redirect ke `/login`
3. **Try** access `/dashboard`
4. **Expected**: Redirect ke `/login`

## 🔒 Security Features

### Cookie Settings

```typescript
auth-token=${userId}; 
path=/;                  // Available for all routes
max-age=${60*60*24*7}    // Expires in 7 days
```

### Protected Routes List

- Dashboard
- Surat Masuk/Keluar
- Form Surat
- Manajemen Pengguna

### Redirect After Login

Jika user mencoba akses protected route tanpa login:
- Redirect ke `/login?redirect=/dashboard`
- Setelah login, redirect kembali ke route yang diminta

## 📝 Session Management

### Current Implementation

- **Storage**: localStorage + Cookie
- **Duration**: 7 days
- **Validation**: Cookie presence check

### Future Improvements

- [ ] JWT tokens
- [ ] Refresh tokens
- [ ] Session expiry handling
- [ ] Remember me functionality
- [ ] Multi-device session management

## 🐛 Troubleshooting

### "Redirect loop" Issue

**Cause**: Cookie not being set properly

**Solution**:
1. Clear browser cookies
2. Clear localStorage
3. Login again

### "Can access dashboard without login"

**Cause**: Middleware not running

**Solution**:
1. Check `middleware.ts` exists
2. Verify `config.matcher` is correct
3. Restart dev server

### "Redirect to login after successful login"

**Cause**: Cookie not being set

**Solution**:
1. Check browser console for errors
2. Verify cookie is set: DevTools → Application → Cookies
3. Check cookie domain and path

## 🎯 Best Practices

### Do's ✅

- Always clear both localStorage AND cookie on logout
- Set appropriate cookie expiry
- Handle redirect parameter after login
- Validate session on protected routes

### Don'ts ❌

- Don't store sensitive data in localStorage
- Don't rely only on client-side validation
- Don't forget to clear cookies on logout
- Don't use long-lived tokens without refresh mechanism

## 🔄 Migration from Mock Auth

### Before (Mock Only)

```typescript
// No route protection
// Anyone can access /dashboard
```

### After (Protected)

```typescript
// Middleware checks auth cookie
// Redirect to /login if not authenticated
// Set cookie on login
// Clear cookie on logout
```

## 📊 Status

- ✅ Middleware implemented
- ✅ Cookie-based session
- ✅ Protected routes
- ✅ Login/logout flow
- ✅ Redirect after login
- 🔄 JWT tokens (future)
- 🔄 Refresh tokens (future)

---

**Status**: ✅ Authentication Protection Active
**Version**: 1.0.0
**Last Updated**: 2025-10-08
