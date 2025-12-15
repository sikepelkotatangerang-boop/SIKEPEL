'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Calendar, TrendingUp, Layers, RefreshCw, Building2 } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';
import Button from '@/components/ui/Button';

interface Stats {
  total_dokumen: number;
  dokumen_minggu_ini: number;
  dokumen_bulan_ini: number;
  jenis_dokumen: number;
}

interface Document {
  id: number;
  nomor_surat: string;
  jenis_dokumen: string;
  nama_subjek: string;
  tanggal_surat: string;
  created_at: string;
  kelurahan_nama?: string;
}

interface Kelurahan {
  id: number;
  nama: string;
  kecamatan: string;
  kota: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_dokumen: 0,
    dokumen_minggu_ini: 0,
    dokumen_bulan_ini: 0,
    jenis_dokumen: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
  const [selectedKelurahanId, setSelectedKelurahanId] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  const currentUser = mockAuth.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const userKelurahanId = (currentUser as any)?.kelurahan?.id;
  
  // Untuk admin, gunakan selectedKelurahanId, untuk staff gunakan kelurahan mereka
  const kelurahanId = isAdmin ? (selectedKelurahanId || null) : userKelurahanId;

  // Set isClient to true after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load selected kelurahan from localStorage for admin
  useEffect(() => {
    if (isAdmin) {
      const saved = localStorage.getItem('admin_selected_kelurahan_id');
      if (saved) {
        setSelectedKelurahanId(saved);
      }
    }
  }, [isAdmin]);

  // Fetch kelurahan list for admin
  useEffect(() => {
    if (isAdmin) {
      const fetchKelurahan = async () => {
        try {
          const response = await fetch('/api/kelurahan');
          
          if (response.ok) {
            const data = await response.json();
            
            // API returns array directly, not { success, kelurahan }
            if (Array.isArray(data)) {
              setKelurahanList(data);
            }
          }
        } catch (error) {
          // Silent fail
        }
      };
      fetchKelurahan();
    }
  }, [isAdmin]);

  // Clear all form sessionStorage when dashboard mounts
  useEffect(() => {
    const formKeys = [
      'sktm_preview_data',
      'skuFormData',
      'belum_rumah_preview_data',
      'suami_istri_preview_data',
      'belumMenikahFormData',
      'pengantarNikahFormData'
    ];

    formKeys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  }, []);

  // Save selected kelurahan to localStorage and update mockAuth
  const handleKelurahanChange = (kelurahanId: string) => {
    setSelectedKelurahanId(kelurahanId);
    localStorage.setItem('admin_selected_kelurahan_id', kelurahanId);
    
    // Update mockAuth dengan kelurahan yang dipilih
    if (kelurahanId && currentUser) {
      const selectedKelurahan = kelurahanList.find(k => k.id.toString() === kelurahanId);
      if (selectedKelurahan) {
        // Simpan ke localStorage untuk digunakan di form
        localStorage.setItem('admin_acting_as_kelurahan', JSON.stringify({
          id: selectedKelurahan.id,
          nama: selectedKelurahan.nama,
          kecamatan: selectedKelurahan.kecamatan,
          kota: selectedKelurahan.kota,
          kelurahan_id: selectedKelurahan.id
        }));
      }
    } else {
      localStorage.removeItem('admin_acting_as_kelurahan');
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch stats
      const statsUrl = kelurahanId
        ? `/api/dashboard/stats?kelurahan_id=${kelurahanId}`
        : '/api/dashboard/stats';

      const statsRes = await fetch(statsUrl);
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent documents
      const docsUrl = kelurahanId
        ? `/api/dashboard/recent?kelurahan_id=${kelurahanId}&limit=10`
        : '/api/dashboard/recent?limit=10';

      const docsRes = await fetch(docsUrl);
      const docsData = await docsRes.json();

      if (docsData.success) {
        setRecentDocuments(docsData.documents);
      }
    } catch (err) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [kelurahanId]);

  const statsCards = [
    {
      name: 'Total Dokumen',
      value: stats.total_dokumen.toString(),
      icon: FileText,
      color: 'bg-blue-500',
      description: 'Semua dokumen yang dibuat'
    },
    {
      name: 'Minggu Ini',
      value: stats.dokumen_minggu_ini.toString(),
      icon: Calendar,
      color: 'bg-green-500',
      description: '7 hari terakhir'
    },
    {
      name: 'Bulan Ini',
      value: stats.dokumen_bulan_ini.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: '30 hari terakhir'
    },
    {
      name: 'Jenis Dokumen',
      value: stats.jenis_dokumen.toString(),
      icon: Layers,
      color: 'bg-orange-500',
      description: 'Variasi jenis surat'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Selamat datang di Sistem Administrasi Surat Kelurahan
            </p>
          </div>
          
          {/* Admin Kelurahan Selector - Only render on client to avoid hydration error */}
          {isClient && isAdmin && (
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-500" />
              <select
                value={selectedKelurahanId}
                onChange={(e) => handleKelurahanChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Semua Kelurahan</option>
                {kelurahanList.map((kel) => (
                  <option key={kel.id} value={kel.id.toString()}>
                    {kel.nama} - {kel.kecamatan}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-4 text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="col-span-4 text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchDashboardData} className="mt-4" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          ) : (
            statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.name}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {stat.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dokumen Terbaru</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                      Jenis Dokumen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Subjek
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelurahan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500 text-sm">Memuat dokumen...</p>
                      </td>
                    </tr>
                  ) : recentDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Belum ada dokumen
                      </td>
                    </tr>
                  ) : (
                    recentDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.nomor_surat}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {doc.jenis_dokumen}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {doc.nama_subjek || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.tanggal_surat).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.kelurahan_nama || '-'}
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
