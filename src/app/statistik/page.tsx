'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { 
  BarChart3, 
  FileText, 
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { mockAuth } from '@/lib/mockData';
import Button from '@/components/ui/Button';

interface StatistikData {
  perJenis: Array<{ jenis: string; jumlah: number }>;
  trend: Array<{ label: string; jumlah: number }>;
  totals: {
    tahun_ini: number;
    bulan_ini: number;
    hari_ini: number;
  };
}

export default function StatistikPage() {
  const [viewMode, setViewMode] = useState<'hari-ini' | 'bulan-ini' | 'tahun-ini'>('bulan-ini');
  const [data, setData] = useState<StatistikData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = mockAuth.getCurrentUser();
  const kelurahanId = currentUser?.kelurahan_id;

  const fetchStatistik = async () => {
    setLoading(true);
    setError('');

    try {
      const url = kelurahanId
        ? `/api/statistik?kelurahan_id=${kelurahanId}&view_mode=${viewMode}`
        : `/api/statistik?view_mode=${viewMode}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError('Gagal memuat data statistik');
      }
    } catch (err) {
      setError('Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistik();
  }, [viewMode, kelurahanId]);

  const getTotalForMode = () => {
    if (!data) return 0;
    switch (viewMode) {
      case 'hari-ini':
        return data.totals.hari_ini;
      case 'bulan-ini':
        return data.totals.bulan_ini;
      case 'tahun-ini':
        return data.totals.tahun_ini;
      default:
        return 0;
    }
  };

  const getAverage = () => {
    if (!data || !data.trend.length) return 0;
    const total = data.trend.reduce((sum, item) => sum + item.jumlah, 0);
    return Math.round(total / data.trend.length);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary-600 mb-4" />
            <p className="text-gray-600">Memuat statistik...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistik Pelayanan</h1>
            <p className="mt-2 text-gray-600">
              Statistik dan laporan pelayanan administrasi
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              options={[
                { value: 'hari-ini', label: '📅 Hari Ini' },
                { value: 'bulan-ini', label: '📊 Bulan Ini' },
                { value: 'tahun-ini', label: '📈 Tahun Ini' }
              ]}
              className="w-full sm:w-48"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatistik}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    {viewMode === 'hari-ini' && 'Hari Ini'}
                    {viewMode === 'bulan-ini' && 'Bulan Ini'}
                    {viewMode === 'tahun-ini' && 'Tahun Ini'}
                  </p>
                  <p className="text-4xl font-bold text-blue-900 mt-2">{getTotalForMode()}</p>
                  <p className="text-xs text-blue-600 mt-1">Total Dokumen</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Tahun Ini</p>
                  <p className="text-4xl font-bold text-green-900 mt-2">
                    {data?.totals.tahun_ini || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Semua Dokumen</p>
                </div>
                <Calendar className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Rata-rata</p>
                  <p className="text-4xl font-bold text-purple-900 mt-2">{getAverage()}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {viewMode === 'hari-ini' && 'Per Jam'}
                    {viewMode === 'bulan-ini' && 'Per Hari'}
                    {viewMode === 'tahun-ini' && 'Per Bulan'}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistik per Jenis Surat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Statistik Berdasarkan Jenis Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data && data.perJenis.length > 0 ? (
              <div className="space-y-4">
                {data.perJenis.map((item, index) => {
                  const maxJumlah = Math.max(...data.perJenis.map(d => d.jumlah));
                  const barWidth = (item.jumlah / maxJumlah) * 100;
                  const persentase = ((item.jumlah / getTotalForMode()) * 100).toFixed(1);

                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{item.jenis}</p>
                          <p className="text-xs text-gray-500">{persentase}% dari total</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.jumlah}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada data</p>
            )}
          </CardContent>
        </Card>

        {/* Tren */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              {viewMode === 'hari-ini' && 'Tren Hari Ini (Per Jam)'}
              {viewMode === 'bulan-ini' && 'Tren Bulan Ini (Per Hari)'}
              {viewMode === 'tahun-ini' && 'Tren Tahun Ini (Per Bulan)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data && data.trend.length > 0 ? (
              <>
                <div className="space-y-3">
                  {data.trend.map((item, index) => {
                    const maxValue = Math.max(...data.trend.map(d => d.jumlah));
                    const barWidth = maxValue > 0 ? (item.jumlah / maxValue) * 100 : 0;

                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-700">
                          {item.label}
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            >
                              {barWidth > 20 && (
                                <span className="text-white text-xs font-bold">{item.jumlah}</span>
                              )}
                            </div>
                          </div>
                          {barWidth <= 20 && (
                            <span className="text-sm font-bold text-gray-700 w-8">{item.jumlah}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.trend.reduce((sum, item) => sum + item.jumlah, 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Rata-rata</p>
                      <p className="text-2xl font-bold text-gray-900">{getAverage()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Tertinggi</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.max(...data.trend.map(d => d.jumlah))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Terendah</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.min(...data.trend.map(d => d.jumlah))}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada data</p>
            )}
          </CardContent>
        </Card>

        {/* Top 3 Dokumen Terpopuler */}
        {data && data.perJenis.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <TrendingUp className="w-5 h-5" />
                Top 3 Dokumen Terpopuler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.perJenis.slice(0, 3).map((item, index) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600'];
                  const persentase = ((item.jumlah / getTotalForMode()) * 100).toFixed(1);

                  return (
                    <Card key={index} className="bg-white border-2 border-amber-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{medals[index]}</div>
                          <div className={`${colors[index]} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}>
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm mb-2">{item.jenis}</h3>
                          <p className="text-3xl font-bold text-primary-600">{item.jumlah}</p>
                          <p className="text-xs text-gray-500 mt-1">{persentase}% dari total</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
