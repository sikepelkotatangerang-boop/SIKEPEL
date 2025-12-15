# Troubleshooting Login Error 401

## 🔍 Error: HTTP 401 Unauthorized

Error ini terjadi saat login gagal. Berikut langkah-langkah troubleshooting:

## ✅ Checklist

### 1. Pastikan Database Sudah Di-Setup

**Check di Supabase SQL Editor:**

```sql
-- Check apakah table users ada
SELECT * FROM users LIMIT 5;

-- Check apakah ada user admin
SELECT id, email, name, role, is_active FROM users WHERE role = 'admin';
```

**Expected Result:**
```
id | email                  | name              | role  | is_active
---+------------------------+-------------------+-------+-----------
1  | admin@cibodas.go.id    | Admin Kecamatan   | admin | true
```

**Jika table tidak ada atau kosong:**
```sql
-- Jalankan schema.sql terlebih dahulu
-- Kemudian jalankan seed.sql
```

### 2. Pastikan Password Hash Benar

**Check password hash di database:**

```sql
SELECT email, password_hash FROM users WHERE email = 'admin@cibodas.go.id';
```

**Expected:**
```
email                  | password_hash
-----------------------+--------------------------------------------------------------
admin@cibodas.go.id    | $2b$10$NaNREkl.H2OSnz/J5vhLBuJSyEnD3klEaqFCdmz.gJvdrUO2fyncG
```

**Password yang benar:** `password123`

### 3. Test Login Manual

**Buka Browser Console (F12) dan jalankan:**

```javascript
// Test login
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@cibodas.go.id',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Expected Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@cibodas.go.id",
    "name": "Admin Kecamatan",
    "role": "admin",
    "kelurahan_id": null,
    "is_active": true
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

### 4. Check Database Connection

**Test di terminal:**

```bash
# Di folder project
npm run dev
```

**Check console output:**
```
✅ Database connected successfully
```

**Jika error:**
```
❌ Unexpected database error
```

**Fix:** Check `.env.local` file:
```env
DATABASE_URL=your_supabase_connection_string
# atau
SUPABASE_DB_URL=your_supabase_connection_string
```

### 5. Regenerate Password Hash

**Jika password tidak match, regenerate hash:**

**Buat file `scripts/hash-password.js`:**
```javascript
const bcrypt = require('bcrypt');

const password = 'password123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
```

**Run:**
```bash
node scripts/hash-password.js
```

**Update di database:**
```sql
UPDATE users 
SET password_hash = '$2b$10$...(hash dari script)...'
WHERE email = 'admin@cibodas.go.id';
```

### 6. Check API Logs

**Check terminal yang running `npm run dev`:**

```
Login error: Error: ...
```

**Common errors:**

#### Error: "relation 'users' does not exist"
**Fix:** Jalankan `schema.sql` di Supabase

#### Error: "column 'password_hash' does not exist"
**Fix:** Jalankan `schema.sql` untuk update table structure

#### Error: "connect ECONNREFUSED"
**Fix:** Check DATABASE_URL di `.env.local`

### 7. Test dengan User Lain

**Test login dengan staff:**

```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'staffkelcibodas@cibodas.go.id',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log('Staff login:', data));
```

## 🔧 Quick Fix Steps

### Step 1: Reset Database

```sql
-- Di Supabase SQL Editor

-- 1. Drop existing tables (HATI-HATI!)
DROP TABLE IF EXISTS pejabat CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_recipients CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS kelurahan CASCADE;

-- 2. Copy paste seluruh isi schema.sql
-- (Buka file schema.sql, copy all, paste di SQL Editor)

-- 3. Copy paste seluruh isi seed.sql
-- (Buka file seed.sql, copy all, paste di SQL Editor)

-- 4. Verify
SELECT * FROM users;
```

### Step 2: Test Login

1. Buka `http://localhost:3000/login`
2. Email: `admin@cibodas.go.id`
3. Password: `password123`
4. Click "Masuk"

**Expected:** Redirect ke `/dashboard`

### Step 3: Check Browser Console

**Jika masih error, buka Console (F12):**

- Red error messages?
- Network tab → Check request/response
- Check error details

## 📊 Debug Checklist

- [ ] Database tables exist
- [ ] Users table has data
- [ ] Admin user exists
- [ ] Password hash is correct
- [ ] Database connection works
- [ ] API endpoint responds
- [ ] bcrypt is installed (`npm list bcrypt`)
- [ ] .env.local has DATABASE_URL
- [ ] Server is running (`npm run dev`)

## 🆘 Still Not Working?

### Check These:

1. **bcrypt not installed?**
```bash
npm install bcrypt
```

2. **Wrong DATABASE_URL?**
```bash
# Check .env.local
cat .env.local
```

3. **Port conflict?**
```bash
# Kill process on port 3000
npx kill-port 3000
# Restart
npm run dev
```

4. **Cache issue?**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📝 Test Credentials

### Admin
- Email: `admin@cibodas.go.id`
- Password: `password123`
- Role: admin

### Staff Kelurahan Cibodas
- Email: `staffkelcibodas@cibodas.go.id`
- Password: `password123`
- Role: staff

### Staff Kelurahan Cibodas Baru
- Email: `staffkelcbb@cibodas.go.id`
- Password: `password123`
- Role: staff

## 🔍 Manual Database Check

```sql
-- Check user exists
SELECT id, email, name, role, is_active 
FROM users 
WHERE email = 'admin@cibodas.go.id';

-- Check password hash
SELECT 
  email, 
  LEFT(password_hash, 20) as hash_preview,
  LENGTH(password_hash) as hash_length
FROM users 
WHERE email = 'admin@cibodas.go.id';

-- Expected hash_length: 60 (bcrypt hash)

-- Check all users
SELECT id, email, name, role, is_active FROM users;
```

## ✅ Success Indicators

**Login berhasil jika:**
1. ✅ Response status 200
2. ✅ Response body contains `"success": true`
3. ✅ Response body contains user data
4. ✅ Redirect ke `/dashboard`
5. ✅ Cookie `auth-token` di-set
6. ✅ localStorage `currentUser` di-set

---

**Jika masih error setelah semua langkah di atas, share:**
1. Error message lengkap dari console
2. Response dari API (Network tab)
3. Database query result
