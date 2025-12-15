# Alur Data Halaman Daftar Surat

## 📊 Database → API → Frontend

### 1. Database Layer (PostgreSQL)

**Tabel: `document_archives`**
```sql
CREATE TABLE document_archives (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(100) UNIQUE NOT NULL,
  jenis_dokumen VARCHAR(50) NOT NULL,
  tanggal_surat DATE NOT NULL,
  perihal TEXT NOT NULL,
  
  -- Subjek/Pemohon
  nik_subjek VARCHAR(16),
  nama_subjek VARCHAR(255) NOT NULL,
  alamat_subjek TEXT,
  
  -- File Storage
  file_name VARCHAR(255),              -- Nama file di Supabase Storage
  google_drive_id VARCHAR(255),        -- ID file di Google Drive (backup)
  google_drive_url TEXT,               -- URL file di Google Drive (backup)
  
  -- Relasi
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  pejabat_id INTEGER REFERENCES pejabat(id),
  created_by INTEGER REFERENCES users(id),
  
  -- Data Detail (JSONB)
  data_detail JSONB,                   -- Data spesifik per jenis dokumen
  
  -- Metadata
  status VARCHAR(20) DEFAULT 'active',
  search_vector tsvector,              -- Full-text search
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes untuk Performa:**
- `idx_doc_archives_nomor`: Index pada nomor_surat
- `idx_doc_archives_jenis`: Index pada jenis_dokumen
- `idx_doc_archives_nik`: Index pada nik_subjek
- `idx_doc_archives_nama`: Index pada nama_subjek
- `idx_doc_archives_kelurahan`: Index pada kelurahan_id
- `idx_doc_archives_search`: GIN index untuk full-text search

---

### 2. API Layer (Next.js API Routes)

**Endpoint: `GET /api/documents`**

**File:** `src/app/api/documents/route.ts`

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10)
- `search`: Kata kunci pencarian (nama, NIK, nomor surat, perihal)
- `jenisDokumen`: Filter jenis dokumen (SKTM, Domisili, Usaha, Kelahiran)
- `kelurahanId`: Filter berdasarkan kelurahan (untuk staff)
- `userId`: Filter berdasarkan pembuat
- `status`: Status dokumen (default: 'active')

**SQL Query:**
```sql
SELECT 
  da.*,
  u.name as created_by_name,
  k.nama as kelurahan_nama,
  p.nama as pejabat_nama
FROM document_archives da
LEFT JOIN users u ON da.created_by = u.id
LEFT JOIN kelurahan k ON da.kelurahan_id = k.id
LEFT JOIN pejabat p ON da.pejabat_id = p.id
WHERE status = 'active'
  AND (nama_subjek ILIKE '%search%' OR nik_subjek ILIKE '%search%' OR ...)
  AND jenis_dokumen = 'SKTM'  -- jika ada filter
  AND kelurahan_id = 1         -- jika staff
ORDER BY created_at DESC
LIMIT 10 OFFSET 0
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nomor_surat": "001/SKTM/2025",
      "jenis_dokumen": "SKTM",
      "tanggal_surat": "2025-10-13",
      "perihal": "Surat Keterangan Tidak Mampu",
      "nik_subjek": "1234567890123456",
      "nama_subjek": "John Doe",
      "alamat_subjek": "Jl. Contoh No. 123",
      "file_name": "sktm-001-2025.pdf",
      "google_drive_url": "https://drive.google.com/...",
      "kelurahan_nama": "Kelurahan A",
      "pejabat_nama": "Lurah A",
      "created_by_name": "Admin",
      "created_at": "2025-10-13T10:00:00Z",
      "data_detail": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 3. Frontend Layer (React/Next.js)

**File:** `src/app/daftar-surat/page.tsx`

**State Management:**
```typescript
const [documents, setDocuments] = useState<Document[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [filterJenis, setFilterJenis] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [total, setTotal] = useState(0);
const [stats, setStats] = useState({ ... });
```

**Data Fetching:**
```typescript
const loadDocuments = async () => {
  // 1. Build query parameters
  const params = new URLSearchParams({
    page: currentPage.toString(),
    limit: '10',
    search: searchTerm,
  });

  // 2. Add filters
  if (filterJenis) params.append('jenisDokumen', filterJenis);
  if (currentUser?.role === 'staff') {
    params.append('kelurahanId', currentUser.kelurahan_id.toString());
  }

  // 3. Fetch from API
  const response = await fetch(`/api/documents?${params}`);
  const data = await response.json();

  // 4. Update state
  if (data.success) {
    setDocuments(data.data);
    setTotalPages(data.pagination.totalPages);
    setTotal(data.pagination.total);
  }
};
```

