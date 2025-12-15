# Auto-Generate Nomor Surat

## 📋 Overview

Sistem auto-generate nomor surat berdasarkan nomor terakhir di database + 1 untuk setiap jenis dokumen.

---

## 🎯 Format Nomor Surat

| Jenis Dokumen | Format | Example |
|---------------|--------|---------|
| **SKTM** | `B/(nomor)/400.3.8.8/(bulan romawi)/(tahun)` | `B/001/400.3.8.8/X/2025` |
| **Belum Memiliki Rumah** | `648/(nomor)/(bulan romawi)/(tahun)` | `648/001/X/2025` |
| **Keterangan Suami Istri** | `B/(nomor)/400.8.2.7/(bulan romawi)/(tahun)` | `B/001/400.8.2.7/X/2025` |

---

## 🔧 Implementation

### 1. **API Generate Nomor Surat** (`/api/generate-nomor-surat/route.ts`)

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jenisDokumen = searchParams.get('jenis');
  const kelurahanId = searchParams.get('kelurahanId');

  // Get current date info
  const now = new Date();
  const tahun = now.getFullYear();
  const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now.getMonth()];

  // Get last nomor surat from database
  const query = `
    SELECT nomor_surat 
    FROM document_archives 
    WHERE jenis_dokumen = $1
    AND kelurahan_id = $2
    ORDER BY created_at DESC 
    LIMIT 1
  `;

  const result = await db.query(query, [jenisDokumen, kelurahanId]);

  let nomorUrut = 1; // Default start from 1

  if (result.rows.length > 0) {
    const lastNomorSurat = result.rows[0].nomor_surat;
    
    // Extract nomor urut based on document type
    if (jenisDokumen === 'SKTM') {
      // Format: B/(nomor)/400.3.8.8/(bulan)/(tahun)
      const match = lastNomorSurat.match(/^B\/(\d+)\/400\.3\.8\.8\//);
      if (match) {
        nomorUrut = parseInt(match[1], 10) + 1;
      }
    } else if (jenisDokumen === 'Belum Memiliki Rumah') {
      // Format: 648/(nomor)/(bulan)/(tahun)
      const match = lastNomorSurat.match(/^648\/(\d+)\//);
      if (match) {
        nomorUrut = parseInt(match[1], 10) + 1;
      }
    } else if (jenisDokumen === 'Keterangan Suami Istri') {
      // Format: B/(nomor)/400.8.2.7/(bulan)/(tahun)
      const match = lastNomorSurat.match(/^B\/(\d+)\/400\.8\.2\.7\//);
      if (match) {
        nomorUrut = parseInt(match[1], 10) + 1;
      }
    }
  }

  // Format nomor urut with leading zeros (3 digits)
  const nomorUrutFormatted = nomorUrut.toString().padStart(3, '0');

  // Generate nomor surat based on document type
  let nomorSurat = '';
  
  switch (jenisDokumen) {
    case 'SKTM':
      nomorSurat = `B/${nomorUrutFormatted}/400.3.8.8/${bulanRomawi}/${tahun}`;
      break;
    case 'Belum Memiliki Rumah':
      nomorSurat = `648/${nomorUrutFormatted}/${bulanRomawi}/${tahun}`;
      break;
    case 'Keterangan Suami Istri':
      nomorSurat = `B/${nomorUrutFormatted}/400.8.2.7/${bulanRomawi}/${tahun}`;
      break;
  }

  return NextResponse.json({
    success: true,
    nomorSurat,
    nomorUrut,
    bulanRomawi,
    tahun
  });
}
```

---

### 2. **Form Integration**

#### **SKTM** (`/form-surat/sktm/page.tsx`)

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
}, [currentUser]);
```

#### **Field Nomor Surat (Read-Only)**

```tsx
<Input
  type="text"
  name="nomor_surat"
  value={formData.nomor_surat}
  placeholder="Auto-generate..."
  required
  readOnly
  className="bg-gray-50"
/>
<p className="text-xs text-gray-500 mt-1">
  Nomor surat otomatis berdasarkan database
</p>
```

---

## 📊 Logic Flow

```
1. User membuka form
   ↓
2. useEffect triggered on component mount
   ↓
3. Call API: /api/generate-nomor-surat?jenis=SKTM&kelurahanId=1
   ↓
4. API queries database untuk nomor terakhir
   ↓
   Query: SELECT nomor_surat FROM document_archives 
          WHERE jenis_dokumen = 'SKTM' 
          AND kelurahan_id = 1
          ORDER BY created_at DESC LIMIT 1
   ↓
5. Extract nomor urut dari nomor terakhir
   ↓
   Last: "B/005/400.3.8.8/X/2025"
   Extract: 005
   New: 005 + 1 = 006
   ↓
6. Generate nomor baru dengan format
   ↓
   Format: B/(nomor)/400.3.8.8/(bulan)/(tahun)
   Result: "B/006/400.3.8.8/X/2025"
   ↓
7. Return ke form dan set ke state
   ↓
8. Field nomor_surat auto-filled (read-only)
```

---

## 🔍 Regex Patterns

### **SKTM**
```typescript
// Format: B/(nomor)/400.3.8.8/(bulan)/(tahun)
const match = lastNomorSurat.match(/^B\/(\d+)\/400\.3\.8\.8\//);
// Example: "B/005/400.3.8.8/X/2025" → Extract: "005"
```

### **Belum Memiliki Rumah**
```typescript
// Format: 648/(nomor)/(bulan)/(tahun)
const match = lastNomorSurat.match(/^648\/(\d+)\//);
// Example: "648/010/X/2025" → Extract: "010"
```

### **Keterangan Suami Istri**
```typescript
// Format: B/(nomor)/400.8.2.7/(bulan)/(tahun)
const match = lastNomorSurat.match(/^B\/(\d+)\/400\.8\.2\.7\//);
// Example: "B/003/400.8.2.7/X/2025" → Extract: "003"
```

---

## 📝 Examples

### **Example 1: SKTM - First Document**

**Database State:**
```
No records for SKTM in kelurahan_id = 1
```

**API Response:**
```json
{
  "success": true,
  "nomorSurat": "B/001/400.3.8.8/X/2025",
  "nomorUrut": 1,
  "bulanRomawi": "X",
  "tahun": 2025
}
```

---

### **Example 2: SKTM - Increment**

**Database State:**
```
Last nomor_surat: "B/005/400.3.8.8/X/2025"
```

**API Process:**
```
1. Extract: 005
2. Increment: 005 + 1 = 006
3. Format: 006 → "006" (padStart 3 digits)
4. Generate: B/006/400.3.8.8/X/2025
```

**API Response:**
```json
{
  "success": true,
  "nomorSurat": "B/006/400.3.8.8/X/2025",
  "nomorUrut": 6,
  "bulanRomawi": "X",
  "tahun": 2025
}
```

---

### **Example 3: Belum Memiliki Rumah**

**Database State:**
```
Last nomor_surat: "648/099/IX/2025"
```

**API Process:**
```
1. Extract: 099
2. Increment: 099 + 1 = 100
3. Format: 100 → "100"
4. Generate: 648/100/X/2025
```

**API Response:**
```json
{
  "success": true,
  "nomorSurat": "648/100/X/2025",
  "nomorUrut": 100,
  "bulanRomawi": "X",
  "tahun": 2025
}
```

---

### **Example 4: Keterangan Suami Istri**

**Database State:**
```
Last nomor_surat: "B/012/400.8.2.7/IX/2025"
```

**API Process:**
```
1. Extract: 012
2. Increment: 012 + 1 = 013
3. Format: 013 → "013"
4. Generate: B/013/400.8.2.7/X/2025
```

**API Response:**
```json
{
  "success": true,
  "nomorSurat": "B/013/400.8.2.7/X/2025",
  "nomorUrut": 13,
  "bulanRomawi": "X",
  "tahun": 2025
}
```

---

## 🎯 Features

### ✅ **Auto-Increment**
- Nomor urut otomatis bertambah berdasarkan database
- Tidak perlu input manual

### ✅ **Per Kelurahan**
- Setiap kelurahan punya counter sendiri
- Filter by `kelurahan_id`

### ✅ **Format Konsisten**
- Nomor urut selalu 3 digit (001, 002, ..., 999)
- Format sesuai standar masing-masing dokumen

### ✅ **Bulan & Tahun Otomatis**
- Bulan romawi dari sistem (I-XII)
- Tahun dari sistem (2025, 2026, dst)

### ✅ **Read-Only Field**
- User tidak bisa edit nomor surat
- Prevent manual input errors

---

## ⚠️ Edge Cases

### **Case 1: No Previous Records**
```
Query result: []
→ Start from 001
```

### **Case 2: Invalid Format in Database**
```
Last nomor: "INVALID-FORMAT"
→ Regex match fails
→ Start from 001
```

### **Case 3: Number > 999**
```
Last nomor: 999
Next: 1000
Format: "1000" (no padding limit)
```

### **Case 4: Different Kelurahan**
```
Kelurahan A: B/050/400.3.8.8/X/2025
Kelurahan B: B/001/400.3.8.8/X/2025 (independent counter)
```

---

## 🔄 Data Flow Diagram

```
┌─────────────┐
│   User      │
│ Opens Form  │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│   useEffect()       │
│   on mount          │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   API Call                      │
│   /api/generate-nomor-surat     │
│   ?jenis=SKTM&kelurahanId=1     │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   Database Query                │
│   SELECT last nomor_surat       │
│   WHERE jenis_dokumen = 'SKTM'  │
│   AND kelurahan_id = 1          │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   Extract & Increment           │
│   "B/005/..." → 005 → 006       │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   Generate New Nomor            │
│   B/006/400.3.8.8/X/2025        │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   Return JSON Response          │
│   { nomorSurat: "B/006/..." }   │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   Update Form State             │
│   formData.nomor_surat = ...    │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   Display in Read-Only Field    │
│   User sees auto-generated #    │
└─────────────────────────────────┘
```

---

## 📁 Files Created/Modified

### **Created:**
1. ✅ `src/app/api/generate-nomor-surat/route.ts` - API endpoint

### **Modified:**
1. ✅ `src/app/form-surat/sktm/page.tsx` - Auto-generate + read-only field
2. ✅ `src/app/form-surat/belum-rumah/page.tsx` - Auto-generate + read-only field
3. ✅ `src/app/form-surat/suami-istri/page.tsx` - Auto-generate + read-only field

---

## 🎯 Summary

| Feature | Status |
|---------|--------|
| API Endpoint | ✅ Created |
| SKTM Integration | ✅ Done |
| Belum Memiliki Rumah Integration | ✅ Done |
| Keterangan Suami Istri Integration | ✅ Done |
| Read-Only Fields | ✅ Done |
| Auto-Increment Logic | ✅ Done |
| Per-Kelurahan Counter | ✅ Done |
| Format Validation | ✅ Done |

---

**Status:** ✅ Auto-generate nomor surat implemented for all 3 document types!
