# Debug: Surat Pindah Keluar Tidak Muncul di Daftar Surat

## 🔍 Diagnostic Steps

### Step 1: Check Database

```sql
-- Check if data exists
SELECT 
  id,
  nomor_surat,
  jenis_dokumen,
  nama_subjek,
  google_drive_url,
  status,
  created_at
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- Should return rows with `jenis_dokumen = 'Surat Pindah Keluar'`
- `status` should be `'active'`
- `google_drive_url` should not be NULL

**If No Results:**
- Data belum tersimpan ke database
- Check API `/api/process-pindah-keluar` logs
- Verify ConvertAPI berhasil

### Step 2: Check Browser Console

1. Buka halaman Daftar Surat
2. Buka Developer Tools (F12)
3. Tab Console
4. Look for these logs:

```
API Response: { success: true, data: [...], pagination: {...} }
Documents count: 10
Filter jenis: ""
Surat Pindah Keluar found: 2
Sample Pindah Keluar: { id: 123, jenis_dokumen: "Surat Pindah Keluar", ... }
```

**If "Surat Pindah Keluar found: 0":**
- Data tidak di-fetch dari database
- Check API `/api/documents` logs
- Verify query parameters

### Step 3: Check Server Logs

Terminal yang menjalankan `npm run dev`:

```
Documents Query: SELECT da.*, ...
Final Query Params: ['active', 10, 0]
Documents fetched: 10
Sample document: { id: 123, jenis_dokumen: "Surat Pindah Keluar", ... }
```

**If "Documents fetched: 0":**
- Database connection issue
- Query filter too restrictive
- Check `kelurahanId` filter

### Step 4: Verify Filter Dropdown

```tsx
<option value="Surat Pindah Keluar">Surat Pindah Keluar</option>
```

**Check:**
- ✅ Option exists in dropdown
- ✅ Value is exactly "Surat Pindah Keluar" (case-sensitive)
- ✅ No extra spaces

### Step 5: Check Badge Color

```tsx
'Surat Pindah Keluar': 'bg-red-100 text-red-800',
```

**Check:**
- ✅ Color defined in `getJenisBadgeColor()`
- ✅ Key matches exactly

## 🐛 Common Issues

### Issue 1: Case Sensitivity

**Problem:**
```sql
-- Database
jenis_dokumen = 'Surat Pindah Keluar'

-- Dropdown
<option value="surat pindah keluar">  ← WRONG!
```

**Solution:**
```tsx
<option value="Surat Pindah Keluar">  ← CORRECT
```

### Issue 2: Extra Spaces

**Problem:**
```sql
jenis_dokumen = 'Surat Pindah Keluar '  ← Extra space at end
```

**Solution:**
```typescript
// In API route
'Surat Pindah Keluar'.trim()
```

### Issue 3: Kelurahan Filter

**Problem:**
User role = 'staff' tapi `kelurahan_id` di database NULL

**Check:**
```sql
SELECT 
  id,
  jenis_dokumen,
  nama_subjek,
  kelurahan_id
FROM document_archives
WHERE jenis_dokumen = 'Surat Pindah Keluar';
```

**Solution:**
Pastikan `kelurahan_id` terisi saat save:
```typescript
// In process-pindah-keluar route
kelurahanId,  // Should not be null
```

### Issue 4: Status Not Active

**Problem:**
```sql
status = 'inactive' or status = NULL
```

**Solution:**
```typescript
// In API route
'active'  // Always set to 'active'
```

### Issue 5: google_drive_url NULL

**Problem:**
```sql
google_drive_url = NULL
```

**Check Upload:**
```typescript
console.log('☁️ Uploaded to Supabase Storage:', supabasePublicUrl);
```

**Solution:**
Verify Supabase upload berhasil

## 🔧 Quick Fixes

### Fix 1: Hard Refresh

```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Fix 2: Clear Browser Cache

```
Settings → Privacy → Clear browsing data
```

### Fix 3: Check Network Tab

1. Open Developer Tools (F12)
2. Tab Network
3. Refresh page
4. Look for `/api/documents` request
5. Check Response

### Fix 4: Re-save Document

1. Create new Surat Pindah Keluar
2. Check if it appears immediately
3. If yes → old data might have issue
4. If no → check API logs

## 📊 Debug Checklist

- [ ] Database has data with `jenis_dokumen = 'Surat Pindah Keluar'`
- [ ] `status = 'active'`
- [ ] `google_drive_url` is not NULL
- [ ] Browser console shows "Surat Pindah Keluar found: X" (X > 0)
- [ ] Server logs show documents fetched
- [ ] Filter dropdown has option "Surat Pindah Keluar"
- [ ] Badge color defined
- [ ] No JavaScript errors in console
- [ ] API `/api/documents` returns 200 OK
- [ ] Hard refresh done

## 🎯 Expected Behavior

### When Working Correctly:

**Database:**
```sql
id | jenis_dokumen        | status | google_drive_url
---|---------------------|--------|------------------
123| Surat Pindah Keluar | active | https://...
```

**Browser Console:**
```
Surat Pindah Keluar found: 1
Sample Pindah Keluar: {
  id: 123,
  jenis_dokumen: "Surat Pindah Keluar",
  nama_subjek: "John Doe",
  storage_url: "https://...",
  google_drive_url: "https://..."
}
```

**UI:**
```
[Surat Pindah Keluar]  ← Red badge
No. Surat: 1234567890123456
Nama: John Doe
```

## 🚀 Testing Script

Run this in browser console:

```javascript
// Test 1: Check if documents loaded
console.log('Total documents:', document.querySelectorAll('[class*="Card"]').length);

// Test 2: Check if Pindah Keluar badge exists
const badges = Array.from(document.querySelectorAll('[class*="bg-red"]'));
const pindahKeluarBadges = badges.filter(b => b.textContent.includes('Pindah'));
console.log('Pindah Keluar badges found:', pindahKeluarBadges.length);

// Test 3: Check dropdown options
const dropdown = document.querySelector('select');
const options = Array.from(dropdown.options).map(o => o.value);
console.log('Dropdown options:', options);
console.log('Has Pindah Keluar:', options.includes('Surat Pindah Keluar'));
```

## 📞 Support

If still not working after all checks:

1. **Export Database Data:**
   ```sql
   COPY (
     SELECT * FROM document_archives 
     WHERE jenis_dokumen = 'Surat Pindah Keluar'
   ) TO '/tmp/pindah_keluar_debug.csv' CSV HEADER;
   ```

2. **Check API Response:**
   ```bash
   curl http://localhost:3000/api/documents?jenisDokumen=Surat%20Pindah%20Keluar
   ```

3. **Review Logs:**
   - Server logs (terminal)
   - Browser console
   - Network tab

---

**Last Updated**: 2025-01-20
**Status**: Debugging Guide
**Next**: Check each step systematically
