'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  User,
  Eye,
  ArrowLeft,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { mockAuth, getKelurahanDataFromUser } from '@/lib/mockData';

interface FormData {
  // Data Pemohon (sesuai template)
  nama: string;
  nik: string;
  nomor_kk: string;
  nomor_handphone: string;
  email: string;
}

export default function FormPengantarKTPPage() {
  const router = useRouter();
  const currentUser = mockAuth.getCurrentUser();
  const kelurahanData = getKelurahanDataFromUser();

  const [formData, setFormData] = useState<FormData>({
    nama: '',
    nik: '',
    nomor_kk: '',
    nomor_handphone: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Removed: Fetch data pejabat (not needed for this form)

  // Removed kelurahan auto-fill (not needed for this form)

  // Removed auto-generate nomor surat (not needed for this form)

  // Restore data dari sessionStorage saat kembali dari preview
  useEffect(() => {
    const storedData = sessionStorage.getItem('pengantarKtpFormData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
        }));
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Removed: handlePejabatChange (not needed)

  const generateSampleData = () => {
    const sampleData = {
      ...formData,
      nama: 'Ahmad Rizki Pratama',
      nik: '3671012345678901',
      nomor_kk: '3671010101010001',
      nomor_handphone: '08123456789',
      email: 'ahmad.rizki@email.com',
    };
    setFormData(sampleData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simpan data ke sessionStorage untuk digunakan di halaman preview
    sessionStorage.setItem('pengantarKtpFormData', JSON.stringify(formData));

    // Redirect ke halaman preview
    router.push('/preview-pengantar-ktp');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                sessionStorage.removeItem('pengantarKtpFormData');
                router.push('/surat-keterangan');
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Formulir Pendaftaran Peristiwa Kependudukan
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                KK, KTP-el, KIA, dan Perubahan Data (PERMENDAGRI 109/2019)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={generateSampleData}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Isi Contoh Data
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Pemohon Perorangan */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">I. Data Pemohon Perorangan</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  placeholder="Ahmad Rizki Pratama"
                />
                <Input
                  label="NIK (Nomor Induk Kependudukan)"
                  name="nik"
                  value={formData.nik}
                  onChange={handleInputChange}
                  required
                  placeholder="3671012345678901"
                  maxLength={16}
                />
                <Input
                  label="Nomor Kartu Keluarga"
                  name="nomor_kk"
                  value={formData.nomor_kk}
                  onChange={handleInputChange}
                  required
                  placeholder="3671010101010001"
                  maxLength={16}
                />
                <Input
                  label="Nomor Handphone / WA (Opsional)"
                  name="nomor_handphone"
                  value={formData.nomor_handphone}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                />
                <Input
                  label="Alamat Email (Opsional)"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ahmad.rizki@email.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem('pengantarKtpFormData');
                router.push('/surat-keterangan');
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {isSubmitting ? 'Memproses...' : 'Preview Dokumen'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
