# Form Development Quick Start

## 🚀 Quick Reference for Creating New Forms

This is a condensed guide for quickly creating new forms following the SKTM pattern.

---

## Step 1: Review Reference Materials

**MUST READ FIRST:**
- `documentation/FORM_SKTM_REFERENCE_GUIDE.md` - Complete reference
- `src/app/form-surat/sktm/page.tsx` - Form implementation
- `src/app/preview-sktm/page.tsx` - Preview implementation

---

## Step 2: Create Form Page

### File Structure
```
src/app/form-surat/[form-name]/
└── page.tsx
```

### Essential Imports
```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FileText, User, MapPin, AlertCircle, Eye } from 'lucide-react';
import { getKelurahanDataFromUser, mockAuth } from '@/lib/mockData';
```

### Required Interfaces
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
  // Add your specific fields here
  nama_pejabat: string;
  nip_pejabat: string;
  jabatan: string;
}
```

### State Setup
```tsx
const router = useRouter();
const kelurahanData = getKelurahanDataFromUser();
const currentUser = mockAuth.getCurrentUser();

const [formData, setFormData] = useState<FormData>({
  nomor_surat: '',
  kelurahan: kelurahanData?.nama || 'Cibodas',
  kecamatan: kelurahanData?.kecamatan || '',
  kota_kabupaten: kelurahanData?.kota || '',
  alamat_kelurahan: kelurahanData?.alamat || '',
  nama_pejabat: '',
  nip_pejabat: '',
  jabatan: '',
});

const [isLoadingPejabat, setIsLoadingPejabat] = useState(true);
const [pejabatError, setPejabatError] = useState<string | null>(null);
const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');
```

### Fetch Pejabat (Copy from SKTM)
```tsx
useEffect(() => {
  const fetchPejabat = async () => {
    if (!currentUser?.id) {
      setPejabatError('Anda harus login terlebih dahulu');
      setIsLoadingPejabat(false);
      return;
    }

    try {
      setIsLoadingPejabat(true);
      setPejabatError(null);

      const response = await fetch(`/api/pejabat/active?userId=${currentUser.id}`);
      const data = await response.json();

      if (!response.ok) {
        setPejabatError(data.error || 'Gagal mengambil data pejabat');
        setIsLoadingPejabat(false);
        return;
      }

      if (data.success && data.pejabat) {
        setPejabatList(data.pejabat);

        if (data.pejabat.length > 0) {
          const firstPejabat = data.pejabat[0];
          setSelectedPejabatId(firstPejabat.id.toString());
          setFormData(prev => ({
            ...prev,
            nama_pejabat: firstPejabat.nama,
            nip_pejabat: firstPejabat.nip || '',
            jabatan: firstPejabat.jabatan,
          }));
        }
      }

      setIsLoadingPejabat(false);
    } catch (error) {
      console.error('Error fetching pejabat:', error);
      setPejabatError('Terjadi kesalahan saat mengambil data pejabat. Hubungi admin.');
      setIsLoadingPejabat(false);
    }
  };

  fetchPejabat();
}, []);
```

### Event Handlers
```tsx
const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handlePejabatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const pejabatId = e.target.value;
  setSelectedPejabatId(pejabatId);

  if (pejabatId) {
    const selectedPejabat = pejabatList.find(p => p.id.toString() === pejabatId);
    if (selectedPejabat) {
      setFormData(prev => ({
        ...prev,
        nama_pejabat: selectedPejabat.nama,
        nip_pejabat: selectedPejabat.nip || '',
        jabatan: selectedPejabat.jabatan,
      }));
    }
  } else {
    setFormData(prev => ({
      ...prev,
      nama_pejabat: '',
      nip_pejabat: '',
      jabatan: '',
    }));
  }
};

const handlePreview = async () => {
  if (pejabatError) {
    alert(pejabatError);
    return;
  }

  if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
    alert('Data pejabat penandatangan tidak lengkap.');
    return;
  }

  // Save to sessionStorage
  sessionStorage.setItem('form_name_preview_data', JSON.stringify(formData));

  // Navigate to preview
  router.push('/preview-form-name');
};
```

---

## Step 3: Create Preview Page

### File Structure
```
src/app/preview-[form-name]/
└── page.tsx
```

### Load Data from sessionStorage
```tsx
useEffect(() => {
  const savedData = sessionStorage.getItem('form_name_preview_data');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    setFormData(parsed);
    fetchPreviewHTML(parsed);
  } else {
    router.push('/form-surat/form-name');
  }
}, [router]);
```

### Fetch HTML Preview
```tsx
const fetchPreviewHTML = async (data: FormData) => {
  try {
    setIsLoadingPreview(true);
    const response = await fetch('/api/preview-form-name-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success) {
      setHtmlContent(result.html);
    }
    setIsLoadingPreview(false);
  } catch (error) {
    console.error('Error fetching preview:', error);
    setIsLoadingPreview(false);
  }
};
```

---

## Step 4: Create API Routes

### Preview HTML Route
```
src/app/api/preview-[form-name]-html/
└── route.ts
```

```tsx
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validate pejabat data
    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
      return NextResponse.json(
        { error: 'Data pejabat penandatangan tidak lengkap.' },
        { status: 400 }
      );
    }

    // Get additional data from database if needed
    let alamatKelurahan = formData.alamat_kelurahan || '';
    if (formData.kelurahan) {
      const kelurahanResult = await db.query(
        'SELECT alamat FROM kelurahan WHERE LOWER(nama) = LOWER($1) LIMIT 1',
        [formData.kelurahan]
      );
      if (kelurahanResult.rows.length > 0) {
        alamatKelurahan = kelurahanResult.rows[0].alamat;
      }
    }

    // Generate HTML template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Form Name - ${formData.nama_pemohon}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 20mm; font-family: 'Times New Roman', serif; }
          /* Add your styles */
        </style>
      </head>
      <body>
        <!-- Your HTML content -->
      </body>
      </html>
    `;

    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Process PDF Route
```
src/app/api/process-[form-name]/
└── route.ts
```

```tsx
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const formData = await request.json();

    // Validate
    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
      return NextResponse.json(
        { error: 'Data pejabat penandatangan tidak lengkap.' },
        { status: 400 }
      );
    }

    // Generate HTML (same as preview route)
    const html = `...`;

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    await browser.close();

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="FormName_${formData.nama_pemohon}.pdf"`,
      },
    });
  } catch (error) {
    if (browser) await browser.close();
    console.error('Error processing form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Quick Checklist

### Form Page
- [ ] Copy structure from SKTM
- [ ] Update FormData interface
- [ ] Implement pejabat selection
- [ ] Add all form sections
- [ ] Validate before preview
- [ ] Save to sessionStorage

### Preview Page
- [ ] Load from sessionStorage
- [ ] Fetch HTML preview
- [ ] Show loading state
- [ ] Add download buttons
- [ ] Add save to database

### API Routes
- [ ] Create preview-html route
- [ ] Create process route
- [ ] Validate pejabat data
- [ ] Generate HTML template
- [ ] Handle errors

### Testing
- [ ] Test form submission
- [ ] Test preview generation
- [ ] Test PDF download
- [ ] Test with different roles (admin/staff)
- [ ] Test error scenarios

---

## 📖 Full Documentation

For complete details, see:
- [FORM_SKTM_REFERENCE_GUIDE.md](./FORM_SKTM_REFERENCE_GUIDE.md)
- [PROJECT_RULES.md](./PROJECT_RULES.md)

---

**Last Updated**: October 15, 2025
