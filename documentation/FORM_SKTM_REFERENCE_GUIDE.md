# Form SKTM Reference Guide

## 🎯 Purpose
This document is the **master reference** for creating new forms. All new forms MUST follow the Form SKTM pattern for consistency.

## 📁 Reference Files

### Form Page
- **Path**: `src/app/form-surat/sktm/page.tsx`
- **Purpose**: Main form with all input fields and pejabat selection

### Preview Page  
- **Path**: `src/app/preview-sktm/page.tsx`
- **Purpose**: HTML preview with download and save options

### API Routes
- `src/app/api/preview-sktm-html/route.ts` - Generate HTML
- `src/app/api/process-sktm/route.ts` - Generate PDF (Puppeteer)

---

## 🎨 Design Pattern

### 1. Page Structure
```
DashboardLayout
  └─ Container (space-y-6)
      ├─ Header (Back button + Title + Sample Data button)
      ├─ Form
      │   ├─ Card: Data Surat
      │   ├─ Card: Data Pemohon
      │   ├─ Card: Alamat
      │   ├─ Card: Data Khusus (specific to form type)
      │   ├─ Card: Keperluan
      │   ├─ Card: Data Pejabat Penandatangan
      │   └─ Buttons (Batal + Preview)
      └─ ...
```

### 2. Card Section Template
```tsx
<Card>
  <CardContent className="p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
      <Icon className="w-5 h-5 mr-2 text-primary-600" />
      Section Title
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fields */}
    </div>
  </CardContent>
</Card>
```

### 3. Form Field Patterns

**Input with Label:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Label <span className="text-red-500">*</span>
  </label>
  <Input
    name="field_name"
    value={formData.field_name}
    onChange={handleInputChange}
    placeholder="Placeholder"
    required
  />
</div>
```

**Select Dropdown:**
```tsx
<select
  name="field_name"
  value={formData.field_name}
  onChange={handleInputChange}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
  required
>
  <option value="">Pilih opsi</option>
  <option value="opt1">Option 1</option>
</select>
```

**Textarea:**
```tsx
<textarea
  name="field_name"
  value={formData.field_name}
  onChange={handleInputChange}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
  rows={3}
  required
/>
```

---

## 💾 State Management

### Interfaces
```tsx
interface PejabatData {
  id: number;
  kelurahan_id: number;
  nama: string;
  nip: string | null;
  jabatan: string;
  is_active: boolean;
  created_at: Date;
  kelurahan_nama?: string;
}

interface FormData {
  nomor_surat: string;
  // ... all form fields
  nama_pejabat: string;
  nip_pejabat: string;
  jabatan: string;
}
```

### State Variables
```tsx
const router = useRouter();
const kelurahanData = getKelurahanDataFromUser();
const currentUser = mockAuth.getCurrentUser();

