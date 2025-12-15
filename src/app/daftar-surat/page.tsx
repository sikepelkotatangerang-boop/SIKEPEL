'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Search, 
  FileText, 
  Calendar, 
  User, 
  CreditCard,
  Eye,
  Download,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  MapPin
} from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

interface Document {
  id: number;
  nomor_surat: string;
  jenis_dokumen: string;
  tanggal_surat: string;
  perihal: string;
  nik_subjek: string | null;
  nama_subjek: string;
  alamat_subjek: string | null;
  storage_path: string | null;      // Supabase Storage file path
  storage_url: string | null;       // Supabase Storage public URL
  google_drive_id: string | null;   // Legacy (untuk backward compatibility)
  google_drive_url: string | null;  // Legacy (untuk backward compatibility)
  file_name: string;
  created_at: string;
  created_by_name: string;
  kelurahan_nama: string;
  pejabat_nama: string;
  data_detail: any;
}

export default function DaftarSuratPage() {
  const router = useRouter();
  const currentUser = mockAuth.getCurrentUser();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total_documents: 0, today_count: 0, week_count: 0, month_count: 0 });

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [currentPage, searchTerm, filterJenis]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
      });

      if (filterJenis) {
        params.append('jenisDokumen', filterJenis);
      }

      // Filter by kelurahan for staff users and admin (if kelurahan selected)
      if (currentUser?.kelurahan_id) {
        params.append('kelurahanId', currentUser.kelurahan_id.toString());
      }

      const response = await fetch(`/api/documents?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setDocuments(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } else {
        alert(`Error: ${data.error}\nDetails: ${data.details || 'No details'}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan saat memuat data dokumen');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (currentUser?.kelurahan_id) {
        params.append('kelurahanId', currentUser.kelurahan_id.toString());
      }

      const response = await fetch(`/api/documents?${params.toString()}`, {
        method: 'PUT',
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Prioritas 1: Gunakan Supabase Storage URL (storage_url)
      if (doc.storage_url) {
        // Direct download dari Supabase Storage public URL
        const link = document.createElement('a');
        link.href = doc.storage_url;
        link.download = doc.file_name || 'document.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Prioritas 2: Legacy - Google Drive URL (backward compatibility)
      if (doc.google_drive_url && doc.google_drive_url.includes('supabase')) {
        const link = document.createElement('a');
        link.href = doc.google_drive_url;
        link.download = doc.file_name || 'document.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Prioritas 3: Download via API jika ada file_name
      if (doc.file_name) {
        const downloadUrl = `/api/documents/download?fileName=${encodeURIComponent(doc.file_name)}`;
        window.open(downloadUrl, '_blank');
        return;
      }
      
      // Prioritas 4: Buka Google Drive URL jika ada (legacy)
      if (doc.google_drive_url) {
        window.open(doc.google_drive_url, '_blank');
        return;
      }
      
      alert('File tidak tersedia untuk dokumen ini');
    } catch (error) {
      alert('Gagal mengunduh file. Silakan coba lagi.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getJenisBadgeColor = (jenis: string) => {
    const colors: Record<string, string> = {
      'SKTM': 'bg-yellow-100 text-yellow-800',
      'Domisili': 'bg-blue-100 text-blue-800',
      'Usaha': 'bg-green-100 text-green-800',
      'Kelahiran': 'bg-purple-100 text-purple-800',
      'Surat Pindah Keluar': 'bg-red-100 text-red-800',
    };
    return colors[jenis] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Surat</h1>
          <p className="mt-2 text-gray-600">
            Riwayat pelayanan administrasi yang telah dibuat
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Dokumen</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total_documents}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Minggu Ini</p>
                  <p className="text-3xl font-bold text-green-900">{stats.week_count}</p>
                </div>
                <Calendar className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Bulan Ini</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.month_count}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cari nama, NIK, nomor surat, atau perihal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-64">
                <select
                  value={filterJenis}
                  onChange={(e) => setFilterJenis(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Semua Jenis Dokumen</option>
                  <option value="SKTM">SKTM</option>
                  <option value="Domisili">Domisili</option>
                  <option value="Usaha">Usaha</option>
                  <option value="Kelahiran">Kelahiran</option>
                  <option value="Surat Pindah Keluar">Surat Pindah Keluar</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surat List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Daftar Dokumen ({total})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Memuat data...</p>
                </div>
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow border-2 hover:border-primary-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getJenisBadgeColor(doc.jenis_dokumen)}`}>
                                  {doc.jenis_dokumen}
                                </span>
                              </div>
                              <h3 className="font-bold text-lg text-gray-900">{doc.nomor_surat}</h3>
                              <p className="text-sm text-gray-600 mt-1">{doc.perihal}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700"><strong>Nama:</strong> {doc.nama_subjek}</span>
                            </div>
                            {doc.nik_subjek && (
                              <div className="flex items-center space-x-2 text-sm">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700"><strong>NIK:</strong> {doc.nik_subjek}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                <strong>Tanggal:</strong> {formatDate(doc.tanggal_surat)}
                              </span>
                            </div>
                            {doc.kelurahan_nama && (
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700"><strong>Kelurahan:</strong> {doc.kelurahan_nama}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Dibuat oleh: {doc.created_by_name || 'System'}</span>
                            <span>•</span>
                            <span>{formatDate(doc.created_at)}</span>
                            {doc.pejabat_nama && (
                              <>
                                <span>•</span>
                                <span>Ditandatangani: {doc.pejabat_nama}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          {(doc.storage_url || doc.file_name || doc.google_drive_url) && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 md:flex-none"
                                onClick={() => {
                                  // Prioritas 1: Supabase Storage URL
                                  if (doc.storage_url) {
                                    window.open(doc.storage_url, '_blank');
                                  }
                                  // Prioritas 2: Legacy Google Drive URL
                                  else if (doc.google_drive_url) {
                                    window.open(doc.google_drive_url, '_blank');
                                  }
                                  // Prioritas 3: Download via API
                                  else if (doc.file_name) {
                                    window.open(`/api/documents/download?fileName=${encodeURIComponent(doc.file_name)}`, '_blank');
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Lihat
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 md:flex-none"
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Unduh
                              </Button>
                            </>
                          )}
                          {!doc.storage_url && !doc.file_name && !doc.google_drive_url && (
                            <div className="text-xs text-gray-500 text-center">
                              File tidak tersedia
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Halaman {currentPage} dari {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">Belum ada dokumen</p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchTerm || filterJenis
                    ? 'Tidak ada dokumen yang sesuai dengan pencarian'
                    : 'Belum ada dokumen yang dibuat'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
