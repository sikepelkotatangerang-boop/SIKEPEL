'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

export default function PreviewSuratKeluarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentUser = mockAuth.getCurrentUser();

  useEffect(() => {
    const savedData = localStorage.getItem('suratKeluarFormData');
    if (!savedData) {
      router.push('/form-surat/surat-keluar');
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

      const response = await fetch('/api/preview-surat-keluar-html', {
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

    const confirmed = confirm(
      'Apakah Anda yakin data sudah benar?\n\n' +
      'Dokumen akan dikonversi ke PDF menggunakan ConvertAPI (template SURATKELUAR.docx), ' +
      'disimpan ke Supabase Storage, dan dicatat dalam database.'
    );

    if (!confirmed) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/process-surat-keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          userId: currentUser?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memproses dokumen');
      }

      // Check if document was saved to database
      const documentId = response.headers.get('X-Document-Id');
      const supabaseUrl = response.headers.get('X-Supabase-Url');
      const savedToDb = documentId && documentId !== 'not-saved';

      console.log('Document ID:', documentId);
      console.log('Supabase URL:', supabaseUrl);
      console.log('Saved to DB:', savedToDb);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_Keluar_${formData.nomor_surat?.replace(/\//g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      localStorage.removeItem('suratKeluarFormData');

      if (savedToDb) {
        alert(
          'Dokumen Surat Keluar berhasil dibuat!\n\n' +
          '✓ PDF telah diunduh\n' +
          '✓ Disimpan ke Supabase Storage\n' +
          '✓ Tercatat dalam database (ID: ' + documentId + ')\n\n' +
          'Kembali ke halaman Surat Keluar.'
        );
      } else {
        alert(
          'Dokumen Surat Keluar berhasil dibuat!\n\n' +
          '✓ PDF telah diunduh\n' +
          '✓ Disimpan ke Supabase Storage\n' +
          '⚠️ GAGAL menyimpan ke database!\n\n' +
          'Cek console server untuk detail error.\n' +
          'Dokumen tetap tersimpan di Supabase: ' + supabaseUrl
        );
      }
      
      router.push('/surat-keluar');
    } catch (err) {
      console.error('Error processing Surat Keluar:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push('/form-surat/surat-keluar');
  };

  if (!formData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
            <h1 className="text-2xl font-bold text-gray-900">Preview Surat Keluar</h1>
            <p className="text-sm text-gray-600 mt-1">
              Periksa kembali data sebelum menyimpan dokumen
            </p>
            {formData && (
              <p className="text-xs text-blue-600 mt-1">
                📄 Template: {formData.data_acara && formData.data_acara.trim() !== '' ? 'SURATKELUARACARA.docx' : 'SURATKELUAR.docx'}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isProcessing}
          >
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
                Dokumen berhasil dibuat dan diunduh. Mengalihkan ke halaman Surat Keluar...
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Action */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Proses Dokumen</h3>
                <ul className="text-xs text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Template: {formData?.data_acara && formData.data_acara.trim() !== '' 
                        ? 'SURATKELUARACARA.docx' 
                        : 'SURATKELUAR.docx'}
                    </span>
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
                  onClick={handleProcessAndSave}
                  disabled={isProcessing || isLoadingPreview}
                  className="w-full bg-blue-600 hover:bg-blue-700"
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
                  <p className="font-semibold text-gray-900">ℹ️ Informasi</p>
                  <p>Dokumen akan dikonversi menggunakan ConvertAPI dengan kualitas tinggi.</p>
                  <p>Setelah diproses, dokumen akan tersimpan di database dan dapat diakses di menu Daftar Surat.</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-1">📋 Template Selection:</p>
                    <p>• Jika <strong>Data Acara diisi</strong> → SURATKELUARACARA.docx</p>
                    <p>• Jika <strong>Data Acara kosong</strong> → SURATKELUAR.docx</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Memuat preview...</p>
                    </div>
                  </div>
                ) : (
                  <div className="preview-container">
                    <iframe
                      srcDoc={htmlPreview}
                      className="w-full border-0"
                      style={{ minHeight: '800px' }}
                      title="Preview Surat Keluar"
                    />
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
