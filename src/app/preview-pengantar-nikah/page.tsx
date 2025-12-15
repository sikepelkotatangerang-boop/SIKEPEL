'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Download, Loader2, CheckCircle, XCircle, FileText, AlertTriangle, Printer } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

export default function PreviewPengantarNikahPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [includePernyataan, setIncludePernyataan] = useState(false);

  const currentUser = mockAuth.getCurrentUser();

  useEffect(() => {
    const savedData = localStorage.getItem('pengantarNikahFormData');
    if (!savedData) {
      router.push('/form-surat/pengantar-nikah');
      return;
    }

    const data = JSON.parse(savedData);
    setFormData(data);
    loadPreview(data);
  }, [router]);

  const loadPreview = async (data: any) => {
    try {
      setIsLoadingPreview(true);
      setError(null);

      const response = await fetch('/api/preview-pengantar-nikah-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memuat preview');
      }

      const html = await response.text();
      setHtmlPreview(html);
    } catch (err) {
      console.error('Error loading preview:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleProcessAndSave = async () => {
    if (!formData) {
      setError('Data tidak ditemukan');
      return;
    }

    const confirmMessage = includePernyataan
      ? 'Apakah Anda yakin data sudah benar?\n\n' +
      'Dokumen yang akan dibuat:\n' +
      '✓ N1.docx (Pengantar Nikah)\n' +
      '✓ PERNYATAANNIKAH.docx (Surat Pernyataan)\n\n' +
      'Kedua dokumen akan dikonversi ke PDF, disimpan ke Supabase Storage, dan dicatat dalam database.'
      : 'Apakah Anda yakin data sudah benar?\n\n' +
      'Dokumen akan dikonversi ke PDF menggunakan ConvertAPI (template N1.docx), disimpan ke Supabase Storage, dan dicatat dalam database.';

    const confirmed = confirm(confirmMessage);

    if (!confirmed) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/process-pengantar-nikah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          userId: currentUser?.id,
          includePernyataan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memproses dokumen');
      }

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const jsonData = await response.json();

        if (jsonData.documents && Array.isArray(jsonData.documents)) {
          for (const doc of jsonData.documents) {
            const binaryString = atob(doc.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: doc.type });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Pengantar_Nikah_${formData.nama_pemohon?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setSuccess(true);
      localStorage.removeItem('pengantarNikahFormData');

      const successMessage = includePernyataan
        ? 'Dokumen Pengantar Nikah berhasil dibuat!\n\n' +
        '✓ N1.docx - PDF telah diunduh\n' +
        '✓ PERNYATAANNIKAH.docx - PDF telah diunduh\n' +
        '✓ Disimpan ke Supabase Storage\n' +
        '✓ Tercatat dalam database\n\n' +
        'Anda dapat melihat dokumen di menu Daftar Surat.'
        : 'Dokumen Pengantar Nikah berhasil dibuat!\n\n' +
        '✓ PDF telah diunduh (ConvertAPI + N1.docx)\n' +
        '✓ Disimpan ke Supabase Storage\n' +
        '✓ Tercatat dalam database\n\n' +
        'Anda dapat melihat dokumen di menu Daftar Surat.';

      alert(successMessage);
      router.push('/daftar-surat');
    } catch (err) {
      console.error('Error processing Pengantar Nikah:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    router.push('/form-surat/pengantar-nikah');
  };

  if (!formData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview Pengantar Nikah</h1>
            <p className="text-sm text-gray-600 mt-1">
              Periksa kembali data sebelum mencetak surat
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={isProcessing}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Edit Data
          </Button>
        </div>

        {/* Warning Banner */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Preview HTML - Hanya untuk Verifikasi Data
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Tampilan di bawah ini adalah <strong>preview HTML</strong> untuk memastikan kebenaran data.
                  Hasil cetak akhir (PDF) akan menggunakan template resmi <strong>N1.docx</strong> yang lebih rapi
                  dan sesuai standar format surat dinas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Terjadi Kesalahan</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Berhasil!</h3>
              <p className="text-sm text-green-700 mt-1">
                Dokumen berhasil dibuat dan diunduh. Mengalihkan ke Daftar Surat...
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Options */}
          <div className="lg:col-span-1 space-y-6">
            {/* Document Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-600" />
                  Pilih Dokumen
                </h3>

                <div className="space-y-3">
                  <label className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${!includePernyataan
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="documentOption"
                      checked={!includePernyataan}
                      onChange={() => setIncludePernyataan(false)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">N1 saja</div>
                      <p className="text-xs text-gray-600 mt-1">
                        Surat Pengantar Nikah (Model N1)
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${includePernyataan
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="documentOption"
                      checked={includePernyataan}
                      onChange={() => setIncludePernyataan(true)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">N1 + Pernyataan</div>
                      <p className="text-xs text-gray-600 mt-1">
                        Pengantar Nikah + Surat Pernyataan Belum Menikah
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Tindakan</h3>

                <Button
                  onClick={handleProcessAndSave}
                  disabled={isProcessing || isLoadingPreview}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md mb-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak & Selesai
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleEdit}
                  disabled={isProcessing}
                  className="w-full"
                >
                  Edit Data
                </Button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Dokumen akan diunduh sebagai PDF dan tersimpan otomatis di database.
                </p>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardContent className="p-6">
                <div className="text-xs text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Informasi Sistem
                  </p>
                  <p>• Menggunakan Template N1 resmi</p>
                  <p>• ConvertAPI untuk hasil PDF berkualitas</p>
                  <p>• Tanda tangan elektronik (QRCode) siap</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0 overflow-hidden">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-pink-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Memuat preview dokumen...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 min-h-[800px]">
                    <div className="bg-white shadow-lg mx-auto max-w-[210mm]">
                      <iframe
                        srcDoc={htmlPreview}
                        className="w-full border-0"
                        style={{ height: '1100px' }}
                        title="Preview Pengantar Nikah"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
