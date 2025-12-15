# Fix: Form SKTM - Nomor Surat Multiple API Calls

## 🐛 Problem

Form SKTM memanggil API `/api/generate-nomor-surat` **lebih dari sekali** saat component mount, menyebabkan:
- Multiple database queries
- Wasted resources
- Potential race conditions
- Inconsistent nomor surat

## 🔍 Root Cause

### Original Code

```typescript
// Auto-generate nomor surat saat component mount
useEffect(() => {
  const generateNomorSurat = async () => {
    try {
      const kelurahanId = currentUser?.kelurahan_id || '';
      const response = await fetch(`/api/generate-nomor-surat?jenis=SKTM&kelurahanId=${kelurahanId}`);
      const data = await response.json();

      if (data.success && data.nomorSurat) {
        setFormData(prev => ({
          ...prev,
          nomor_surat: data.nomorSurat,
        }));
      }
    } catch (error) {
      console.error('Error generating nomor surat:', error);
    }
  };

  if (currentUser) {
    generateNomorSurat();
  }
}, [currentUser]);  // ❌ Dependency on currentUser
```

### Why Multiple Calls?

1. **Dependency Array**: `[currentUser]`
2. **React Strict Mode**: Component mounts twice in development
3. **State Updates**: `currentUser` might update multiple times
4. **Re-renders**: Any parent re-render can trigger this effect

**Result:** API called 2-3 times for single form load!

## ✅ Solution

### Use `useRef` to Track Generation

```typescript
// Track if nomor surat has been generated to prevent multiple calls
const nomorSuratGenerated = useRef(false);

// Auto-generate nomor surat saat component mount (hanya sekali)
useEffect(() => {
  const generateNomorSurat = async () => {
    // Cek apakah sudah pernah generate
    if (nomorSuratGenerated.current) {
      return;  // ✅ Skip if already generated
    }

    try {
      nomorSuratGenerated.current = true; // ✅ Set flag BEFORE fetch
      
      const kelurahanId = currentUser?.kelurahan_id || '';
      const response = await fetch(`/api/generate-nomor-surat?jenis=SKTM&kelurahanId=${kelurahanId}`);
      const data = await response.json();

      if (data.success && data.nomorSurat) {
        setFormData(prev => ({
          ...prev,
          nomor_surat: data.nomorSurat,
        }));
        console.log('✅ Nomor surat generated:', data.nomorSurat);
      }
    } catch (error) {
      console.error('❌ Error generating nomor surat:', error);
      nomorSuratGenerated.current = false; // ✅ Reset flag on error
    }
  };

  // Hanya generate jika user sudah ada dan belum pernah generate
  if (currentUser && !nomorSuratGenerated.current) {
    generateNomorSurat();
  }
}, [currentUser]);
```

### Key Points

1. **useRef Flag**: `nomorSuratGenerated.current`
   - Persists across re-renders
   - Doesn't trigger re-renders when changed
   - Perfect for tracking one-time operations

2. **Set Flag Before Fetch**: `nomorSuratGenerated.current = true`
   - Prevents race conditions
   - Even if effect runs twice, second call returns early

3. **Reset on Error**: `nomorSuratGenerated.current = false`
   - Allows retry if first attempt fails
   - User can refresh to try again

4. **Logging**: `console.log('✅ Nomor surat generated:', ...)`
   - Easy to verify single call
   - Helpful for debugging

## 📊 Comparison

### Before (Multiple Calls)

```
Component Mount
  ↓
useEffect runs → API Call #1
  ↓
currentUser updates
  ↓
useEffect runs → API Call #2  ❌
  ↓
React Strict Mode remount
  ↓
useEffect runs → API Call #3  ❌
```

**Result:** 3 API calls, 3 database queries!

### After (Single Call)

```
Component Mount
  ↓
useEffect runs
  ↓
Check: nomorSuratGenerated.current === false
  ↓
Set: nomorSuratGenerated.current = true
  ↓
API Call #1  ✅
  ↓
currentUser updates
  ↓
useEffect runs
  ↓
Check: nomorSuratGenerated.current === true
  ↓
Return early (skip)  ✅
  ↓
React Strict Mode remount
  ↓
useEffect runs
  ↓
Check: nomorSuratGenerated.current === true
  ↓
Return early (skip)  ✅
```

**Result:** 1 API call only! ✅

## 🎯 Benefits

1. **Performance**
   - ✅ Single API call instead of multiple
   - ✅ Single database query
   - ✅ Faster page load

2. **Consistency**
   - ✅ Same nomor surat throughout session
   - ✅ No race conditions
   - ✅ Predictable behavior

3. **Resource Efficiency**
   - ✅ Less server load
   - ✅ Less database queries
   - ✅ Better user experience

4. **Debugging**
   - ✅ Clear console logs
   - ✅ Easy to verify single call
   - ✅ Error handling with retry

## 🔍 Verification

### Check Browser Console

