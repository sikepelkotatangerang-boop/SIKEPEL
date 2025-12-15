'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

export default function PreviewPindahKeluarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentUser = mockAuth.getCurrentUser();

  useEffect(() => {
    const savedData = sessionStorage.getItem('pindahKeluarFormData');
    if (!savedData) {
      router.push('/form-surat/pindah-keluar');
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

      console.log('🔄 Loading HTML preview...');

      const response = await fetch('/api/preview-pindah-keluar-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Gagal memuat preview');
      }

      const html = await response.text();
      setPreviewHtml(html);

      console.log('✅ HTML preview loaded successfully');
    } catch (err) {
      console.error('Error loading preview:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleProcess = async () => {
    if (!formData) {
      alert('Data tidak ditemukan');
      return;
    }

    const confirmed = confirm(
      'Apakah Anda yakin data sudah benar?\n\n' +
      'Dokumen akan dikonversi ke PDF dengan ConvertAPI (Template F-103.docx), ' +
      'disimpan ke Supabase Storage, dan dicatat dalam database.'
    );

    if (!confirmed) return;

    try {
      setIsProcessing(true);

      // Call API to process Pindah Keluar
      const response = await fetch('/api/process-pindah-keluar', {
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
        throw new Error(errorData.error || 'Gagal memproses dokumen');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pindah_Keluar_${formData.nama_pemohon.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Clear session storage
      sessionStorage.removeItem('pindahKeluarFormData');

      // Show success message
      alert(
        'Dokumen Surat Pindah Keluar berhasil dibuat!\n\n' +
        '✓ Konversi DOCX → PDF dengan ConvertAPI (F-103.docx)\n' +
        '✓ PDF telah diunduh\n' +
        '✓ Disimpan ke Supabase Storage\n' +
        '✓ Tercatat dalam database\n\n' +
        'Anda dapat melihat dokumen di Daftar Surat.'
      );

      // Redirect to daftar surat
      router.push('/daftar-surat');
    } catch (error) {
      console.error('Error processing Pindah Keluar:', error);
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push('/form-surat/pindah-keluar');
  };

  if (!formData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
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
            <h1 className="text-2xl font-bold text-gray-900">Preview Surat Pindah Keluar</h1>
            <p className="text-sm text-gray-600 mt-1">
              Periksa kembali data sebelum menyimpan dokumen
            </p>
          </div>
          <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
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
          {/* Left Column - Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Button */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Proses Dokumen</h3>
                <ul className="text-xs text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Template resmi (F-103.docx)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Konversi ke PDF (ConvertAPI)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Disimpan ke database</span>
                  </li>
                </ul>
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || isLoadingPreview}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Proses & Simpan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardContent className="p-6">
                <div className="text-xs text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-900">📄 HTML Preview</p>
                  <p>Preview ini menampilkan data form dalam format HTML.</p>
                  <p>Setelah klik &quot;Proses &amp; Simpan&quot;, dokumen akan dikonversi ke PDF menggunakan ConvertAPI dan disimpan ke database.</p>
                </div>
              </CardContent>
            </Card>

            {/* Daftar Anggota Keluarga */}
            {formData.anggota_keluarga && formData.anggota_keluarga.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                    👥 Anggota Keluarga Yang Pindah ({formData.anggota_keluarga.length} orang)
                  </h3>
                  <div className="space-y-2">
                    {formData.anggota_keluarga.map((anggota: any, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="font-medium text-gray-900">{index + 1}. {anggota.nama || '-'}</div>
                        <div className="text-gray-600">NIK: {anggota.nik || '-'}</div>
                        <div className="text-gray-600">SHDK: {anggota.shdk || '-'}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    * Template F-103 hanya menampilkan 1 anggota pertama. Data lengkap tersimpan di database.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Memuat preview...</p>
                    </div>
                  </div>
                ) : previewHtml ? (
                  <div className="preview-container">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-0"
                      style={{ minHeight: '800px' }}
                      title="Preview Surat Pindah Keluar"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-32">
                    <p className="text-gray-500">Preview tidak tersedia</p>
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