const [formData, setFormData] = useState<FormData>({...});
const [isLoadingPejabat, setIsLoadingPejabat] = useState(true);
const [pejabatError, setPejabatError] = useState<string | null>(null);
const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');
```

### Fetch Pejabat (useEffect)
```tsx
useEffect(() => {
  const fetchPejabat = async () => {
    if (!currentUser?.id) return;
    
    const response = await fetch(`/api/pejabat/active?userId=${currentUser.id}`);
    const data = await response.json();
    
    if (data.success && data.pejabat) {
      setPejabatList(data.pejabat);
      // Auto-select first pejabat
      if (data.pejabat.length > 0) {
        const first = data.pejabat[0];
        setSelectedPejabatId(first.id.toString());
        setFormData(prev => ({
          ...prev,
          nama_pejabat: first.nama,
          nip_pejabat: first.nip || '',
          jabatan: first.jabatan,
        }));
      }
    }
  };
  fetchPejabat();
}, []);
```

---

## 👤 Pejabat Selection UI

```tsx
<Card>
  <CardContent className="p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-4">
      Data Pejabat Penandatangan
    </h2>

    {/* Error Alert */}
    {pejabatError && (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800">Perhatian!</p>
          <p className="text-sm text-red-700 mt-1">{pejabatError}</p>
        </div>
      </div>
    )}

    {/* Loading */}
    {isLoadingPejabat && (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">Memuat data pejabat...</p>
      </div>
    )}

    {/* Dropdown */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pilih Pejabat Penandatangan <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedPejabatId}
        onChange={handlePejabatChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        required
        disabled={isLoadingPejabat || pejabatList.length === 0}
      >
        <option value="">-- Pilih Pejabat --</option>
        {pejabatList.map((pejabat) => (
          <option key={pejabat.id} value={pejabat.id}>
            {currentUser?.role === 'admin' && pejabat.kelurahan_nama
              ? `${pejabat.kelurahan_nama} - ${pejabat.nama} (${pejabat.jabatan})`
              : `${pejabat.nama} - ${pejabat.jabatan}`}
          </option>
        ))}
      </select>
    </div>

    {/* Detail Card */}
    {selectedPejabatId && (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Detail Pejabat:</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Nama:</span>
            <p className="font-medium">{formData.nama_pejabat}</p>
          </div>
          <div>
            <span className="text-gray-600">NIP:</span>
            <p className="font-medium">{formData.nip_pejabat || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">Jabatan:</span>
            <p className="font-medium">{formData.jabatan}</p>
          </div>
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

---

## 🔄 Workflow

```
Form Page → Preview Page → Download/Save
```

### Form Submission
```tsx
const handlePreview = async () => {
  // Validate pejabat data
  if (!formData.nama_pejabat || !formData.nip_pejabat) {
    alert('Data pejabat tidak lengkap');
    return;
  }

  // Save to sessionStorage
  sessionStorage.setItem('form_preview_data', JSON.stringify(formData));

  // Navigate to preview
  router.push('/preview-form');
};
```

### Preview Page Load
```tsx
useEffect(() => {
  const savedData = sessionStorage.getItem('form_preview_data');
  if (savedData) {
    setFormData(JSON.parse(savedData));
  } else {
    router.push('/form-surat/form-name');
  }
}, [router]);
```

---

## ✅ Checklist for New Forms

### Before Starting
- [ ] Review Form SKTM code (`src/app/form-surat/sktm/page.tsx`)
- [ ] Review Preview SKTM code (`src/app/preview-sktm/page.tsx`)
- [ ] Check API routes pattern

### Form Page
- [ ] Create folder: `src/app/form-surat/[form-name]/`
- [ ] Copy SKTM structure
- [ ] Update interfaces (PejabatData, FormData)
- [ ] Implement pejabat selection with dropdown
- [ ] Add all required form sections
- [ ] Use proper grid layouts (md:grid-cols-2, md:grid-cols-4)
- [ ] Add validation before preview
- [ ] Implement sessionStorage save

### Preview Page
- [ ] Create folder: `src/app/preview-[form-name]/`
- [ ] Load data from sessionStorage
- [ ] Generate HTML preview
- [ ] Implement two download options (Puppeteer + ConvertAPI)
- [ ] Add save to database functionality

### API Routes
- [ ] Create `/api/preview-[form-name]-html/route.ts`
- [ ] Create `/api/process-[form-name]/route.ts`
- [ ] Validate pejabat data
- [ ] Query database for additional data
- [ ] Generate proper HTML template
- [ ] Handle errors properly

### UI/UX
- [ ] Use Card components for sections
- [ ] Add icons to section headers
- [ ] Show loading states
- [ ] Display error messages with AlertCircle
- [ ] Add helper text for fields
- [ ] Mark required fields with red asterisk
- [ ] Make kelurahan fields read-only with bg-gray-50

### Testing
- [ ] Test pejabat selection (staff + admin roles)
- [ ] Test form validation
- [ ] Test preview generation
- [ ] Test PDF download (both methods)
- [ ] Test save to database
- [ ] Test with empty/invalid data

---

## 📚 Related Documentation

- [PROJECT_RULES.md](./PROJECT_RULES.md) - Project-wide rules
- [SETUP_SKTM_PREVIEW.md](./SETUP_SKTM_PREVIEW.md) - SKTM setup guide
- [PUPPETEER_QUICK_START.md](./PUPPETEER_QUICK_START.md) - Puppeteer guide
- [TWO_PRINT_OPTIONS_UI.md](./TWO_PRINT_OPTIONS_UI.md) - Print options

---

**Last Updated**: October 15, 2025
**Maintained By**: Development Team
