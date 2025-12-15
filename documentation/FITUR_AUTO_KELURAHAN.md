# Fitur Auto-Fill Data Kelurahan

## 📋 Deskripsi

Fitur ini secara otomatis mengisi placeholder `{kelurahan}` dan `{alamat_kelurahan}` di template SKTM berdasarkan akun staff yang sedang login.

## 🎯 Tujuan

- Memastikan data kelurahan dan alamat kantor kelurahan terisi otomatis dan akurat
- Mencegah kesalahan input manual
- Mempercepat proses pengisian form
- Setiap kelurahan memiliki data yang konsisten

## 🗂️ Data Kelurahan

### Kelurahan yang Tersedia

| Nama Kelurahan | Alamat Kantor | Lurah | NIP |
|----------------|---------------|-------|-----|
| **Cibodas** | Jl. Raya Cibodas No. 45, Cibodas | Drs. H. Ahmad Suryadi, M.Si | 196501011990031001 |
| **Cibodas Baru** | Jl. Merdeka No. 123, Cibodas Baru | H. Bambang Hermanto, S.Sos | 196702121991031002 |
| **Panunggangan Barat** | Jl. Panunggangan Raya No. 88 | Dra. Hj. Siti Maryam, M.M | 196803151992032001 |
| **Cibodasari** | Jl. Cibodasari Utara No. 56 | H. Yusuf Hidayat, S.IP | 196904201993031003 |
| **Uwung Jaya** | Jl. Uwung Jaya No. 77 | Drs. H. Rahmat Hidayat | 197005101994031001 |
| **Jatiuwung** | Jl. Jatiuwung Raya No. 99 | Hj. Nurhayati, S.Sos, M.Si | 197106151995032001 |

### Data Tambahan per Kelurahan

Setiap kelurahan memiliki data lengkap:
- **Nama**: Nama kelurahan (tanpa prefix "Kelurahan")
- **Alamat**: Alamat lengkap kantor kelurahan
- **Kecamatan**: Cibodas (semua kelurahan di Kecamatan Cibodas)
- **Kota**: Kota Tangerang
- **Kode Pos**: Unik per kelurahan (15138-15146)
- **Telepon**: Nomor telepon kantor kelurahan
- **Lurah**: Nama lurah/kepala kelurahan
- **NIP Lurah**: NIP lurah

## 🔧 Implementasi

### 1. Mock Data (`src/lib/mockData.ts`)

```typescript
export interface KelurahanData {
  nama: string;
  alamat: string;
  kecamatan: string;
  kota: string;
  kodePos: string;
  telepon: string;
  lurah: string;
  nipLurah: string;
}

export const dataKelurahan: Record<string, KelurahanData> = {
  'Kelurahan Cibodas': {
    nama: 'Cibodas',
    alamat: 'Jl. Raya Cibodas No. 45, Cibodas',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15138',
    telepon: '(021) 5523456',
    lurah: 'Drs. H. Ahmad Suryadi, M.Si',
    nipLurah: '196501011990031001',
  },
  // ... data kelurahan lainnya
};
```

### 2. Helper Functions

```typescript
// Get data kelurahan berdasarkan nama
export const getKelurahanData = (namaKelurahan?: string): KelurahanData | null

// Get data kelurahan dari user yang login
export const getKelurahanDataFromUser = (): KelurahanData | null
```

### 3. Form SKTM (`src/app/form-surat/sktm/page.tsx`)

**Auto-fill saat component mount:**
```typescript
const kelurahanData = getKelurahanDataFromUser();

useEffect(() => {
  if (kelurahanData) {
    setFormData(prev => ({
      ...prev,
      kelurahan: kelurahanData.nama,
      alamat_kelurahan: kelurahanData.alamat,
      kecamatan: kelurahanData.kecamatan,
      kota_kabupaten: kelurahanData.kota,
      nama_pejabat: kelurahanData.lurah,
      nip_pejabat: kelurahanData.nipLurah,
      jabatan: `Lurah ${kelurahanData.nama}`,
    }));
  }
}, [kelurahanData]);
```

### 4. API Route (`src/app/api/generate-sktm/route.ts`)

Menambahkan placeholder baru:
```typescript
const templateData = {
  // ... field lainnya
  kelurahan: formData.kelurahan || 'Cibodas',
  alamat_kelurahan: formData.alamat_kelurahan || '',
  // ... field lainnya
};
```

## 📝 Field yang Terisi Otomatis

Ketika staff login, field berikut akan terisi otomatis:

| Field Form | Sumber Data | Editable |
|------------|-------------|----------|
| `kelurahan` | `kelurahanData.nama` | ❌ Read-only |
| `alamat_kelurahan` | `kelurahanData.alamat` | ❌ Read-only |
| `kecamatan` | `kelurahanData.kecamatan` | ❌ Read-only |
| `kota_kabupaten` | `kelurahanData.kota` | ❌ Read-only |
| `nama_pejabat` | `kelurahanData.lurah` | ✅ Editable |
| `nip_pejabat` | `kelurahanData.nipLurah` | ✅ Editable |
| `jabatan` | `"Lurah " + kelurahanData.nama` | ✅ Editable |

## 🎨 UI/UX

