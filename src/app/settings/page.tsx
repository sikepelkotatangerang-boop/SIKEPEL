'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Settings as SettingsIcon, Building2, Users as UsersIcon, Plus, Edit, Trash2, X, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

interface Kelurahan {
  id: number;
  nama: string;
  nama_lengkap: string;
  alamat: string;
  kecamatan: string;
  kota: string;
  kode_pos?: string;
  telepon?: string;
  email?: string;
  nama_lurah: string;
  nip_lurah: string;
}

interface Pejabat {
  id: number;
  kelurahan_id: number;
  nama: string;
  nip?: string;
  jabatan: string;
  kelurahan_nama?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'kelurahan' | 'pejabat' | 'system'>('kelurahan');

  // System settings state
  const [convertApiSecret, setConvertApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Kelurahan state
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState<Kelurahan | null>(null);
  const [showKelurahanModal, setShowKelurahanModal] = useState(false);
  const [kelurahanForm, setKelurahanForm] = useState<Partial<Kelurahan>>({});

  // Pejabat state
  const [pejabatList, setPejabatList] = useState<Pejabat[]>([]);
  const [showPejabatModal, setShowPejabatModal] = useState(false);
  const [editingPejabat, setEditingPejabat] = useState<Pejabat | null>(null);
  const [pejabatForm, setPejabatForm] = useState({
    kelurahan_id: '',
    nama: '',
    nip: '',
    jabatan: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = mockAuth.getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    // Admin bisa akses semua, staff hanya bisa edit kelurahan mereka
    if (user.role === 'admin' || user.role === 'staff') {
      setIsAuthorized(true);
      fetchKelurahan();
      fetchPejabat();
      if (user.role === 'admin') {
        fetchSettings();
      }
    } else {
      router.push('/dashboard');
    }
  }, []);

  const fetchKelurahan = async () => {
    try {
      const response = await fetch('/api/kelurahan');
      const data = await response.json();
      if (Array.isArray(data)) {
        setKelurahanList(data);
      }
    } catch (error) {
      console.error('Error fetching kelurahan:', error);
    }
  };

  const fetchPejabat = async () => {
    try {
      const response = await fetch('/api/pejabat');
      const data = await response.json();
      if (data.success) {
        setPejabatList(data.pejabat);
      }
    } catch (error) {
      console.error('Error fetching pejabat:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings?key=CONVERTAPI_SECRET');
      const data = await response.json();
      if (data.CONVERTAPI_SECRET) {
        setConvertApiSecret(data.CONVERTAPI_SECRET);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'CONVERTAPI_SECRET',
          value: convertApiSecret
        }),
      });