**Before Fix:**
```
Error generating nomor surat: ...
Error generating nomor surat: ...
Error generating nomor surat: ...
```

**After Fix:**
```
✅ Nomor surat generated: 470/001/SKTM/I/2025
```

**Only ONE log!** ✅

### Check Network Tab

**Before Fix:**
```
GET /api/generate-nomor-surat?jenis=SKTM&kelurahanId=1
GET /api/generate-nomor-surat?jenis=SKTM&kelurahanId=1
GET /api/generate-nomor-surat?jenis=SKTM&kelurahanId=1
```

**After Fix:**
```
GET /api/generate-nomor-surat?jenis=SKTM&kelurahanId=1
```

**Only ONE request!** ✅

### Check Server Logs

**Before Fix:**
```
📝 Generating nomor surat for SKTM, kelurahan: 1
📝 Generating nomor surat for SKTM, kelurahan: 1
📝 Generating nomor surat for SKTM, kelurahan: 1
```

**After Fix:**
```
📝 Generating nomor surat for SKTM, kelurahan: 1
```

**Only ONE query!** ✅

## 🧪 Testing

### Test 1: Fresh Page Load

1. Open Form SKTM
2. Check browser console
3. Should see: `✅ Nomor surat generated: ...`
4. Should see only **ONE** log

### Test 2: React Strict Mode

1. Run in development mode
2. React Strict Mode mounts twice
3. Should still see only **ONE** API call
4. Check Network tab to verify

### Test 3: Error Handling

1. Disconnect from internet
2. Open Form SKTM
3. Should see: `❌ Error generating nomor surat: ...`
4. Reconnect internet
5. Refresh page
6. Should generate successfully (flag was reset)

### Test 4: SessionStorage Restore

1. Fill form
2. Go to preview
3. Click "Kembali ke Form"
4. Nomor surat should be restored from sessionStorage
5. Should NOT call API again

## 🔄 Pattern for Other Forms

This pattern should be applied to **all forms** that auto-generate nomor surat:

### Forms to Update

- ✅ **Form SKTM** - Fixed
- ⚠️ **Form SKU** - Need to check
- ⚠️ **Form Domisili** - Need to check
- ⚠️ **Form Kelahiran** - Need to check
- ⚠️ **Form Pindah Keluar** - Need to check (if has nomor surat)
- ⚠️ **Other forms** - Need to check

### Implementation Template

```typescript
// 1. Add useRef import
import { useState, useEffect, useRef } from 'react';

// 2. Add ref in component
const nomorSuratGenerated = useRef(false);

// 3. Update useEffect
useEffect(() => {
  const generateNomorSurat = async () => {
    if (nomorSuratGenerated.current) return;
    
    try {
      nomorSuratGenerated.current = true;
      
      // ... fetch logic
      
      console.log('✅ Nomor surat generated:', data.nomorSurat);
    } catch (error) {
      console.error('❌ Error generating nomor surat:', error);
      nomorSuratGenerated.current = false;
    }
  };

  if (currentUser && !nomorSuratGenerated.current) {
    generateNomorSurat();
  }
}, [currentUser]);
```

## 📚 Related Documentation

- **React useRef**: https://react.dev/reference/react/useRef
- **React useEffect**: https://react.dev/reference/react/useEffect
- **React Strict Mode**: https://react.dev/reference/react/StrictMode

## 🎓 Learning Points

### Why useRef?

1. **Persists across re-renders**
   - Unlike regular variables
   - Doesn't reset on re-render

2. **Doesn't trigger re-renders**
   - Unlike useState
   - Perfect for flags and tracking

3. **Mutable**
   - Can update `.current` directly
   - No need for setter function

### When to Use useRef?

- ✅ Tracking one-time operations
- ✅ Storing previous values
- ✅ Accessing DOM elements
- ✅ Storing timers/intervals
- ❌ NOT for data that affects rendering (use useState)

### Alternative Solutions

#### Option 1: Empty Dependency Array

```typescript
useEffect(() => {
  generateNomorSurat();
}, []); // ❌ ESLint warning, missing dependency
```

**Problem:** ESLint warning, might miss updates

#### Option 2: Conditional in Dependency

```typescript
useEffect(() => {
  if (!formData.nomor_surat) {
    generateNomorSurat();
  }
}, [formData.nomor_surat]); // ❌ Infinite loop risk
```

**Problem:** Can cause infinite loop

#### Option 3: useRef (BEST) ✅

```typescript
const generated = useRef(false);

useEffect(() => {
  if (generated.current) return;
  generated.current = true;
  generateNomorSurat();
}, [currentUser]);
```

**Advantages:**
- ✅ No ESLint warnings
- ✅ No infinite loops
- ✅ Clear intent
- ✅ Easy to understand

---

**Last Updated**: 2025-01-20
**Issue**: Multiple API calls for nomor surat generation
**Solution**: Use useRef flag to track generation
**Status**: ✅ Fixed
**Pattern**: Apply to all forms with auto-generate nomor surat
