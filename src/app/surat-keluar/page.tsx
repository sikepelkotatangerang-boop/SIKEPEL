'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, Search, Download, Eye, RefreshCw } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

interface Document {
  id: number;
  nomor_surat: string;
  perihal: string;
  tanggal_surat: string;
  storage_bucket_url: string;
  status: string;
  created_at: string;
  sifat?: string;
  jumlah_lampiran?: number;
}

export default function SuratKeluarPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = mockAuth.getCurrentUser();
  const kelurahanId = currentUser?.kelurahan_id;

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: '100',
        status: 'active',
      });

      if (kelurahanId) {
        params.append('kelurahanId', kelurahanId.toString());
      }

      const url = `/api/surat-keluar?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setDocuments(data.data || []);
      } else {
        setError(data.error || 'Gagal memuat data');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelurahanId]);

  const handleTambahSurat = () => {
    router.push('/form-surat/surat-keluar');
  };

  const handleView = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownload = (url: string, nomorSurat: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomorSurat.replace(/\//g, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestQuery = async () => {
    try {
      const response = await fetch('/api/surat-keluar?limit=10');
      const data = await response.json();
      console.log('Test Query Result:', data);
      const message = data.success 
        ? `Found ${data.data.length} documents\n\n${JSON.stringify(data.data.slice(0, 3), null, 2)}`
        : `Error: ${data.error}`;
      alert(message);
    } catch (err) {
      console.error('Test query error:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const filteredDocuments = (documents || []).filter((doc) => {
    const matchesSearch =
      doc.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.perihal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Surat Keluar</h1>
            <p className="mt-2 text-gray-600">
              Kelola surat keluar Kelurahan Cibodas
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total dokumen: {documents?.length || 0}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTestQuery} variant="outline" size="sm">
              Test Query
            </Button>
            <Button onClick={handleTambahSurat}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Surat Keluar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Cari nomor surat atau perihal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'active', label: 'Aktif' },
                    { value: 'archived', label: 'Arsip' },
                  ]}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDocuments}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Surat Keluar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Surat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perihal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Surat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500 text-sm">Memuat data...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada data surat keluar
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.nomor_surat}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {doc.perihal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.tanggal_surat).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              doc.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {doc.status === 'active' ? 'Aktif' : 'Arsip'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(doc.storage_bucket_url)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Lihat PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc.storage_bucket_url, doc.nomor_surat)}
                              className="text-green-600 hover:text-green-900"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
