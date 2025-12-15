'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

import { Plus, Search, Download, Eye, X, Upload, RefreshCw } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

interface SuratMasuk {
  id: number;
  nomor_surat: string;
  tanggal_masuk: string;
  tanggal_surat: string;
  asal_surat: string;
  perihal: string;
  disposisi?: string;
  file_url?: string;
  file_name?: string;
  status: string;
  created_at: string;
}

export default function SuratMasukPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<SuratMasuk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = mockAuth.getCurrentUser();
  const kelurahanId = currentUser?.kelurahan_id;

  const [formData, setFormData] = useState({
    tanggal_masuk: new Date().toISOString().split('T')[0],
    nomor_surat: '',
    tanggal_surat: '',
    asal_surat: '',
    perihal: '',
    disposisi: '',
  });

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: '100',
      });

      if (kelurahanId) {
        params.append('kelurahanId', kelurahanId.toString());
      }

      const response = await fetch(`/api/surat-masuk?${params.toString()}`);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Hanya file PDF yang diperbolehkan');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiFormData = new FormData();
      apiFormData.append('nomor_surat', formData.nomor_surat);
      apiFormData.append('tanggal_masuk', formData.tanggal_masuk);
      apiFormData.append('tanggal_surat', formData.tanggal_surat);
      apiFormData.append('asal_surat', formData.asal_surat);
      apiFormData.append('perihal', formData.perihal);
      apiFormData.append('disposisi', formData.disposisi);

      if (kelurahanId) {
        apiFormData.append('kelurahanId', kelurahanId.toString());
      }
      if (currentUser?.id) {
        apiFormData.append('userId', currentUser.id.toString());
      }
      if (selectedFile) {
        apiFormData.append('file', selectedFile);
      }

      const response = await fetch('/api/surat-masuk', {
        method: 'POST',
        body: apiFormData,
      });

      const data = await response.json();

      if (data.success) {
        alert('Surat Masuk berhasil ditambahkan!');
        setShowModal(false);
        resetForm();
        fetchDocuments(); // Refresh list
      } else {
        alert('Gagal menambahkan surat masuk: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menambahkan surat masuk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal_masuk: new Date().toISOString().split('T')[0],
      nomor_surat: '',
      tanggal_surat: '',
      asal_surat: '',
      perihal: '',
      disposisi: '',
    });
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredDocuments = (documents || []).filter((doc) => {
    const matchesSearch =
      doc.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.asal_surat.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Surat Masuk</h1>
            <p className="mt-2 text-gray-600">
              Kelola surat masuk Kelurahan Cibodas
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Surat Masuk
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Cari nomor surat, perihal, atau asal surat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
            <CardTitle>Daftar Surat Masuk</CardTitle>
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
                      Asal Surat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Masuk
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
                        Tidak ada data surat masuk
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
                          {doc.asal_surat}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.tanggal_masuk).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {doc.file_url ? (
                              <>
                                <button
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Lihat PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">Tidak ada file</span>
                            )}
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

      {/* Modal Form Tambah Surat Masuk */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Tambah Surat Masuk</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Tanggal Surat Masuk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Surat Masuk <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="tanggal_masuk"
                  value={formData.tanggal_masuk}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Nomor Surat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Surat <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="nomor_surat"
                  value={formData.nomor_surat}
                  onChange={handleChange}
                  placeholder="Contoh: SM/001/2024"
                  required
                />
              </div>

              {/* Tanggal Pada Surat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pada Surat <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="tanggal_surat"
                  value={formData.tanggal_surat}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Asal Surat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asal Surat <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="asal_surat"
                  value={formData.asal_surat}
                  onChange={handleChange}
                  placeholder="Contoh: Dinas Kependudukan"
                  required
                />
              </div>

              {/* Perihal Surat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perihal Surat <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="perihal"
                  value={formData.perihal}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tulis perihal surat..."
                  required
                />
              </div>

              {/* Disposisi (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disposisi <span className="text-gray-400">(Opsional)</span>
                </label>
                <textarea
                  name="disposisi"
                  value={formData.disposisi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Catatan disposisi..."
                />
              </div>

              {/* Upload PDF (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF <span className="text-gray-400">(Opsional)</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF hingga 10MB</p>
                    {selectedFile && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