### Field Read-Only
Field yang auto-fill memiliki:
- Background abu-abu (`bg-gray-50`)
- Atribut `readOnly`
- Helper text: "Otomatis terisi sesuai akun login"

### Contoh Tampilan
```
┌─────────────────────────────────────┐
│ Kelurahan *                         │
│ ┌─────────────────────────────────┐ │
│ │ Cibodas                         │ │ (read-only, bg-gray)
│ └─────────────────────────────────┘ │
│ Otomatis terisi sesuai akun login   │
└─────────────────────────────────────┘
```

## 🧪 Testing

### Skenario Test

**1. Login sebagai Staff Kelurahan Cibodas**
```
Email: staffkelcibodas@cibodas.go.id
Password: password123

Expected:
- kelurahan: "Cibodas"
- alamat_kelurahan: "Jl. Raya Cibodas No. 45, Cibodas"
- nama_pejabat: "Drs. H. Ahmad Suryadi, M.Si"
- nip_pejabat: "196501011990031001"
```

**2. Login sebagai Staff Kelurahan Cibodas Baru**
```
Email: staffkelcbb@cibodas.go.id
Password: password123

Expected:
- kelurahan: "Cibodas Baru"
- alamat_kelurahan: "Jl. Merdeka No. 123, Cibodas Baru"
- nama_pejabat: "H. Bambang Hermanto, S.Sos"
- nip_pejabat: "196702121991031002"
```

**3. Generate Data Contoh**
- Klik tombol "Generate Data Contoh"
- Data kelurahan tetap sesuai akun login
- Data pemohon terisi dengan data sample

## 📄 Template SKTM.docx

### Placeholder yang Digunakan

```
{kelurahan} - Nama kelurahan (contoh: "Cibodas")
{alamat_kelurahan} - Alamat kantor kelurahan (contoh: "Jl. Raya Cibodas No. 45, Cibodas")
```

### Contoh Penggunaan di Template

```
PEMERINTAH KOTA TANGERANG
KECAMATAN CIBODAS
KELURAHAN {kelurahan}
{alamat_kelurahan}
Telepon: (021) 5523456

SURAT KETERANGAN TIDAK MAMPU
Nomor: {nomor_surat}

Yang bertanda tangan di bawah ini, Lurah {kelurahan}, menerangkan bahwa:
...
```

## 🔄 Alur Kerja

```
1. User Login
   ↓
2. Sistem identifikasi kelurahan dari user.kelurahan
   ↓
3. Ambil data dari dataKelurahan[user.kelurahan]
   ↓
4. Form SKTM dibuka
   ↓
5. useEffect() trigger
   ↓
6. Auto-fill field kelurahan, alamat_kelurahan, dll
   ↓
7. User isi data pemohon
   ↓
8. Submit form
   ↓
9. API generate dokumen dengan placeholder terisi
   ↓
10. Download dokumen SKTM
```

## ⚙️ Konfigurasi

### Menambah Kelurahan Baru

Edit file `src/lib/mockData.ts`:

```typescript
export const dataKelurahan: Record<string, KelurahanData> = {
  // ... kelurahan existing
  
  'Kelurahan Baru': {
    nama: 'Kelurahan Baru',
    alamat: 'Jl. Alamat Baru No. 1',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15147',
    telepon: '(021) 5523462',
    lurah: 'Nama Lurah Baru',
    nipLurah: '199999999999999999',
  },
};
```

Tambahkan user baru:

```typescript
export const mockUsers: User[] = [
  // ... users existing
  
  {
    id: '9',
    email: 'staffkelbaru@cibodas.go.id',
    name: 'Staff Kelurahan Baru',
    role: 'staff',
    kelurahan: 'Kelurahan Baru',
    created_at: '2024-02-26T00:00:00Z',
  },
];
```

## 🐛 Troubleshooting

### Field tidak terisi otomatis

**Penyebab:**
- User belum login
- User tidak memiliki field `kelurahan`
- Nama kelurahan di user tidak ada di `dataKelurahan`

**Solusi:**
1. Pastikan user sudah login
2. Cek `localStorage.getItem('currentUser')`
3. Pastikan `user.kelurahan` sesuai dengan key di `dataKelurahan`

### Data tidak sesuai

**Penyebab:**
- Data di `dataKelurahan` salah
- Nama kelurahan tidak match

**Solusi:**
1. Cek data di `src/lib/mockData.ts`
2. Pastikan key di `dataKelurahan` exact match dengan `user.kelurahan`

## 📊 Statistik

- **Total Kelurahan**: 6
- **Field Auto-fill**: 7 field
- **Field Read-only**: 4 field
- **Placeholder Template**: 2 placeholder baru

## 🎯 Manfaat

✅ **Konsistensi Data**: Setiap kelurahan memiliki data yang sama untuk setiap dokumen
✅ **Efisiensi**: Staff tidak perlu input manual data kelurahan
✅ **Akurasi**: Mengurangi human error
✅ **Otomatis**: Data terisi saat form dibuka
✅ **User-Friendly**: Field read-only dengan visual yang jelas

## 📝 Catatan

- Data kelurahan bersifat mock/dummy untuk development
- Untuk production, data harus diambil dari database
- Pastikan template SKTM.docx sudah memiliki placeholder `{kelurahan}` dan `{alamat_kelurahan}`
