'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Edit, Download, Printer, CheckCircle } from 'lucide-react';

export default function PreviewPerubahanDataPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<any>(null);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // Use ref to prevent double API calling in React 18 Strict Mode
    const hasFetched = useRef(false);

    useEffect(() => {
        // 1. Ambil data dari sessionStorage
        const savedData = sessionStorage.getItem('perubahanDataFormData');

        if (!savedData) {
            router.push('/form-surat/perubahan-data');
            return;
        }

        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);

        // 2. Fetch HTML Preview using API
        const fetchPreview = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                const response = await fetch('/api/preview-perubahan-data-html', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(parsedData),
                });

                if (!response.ok) {
                    throw new Error('Gagal mengambil preview HTML');
                }

                const html = await response.text();
                setPreviewHtml(html);
            } catch (err) {
                console.error('Error fetching preview:', err);
                setError('Gagal memuat preview dokumen. Silakan coba lagi.');
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();

        // Cleanup ref on unmount
        return () => {
            hasFetched.current = false;
        };
    }, [router]);

    const handleEdit = () => {
        router.push('/form-surat/perubahan-data');
    };

    const handleProcess = async () => {
        // For now, since we haven't implemented the full DOCX generation for F-106,
        // we will show an alert or just print the window.
        // Ideally, this calls /api/process-perubahan-data

        alert('Fitur Generate PDF F-106 akan segera tersedia (Membutuhkan mapping template F-106.docx). Saat ini akan mencetak tampilan HTML.');

        // Simple print fallback
        window.print();

        // Or we could implement a quick html2pdf here?
        // Let's stick to window.print() for immediate reliable output if backend isn't ready.
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Options */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-20">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali & Edit
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Preview Dokumen F-106</h1>
                            <p className="text-xs text-gray-500">Pastikan data sudah benar sebelum diproses</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handleProcess}
                            className="bg-teal-600 hover:bg-teal-700 shadow-md transition-all hover:scale-105"
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Memproses...
                                </div>
                            ) : (
                                <>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Cetak Dokumen
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                {/* Warning Banner */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Mode Preview Data</h4>
                            <p className="text-xs text-gray-600 mt-1">
                                Tampilan di bawah ini adalah representasi data untuk verifikasi.
                                Hasil cetak akhir akan menggunakan format resmi F-1.06 Dinas Kependudukan dan Pencatatan Sipil.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview Content */}
                <Card className="overflow-hidden border-2 border-gray-200">
                    <CardContent className="p-0">
                        <div className="preview-container bg-gray-50 p-4 md:p-8 flex justify-center">
                            <iframe
                                srcDoc={previewHtml}
                                className="w-full max-w-[210mm] bg-white shadow-2xl"
                                style={{
                                    minHeight: '1100px',
                                    aspectRatio: '210/297'
                                }}
                                title="Preview Surat Perubahan Data"
                            />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
