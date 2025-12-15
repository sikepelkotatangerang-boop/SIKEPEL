# Fix: Supabase Download Error

## 🐛 Problem

Error saat download PDF dari daftar surat:
```json
{
  "success": false,
  "error": "Failed to download file",
  "details": "Failed to download from Supabase Storage: Failed to download from Supabase: {}"
}
```

---

## 🔍 Root Cause

1. **Empty error object** - Supabase error tidak ter-serialize dengan baik
2. **Download method** - Menggunakan `.download()` yang memerlukan auth
3. **Public bucket** - Bucket `documents` adalah public, bisa akses langsung

---

## ✅ Solution

### 1. Improved Error Handling

**File:** `src/lib/supabaseStorage.ts`

```typescript
export async function downloadFromSupabase(
  fileName: string,
  bucketName: string = 'documents'
): Promise<Buffer> {
  try {
    const supabase = getSupabaseClient();

    console.log('Downloading from Supabase:', { fileName, bucketName });

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      console.error('Supabase download error:', error);
      throw new Error(`Failed to download: ${JSON.stringify(error)}`);
    }

    if (!data) {
      throw new Error('No data returned from Supabase download');
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('Downloaded successfully, size:', buffer.length, 'bytes');
    return buffer;
  } catch (error) {
    console.error('Error downloading from Supabase:', error);
    throw new Error(`Failed to download: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
}
```

### 2. Use Public URL Redirect

**File:** `src/app/api/documents/download/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const bucket = searchParams.get('bucket') || 'documents';

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'fileName parameter is required' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);

    // Redirect to public URL (faster, no server processing)
    return NextResponse.redirect(publicUrl, 302);

  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to download file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

### 3. Direct Public URL Access

**File:** `src/app/daftar-surat/page.tsx`

```typescript
const handleDownload = async (doc: Document) => {
  try {
    // Prioritas 1: Gunakan public URL langsung (fastest)
    if (doc.google_drive_url && doc.google_drive_url.includes('supabase')) {
      const link = document.createElement('a');
      link.href = doc.google_drive_url;
      link.download = doc.file_name || 'document.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // Prioritas 2: Download via API
    if (doc.file_name) {
      const downloadUrl = `/api/documents/download?fileName=${encodeURIComponent(doc.file_name)}`;
      window.open(downloadUrl, '_blank');
      return;
    }
    
    // Prioritas 3: Google Drive URL
    if (doc.google_drive_url) {
      window.open(doc.google_drive_url, '_blank');
      return;
    }
    
    alert('File tidak tersedia untuk dokumen ini');
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Gagal mengunduh file. Silakan coba lagi.');
  }
};
```

---

## 🔄 Download Flow

### Before (Error):
```
User clicks download
    ↓
API /documents/download
    ↓
supabase.storage.download() ← Error here
    ↓
Return buffer
    ↓
User downloads
```

### After (Fixed):
```
User clicks download
    ↓
Check if public URL exists
    ↓
YES → Direct download from public URL (fastest)
NO  → API redirect to public URL
    ↓
User downloads
```

---

## 📊 Comparison

| Method | Speed | Server Load | Auth Required | Error Prone |
|--------|-------|-------------|---------------|-------------|
| `.download()` | Slow | High | Yes | Yes ❌ |
| Public URL | Fast | None | No | No ✅ |
| API Redirect | Medium | Low | No | No ✅ |

---

## 🎯 Benefits

### 1. Faster Downloads
- Direct access to public URL
- No server processing
- No buffer conversion

### 2. Less Server Load
- No file streaming through API
- No memory usage for buffers
- Reduced bandwidth

### 3. Better Error Handling
- Clear error messages
- Detailed logging
- JSON serialization of errors

### 4. Fallback Options
- Public URL (primary)
- API redirect (secondary)
- Google Drive URL (tertiary)

---

## 🧪 Testing

### Test 1: Check Public URL
```bash
# Get document from database
psql -d your_database -c "SELECT file_name, google_drive_url FROM document_archives LIMIT 1;"

# Test public URL
curl -I "https://your-project.supabase.co/storage/v1/object/public/documents/filename.pdf"
```

Expected: `200 OK`

### Test 2: Test Download API
```bash
curl "http://localhost:3000/api/documents/download?fileName=SKTM_Test_123.pdf"
```

Expected: Redirect to public URL

### Test 3: Test in Browser
1. Buka `/daftar-surat`
2. Klik "Unduh" pada dokumen
3. **Verify:** PDF downloads successfully
4. **Verify:** No error in console

---

## 🔐 Security Considerations

### Public Bucket:
- ✅ Anyone can access files with URL
- ✅ No authentication required
- ✅ Faster access
- ⚠️ Files are publicly accessible

### Private Bucket (Alternative):
```typescript
// For private bucket, use signed URL
const { data, error } = await supabase.storage
  .from('private-documents')
  .createSignedUrl(fileName, 3600); // 1 hour expiry

if (error) throw error;

return NextResponse.redirect(data.signedUrl);
```

---

## 🐛 Troubleshooting

### Error: "Public URL not accessible"
**Cause:** Bucket is not public

**Solution:**
```sql
-- Check bucket settings
SELECT * FROM storage.buckets WHERE name = 'documents';

-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'documents';
```

### Error: "File not found"
**Cause:** File doesn't exist in storage

**Solution:**
```bash
# List files in bucket
curl "https://your-project.supabase.co/storage/v1/object/list/documents" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"

# Check database vs storage
psql -d your_database -c "SELECT file_name FROM document_archives WHERE file_name IS NOT NULL;"
```

### Error: "CORS error"
**Cause:** CORS not configured

**Solution:**
1. Go to Supabase Dashboard
2. Storage → Settings
3. Add allowed origins:
   - `http://localhost:3000`
   - `https://your-domain.com`

---

## 📝 Checklist

- [x] Improved error handling in `supabaseStorage.ts`
- [x] Changed API to use public URL redirect
- [x] Updated frontend to use public URL directly
- [x] Added detailed logging
- [x] Added fallback options
- [x] Tested download functionality
- [x] Documentation created

---

## 🎯 Result

**Before:**
- Error: `Failed to download from Supabase: {}`
- Slow downloads (buffer streaming)
- High server load

**After:**
- ✅ Direct public URL access
- ✅ Fast downloads
- ✅ Clear error messages
- ✅ Low server load

---

## 📚 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Public vs Private Buckets](https://supabase.com/docs/guides/storage/security/access-control)
- [Signed URLs](https://supabase.com/docs/guides/storage/security/signed-urls)

---

## 💡 Best Practices

1. **Use public buckets** for public documents
2. **Use signed URLs** for private documents
3. **Direct URL access** when possible
4. **API redirect** as fallback
5. **Detailed logging** for debugging
6. **Multiple fallbacks** for reliability

---

Download dari Supabase sekarang bekerja dengan baik! ✅