**Auto-refresh on Changes:**
```typescript
useEffect(() => {
  loadDocuments();
  loadStats();
}, [currentPage, searchTerm, filterJenis]);
```

---

## 🔄 Alur Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│  - Buka halaman /daftar-surat                               │
│  - Ketik di search box                                       │
│  - Pilih filter jenis dokumen                               │
│  - Klik pagination                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                            │
│  File: src/app/daftar-surat/page.tsx                        │
│                                                              │
│  1. useEffect() triggered                                    │
│  2. loadDocuments() called                                   │
│  3. Build query params                                       │
│  4. fetch('/api/documents?...')                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  API ROUTE (Next.js)                         │
│  File: src/app/api/documents/route.ts                       │
│                                                              │
│  1. Parse query parameters                                   │
│  2. Build SQL WHERE conditions                               │
│  3. Execute query with db.query()                           │
│  4. Join with users, kelurahan, pejabat tables             │
│  5. Return JSON response                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                       │
│  Table: document_archives                                    │
│                                                              │
│  1. Execute SELECT query                                     │
│  2. Apply WHERE filters                                      │
│  3. JOIN with related tables                                 │
│  4. ORDER BY created_at DESC                                 │
│  5. LIMIT & OFFSET for pagination                           │
│  6. Return rows                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESPONSE FLOW                               │
│                                                              │
│  Database → API → Frontend                                   │
│                                                              │
│  1. Rows converted to JSON                                   │
│  2. Pagination metadata added                                │
│  3. State updated (setDocuments)                            │
│  4. UI re-renders with new data                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Fitur Pencarian & Filter

### Full-Text Search
Database menggunakan `tsvector` untuk pencarian cepat:
```sql
WHERE (
  nama_subjek ILIKE '%keyword%' OR 
  nik_subjek ILIKE '%keyword%' OR 
  nomor_surat ILIKE '%keyword%' OR
  perihal ILIKE '%keyword%'
)
```

### Filter Jenis Dokumen
```sql
WHERE jenis_dokumen = 'SKTM'
```

### Role-Based Filter
- **Admin**: Melihat semua dokumen
- **Staff**: Hanya dokumen dari kelurahan mereka
  ```sql
  WHERE kelurahan_id = {currentUser.kelurahan_id}
  ```

---

## 📦 Storage Integration

### Supabase Storage (Primary)
- Field: `file_name`
- Download: `/api/documents/download?fileName=...`
- Bucket: `documents`

### Google Drive (Backup)
- Field: `google_drive_url`
- Direct link untuk preview/download

---

## 🔐 Security

1. **Authentication**: Middleware check di `src/middleware.ts`
2. **Authorization**: Role-based filtering di API
3. **SQL Injection**: Parameterized queries dengan `$1, $2, ...`
4. **XSS Protection**: React auto-escaping

---

## ⚡ Performance Optimization

1. **Database Indexes**: Semua kolom yang sering di-query
2. **Pagination**: Limit 10 per halaman
3. **Lazy Loading**: Data dimuat saat dibutuhkan
4. **Debouncing**: Search input (bisa ditambahkan)
5. **Caching**: Browser cache untuk static assets

---

## 📝 Example Flow

**User Action:** Ketik "John" di search box

1. **Frontend**: `setSearchTerm('John')`
2. **useEffect**: Triggered karena `searchTerm` berubah
3. **API Call**: `GET /api/documents?search=John&page=1&limit=10`
4. **Database Query**:
   ```sql
   SELECT ... WHERE nama_subjek ILIKE '%John%' ...
   ```
5. **Response**: Array dokumen dengan nama mengandung "John"
6. **UI Update**: Tampilkan hasil pencarian

---

## 🛠️ Troubleshooting

### Data tidak muncul?
1. Cek koneksi database di `src/lib/db.ts`
2. Cek API response di browser DevTools Network tab
3. Cek console untuk error messages
4. Pastikan tabel `document_archives` ada dan berisi data

### Download tidak berfungsi?
1. Cek field `file_name` di database
2. Cek Supabase Storage credentials di `.env.local`
3. Cek bucket `documents` sudah dibuat
4. Cek file ada di storage

### Filter tidak bekerja?
1. Cek query parameters di URL
2. Cek SQL WHERE conditions di API
3. Cek state management di frontend