      if (response.ok) {
        setMessage('✅ Konfigurasi sistem berhasil disimpan!');
      } else {
        setMessage('❌ Gagal menyimpan konfigurasi');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Terjadi kesalahan');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditKelurahan = (kelurahan: Kelurahan) => {
    // Staff hanya bisa edit kelurahan mereka sendiri
    if (currentUser?.role === 'staff' && currentUser?.kelurahan_id !== kelurahan.id) {
      setMessage('❌ Anda hanya bisa mengedit kelurahan Anda sendiri');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSelectedKelurahan(kelurahan);
    setKelurahanForm(kelurahan);
    setShowKelurahanModal(true);
  };

  const handleSaveKelurahan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = selectedKelurahan
        ? `/api/kelurahan?id=${selectedKelurahan.id}`
        : '/api/kelurahan';
      const method = selectedKelurahan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kelurahanForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Data kelurahan berhasil disimpan!');
        await fetchKelurahan();
        setShowKelurahanModal(false);
        setSelectedKelurahan(null);
        setKelurahanForm({});
      } else {
        setMessage('❌ ' + (data.error || 'Gagal menyimpan data'));
      }
    } catch (error) {
      console.error('Error saving kelurahan:', error);
      setMessage('❌ Terjadi kesalahan');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleOpenPejabatModal = (pejabat?: Pejabat) => {
    if (pejabat) {
      setEditingPejabat(pejabat);
      setPejabatForm({
        kelurahan_id: pejabat.kelurahan_id.toString(),
        nama: pejabat.nama,
        nip: pejabat.nip || '',
        jabatan: pejabat.jabatan,
      });
    } else {
      setEditingPejabat(null);
      setPejabatForm({
        kelurahan_id: currentUser?.role === 'staff' ? currentUser.kelurahan_id?.toString() || '' : '',
        nama: '',
        nip: '',
        jabatan: '',
      });
    }
    setShowPejabatModal(true);
  };

  const handleSavePejabat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingPejabat
        ? `/api/pejabat?id=${editingPejabat.id}`
        : '/api/pejabat';
      const method = editingPejabat ? 'PUT' : 'POST';

      const payload = {
        ...pejabatForm,
        kelurahan_id: parseInt(pejabatForm.kelurahan_id),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Data pejabat berhasil disimpan!');
        await fetchPejabat();
        setShowPejabatModal(false);
        setEditingPejabat(null);
        setPejabatForm({ kelurahan_id: '', nama: '', nip: '', jabatan: '' });
      } else {
        setMessage('❌ ' + (data.error || 'Gagal menyimpan data'));
      }
    } catch (error) {
      console.error('Error saving pejabat:', error);
      setMessage('❌ Terjadi kesalahan');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeletePejabat = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pejabat ini?')) return;

    try {
      const response = await fetch(`/api/pejabat?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Pejabat berhasil dihapus');
        await fetchPejabat();
      } else {
        setMessage('❌ ' + (data.error || 'Gagal menghapus pejabat'));
      }
    } catch (error) {
      console.error('Error deleting pejabat:', error);
      setMessage('❌ Terjadi kesalahan');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Filter pejabat berdasarkan kelurahan staff
  const filteredPejabat = currentUser?.role === 'staff'
    ? pejabatList.filter(p => p.kelurahan_id === currentUser.kelurahan_id)
    : pejabatList;

  const filteredKelurahan = currentUser?.role === 'staff'
    ? kelurahanList.filter(k => k.id === currentUser.kelurahan_id)
    : kelurahanList;

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="mt-2 text-gray-600">
            {currentUser?.role === 'admin'
              ? 'Kelola data kelurahan dan pejabat'
              : 'Kelola data kelurahan dan pejabat Anda'}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-md ${message.includes('✅')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('kelurahan')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'kelurahan'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Building2 className="w-5 h-5 inline mr-2" />
              Data Kelurahan
            </button>
            <button
              onClick={() => setActiveTab('pejabat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pejabat'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <UsersIcon className="w-5 h-5 inline mr-2" />
              Data Pejabat
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('system')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'system'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Lock className="w-5 h-5 inline mr-2" />
                Konfigurasi Sistem
              </button>
            )}
          </nav>
        </div>

        {/* Kelurahan Tab */}
        {activeTab === 'kelurahan' && (
          <div className="space-y-4">
            {/* Add Kelurahan Button (Admin Only) */}
            {currentUser?.role === 'admin' && (
              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedKelurahan(null);
                  setKelurahanForm({});
                  setShowKelurahanModal(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kelurahan
                </Button>
              </div>
            )}

            {filteredKelurahan.map((kelurahan) => (
              <Card key={kelurahan.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{kelurahan.nama}</CardTitle>
                    <Button onClick={() => handleEditKelurahan(kelurahan)} size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nama Lengkap</p>
                      <p className="font-medium">{kelurahan.nama_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Alamat</p>
                      <p className="font-medium">{kelurahan.alamat}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kecamatan / Kota</p>
                      <p className="font-medium">{kelurahan.kecamatan}, {kelurahan.kota}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kode Pos</p>
                      <p className="font-medium">{kelurahan.kode_pos || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Telepon</p>
                      <p className="font-medium">{kelurahan.telepon || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{kelurahan.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nama Lurah</p>
                      <p className="font-medium">{kelurahan.nama_lurah}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">NIP Lurah</p>
                      <p className="font-medium">{kelurahan.nip_lurah}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pejabat Tab */}
        {activeTab === 'pejabat' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleOpenPejabatModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pejabat
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                        {currentUser?.role === 'admin' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelurahan</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPejabat.length === 0 ? (
                        <tr>
                          <td colSpan={currentUser?.role === 'admin' ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                            Belum ada data pejabat
                          </td>
                        </tr>
                      ) : (
                        filteredPejabat.map((pejabat) => (
                          <tr key={pejabat.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{pejabat.nama}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{pejabat.nip || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{pejabat.jabatan}</td>
                            {currentUser?.role === 'admin' && (
                              <td className="px-6 py-4 text-sm text-gray-500">{pejabat.kelurahan_nama}</td>
                            )}
                            <td className="px-6 py-4 text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleOpenPejabatModal(pejabat)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePejabat(pejabat.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && currentUser?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Sistem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSystemSettings} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ConvertAPI Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={convertApiSecret}
                      onChange={(e) => setConvertApiSecret(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 pr-10"
                      placeholder="Masukkan ConvertAPI Secret"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Digunakan untuk konversi dokumen (Word ke PDF). Dapatkan di <a href="https://www.convertapi.com" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">convertapi.com</a>
                  </p>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Modal Edit Kelurahan */}
        {showKelurahanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedKelurahan ? 'Edit Data Kelurahan' : 'Tambah Kelurahan Baru'}
                </h2>
                <button onClick={() => setShowKelurahanModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveKelurahan} className="space-y-4">
                <Input
                  label="Nama Kelurahan"
                  value={kelurahanForm.nama || ''}
                  onChange={(e) => setKelurahanForm({ ...kelurahanForm, nama: e.target.value })}
                  required
                />
                <Input
                  label="Nama Lengkap"
                  value={kelurahanForm.nama_lengkap || ''}
                  onChange={(e) => setKelurahanForm({ ...kelurahanForm, nama_lengkap: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={kelurahanForm.alamat || ''}
                    onChange={(e) => setKelurahanForm({ ...kelurahanForm, alamat: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Kecamatan"
                    value={kelurahanForm.kecamatan || ''}
                    onChange={(e) => setKelurahanForm({ ...kelurahanForm, kecamatan: e.target.value })}
                    required
                  />
                  <Input
                    label="Kota"
                    value={kelurahanForm.kota || ''}
                    onChange={(e) => setKelurahanForm({ ...kelurahanForm, kota: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Kode Pos"
                    value={kelurahanForm.kode_pos || ''}
                    onChange={(e) => setKelurahanForm({ ...kelurahanForm, kode_pos: e.target.value })}
                  />
                  <Input
                    label="Telepon"
                    value={kelurahanForm.telepon || ''}
                    onChange={(e) => setKelurahanForm({ ...kelurahanForm, telepon: e.target.value })}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={kelurahanForm.email || ''}
                  onChange={(e) => setKelurahanForm({ ...kelurahanForm, email: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nama Lurah"
                    value={kelurahanForm.nama_lurah || ''}
                    onChange={(e) => setKelurahanForm({ ...kelurahanForm, nama_lurah: e.target.value })}
                    required
                  />
                  <Input
                    label="NIP Lurah"
                    value={kelurahanForm.nip_lurah || ''}
                    onChange={(e) => setKelurahanForm({ ...kelurahanForm, nip_lurah: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowKelurahanModal(false)} className="flex-1">
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Pejabat */}
        {showPejabatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingPejabat ? 'Edit Pejabat' : 'Tambah Pejabat'}</h2>
                <button onClick={() => setShowPejabatModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePejabat} className="space-y-4">
                {currentUser?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelurahan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={pejabatForm.kelurahan_id}
                      onChange={(e) => setPejabatForm({ ...pejabatForm, kelurahan_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Pilih Kelurahan</option>
                      {kelurahanList.map((kel) => (
                        <option key={kel.id} value={kel.id}>
                          {kel.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Input
                  label="Nama Pejabat"
                  value={pejabatForm.nama}
                  onChange={(e) => setPejabatForm({ ...pejabatForm, nama: e.target.value })}
                  required
                />
                <Input
                  label="NIP (Opsional)"
                  value={pejabatForm.nip}
                  onChange={(e) => setPejabatForm({ ...pejabatForm, nip: e.target.value })}
                />
                <Input
                  label="Jabatan"
                  value={pejabatForm.jabatan}
                  onChange={(e) => setPejabatForm({ ...pejabatForm, jabatan: e.target.value })}
                  required
                  placeholder="Contoh: Sekretaris Lurah, Kepala Seksi"
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPejabatModal(false)} className="flex-1">
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
