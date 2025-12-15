'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Download, Edit, Loader2, CheckCircle } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

export default function PreviewBelumMenikahPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const currentUser = mockAuth.getCurrentUser();

  useEffect(() => {
    // Get form data from sessionStorage
    const storedData = sessionStorage.getItem('belumMenikahFormData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setFormData(data);
      loadPreview(data);
    } else {
      alert('Data tidak ditemukan. Silakan isi form terlebih dahulu.');
      router.push('/form-surat/belum-menikah');
    }
  }, [router]);

  const loadPreview = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/preview-belum-menikah-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat preview');
      }

      const html = await response.text();
      setPreviewHtml(html);
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Terjadi kesalahan saat membuat preview. Silakan coba lagi.');
      router.push('/form-surat/belum-menikah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // Kembali ke form dengan data yang sudah diisi
    router.push('/form-surat/belum-menikah');
  };

  const handleProcess = async () => {
    if (!formData) {
      alert('Data tidak ditemukan');
      return;
    }

    const confirmed = confirm(
      'Apakah Anda yakin data sudah benar?\n\n' +
      'Dokumen akan dikonversi ke PDF, disimpan ke Supabase Storage, dan dicatat dalam database.'
    );

    if (!confirmed) return;

    try {
      setIsProcessing(true);

      // Call API to process Belum Menikah
      const response = await fetch('/api/process-belum-menikah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          userId: currentUser?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);

        // Show detailed error to user
        const errorMessage = errorData.details
          ? `${errorData.error}\n\nDetail: ${errorData.details}`
          : errorData.error || 'Gagal memproses dokumen';

        throw new Error(errorMessage);
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Belum_Menikah_${formData.nama_pemohon.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Clear session storage
      sessionStorage.removeItem('belumMenikahFormData');

      // Show success message
      alert(
        'Dokumen Surat Keterangan Belum Menikah berhasil dibuat!\n\n' +
        '✓ PDF telah diunduh\n' +
        '✓ Disimpan ke Supabase Storage\n' +
        '✓ Tercatat dalam database\n\n' +
        'Anda dapat melihat dokumen di menu Daftar Surat.'
      );

      // Redirect to documents list
      router.push('/daftar-surat');
    } catch (error) {
      console.error('Error processing Belum Menikah:', error);
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Form
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Preview Dokumen Belum Menikah</h1>
              <p className="text-sm text-gray-600">
                Periksa kembali data sebelum menyimpan dokumen
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verifikasi Data</h3>
                  <p className="text-sm text-gray-600">
                    Pastikan semua data sudah benar sebelum melanjutkan
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  disabled={isProcessing}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Data
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Cetak & Selesai
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Memuat preview...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header Preview dengan Peringatan */}
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-b-2 border-yellow-400 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👁️</span>
                      <div>
                        <h4 className="font-bold text-gray-900">Preview HTML - Hanya untuk Verifikasi Data</h4>
                        <p className="text-xs text-gray-700">
                          Tampilan ini berbeda dengan PDF final. Periksa kebenaran DATA, bukan tampilan visual.
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-xs font-semibold text-orange-700 bg-orange-200 px-3 py-1 rounded-full">
                        BUKAN TAMPILAN PDF FINAL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="preview-container">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full border-0"
                    style={{ minHeight: '1000px' }}
                    title="Preview Belum Menikah"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
