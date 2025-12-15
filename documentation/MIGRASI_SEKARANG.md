# 🚀 MIGRASI KE NEON - LANGKAH CEPAT

## ✅ Yang Sudah Selesai

1. ✅ Schema database sudah di-export
2. ✅ File migrasi sudah dibuat: `database/migrate-to-neon.sql`
3. ✅ Script helper sudah siap
4. ✅ Neon database sudah dibuat

---

## 🔧 LANGKAH YANG HARUS ANDA LAKUKAN SEKARANG

### **STEP 1: Update `.env.local`** ⚠️ WAJIB!

1. Buka file: `d:\Project\Kelurahan Cibodas\Pelayanan3\.env.local`

2. **Cari baris ini:**
   ```env
   DATABASE_URL=postgresql://postgres:xxx@db.giutqfeliytoaamcmqny.supabase.co:5432/postgres
   ```

3. **Ganti dengan:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. **Hapus atau comment baris ini (jika ada):**
   ```env
   # SUPABASE_DB_URL=postgresql://...
   ```

5. **SAVE** file `.env.local`

---

### **STEP 2: Import Schema ke Neon**

Jalankan command ini di terminal:

```powershell
node scripts/import-schema-to-neon.js
```

**Output yang diharapkan:**
```
✅ Connected!
✅ Schema file loaded
✅ Schema imported successfully!
📋 Created 8 tables:
   1. document_archives
   2. documents
   3. kelurahan
   4. notification_recipients
   5. notifications
   6. pejabat
   7. sktm_documents
   8. users
🎉 Migration completed successfully!
```

---

### **STEP 3: Test Koneksi**

```powershell
node scripts/test-neon-connection.js
```

**Output yang diharapkan:**
```
✅ Connection successful!
🗄️  PostgreSQL Version: PostgreSQL 16.x
📁 Current Database: neondb
📋 Tables in database:
   1. document_archives
   2. documents
   ...
✅ All tests passed!
```

---

### **STEP 4: Seed Data Awal**

```powershell
npm run db:setup
```

Ini akan membuat:
- Data kelurahan Cibodas
- User admin default
- Sample data untuk testing

---

### **STEP 5: Start Development Server**

```powershell
npm run dev
```

Buka browser: http://localhost:3000

---

## 🎯 Quick Commands (Copy-Paste)

Jalankan satu per satu:

```powershell
# 1. Import schema
node scripts/import-schema-to-neon.js

# 2. Test koneksi
node scripts/test-neon-connection.js

# 3. Seed data
npm run db:setup

# 4. Start app
npm run dev
```

---

## ❌ Troubleshooting

### Error: "still using Supabase connection string"
→ Anda belum update `.env.local`. Lihat STEP 1 di atas.

### Error: "ENOTFOUND"
→ Cek koneksi internet atau typo di connection string.

### Error: "password authentication failed"
→ Password salah di connection string. Copy ulang dari Neon dashboard.

### Error: "table already exists"
→ Schema sudah pernah di-import. Skip STEP 2, langsung ke STEP 3.

---

## 📞 Butuh Bantuan?

Jika ada error, screenshot error message dan tanyakan ke developer.

---

## 🎉 Setelah Migrasi Selesai

Database Anda sudah menggunakan Neon PostgreSQL!

**Keuntungan:**
- ✅ IPv4 support (tidak ada lagi error ENOTFOUND)
- ✅ Free tier 0.5 GB storage
- ✅ Auto-scaling
- ✅ Database branching
- ✅ Lebih cepat dan stabil

**Yang Berubah:**
- ❌ Tidak pakai Supabase Database lagi
- ✅ Masih bisa pakai Supabase untuk Auth/Storage (opsional)
- ✅ Custom auth dengan bcrypt tetap jalan

---

**MULAI DARI STEP 1 SEKARANG! 🚀**
