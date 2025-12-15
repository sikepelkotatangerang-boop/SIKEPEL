'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, FileText, Eye, Sparkles, Building, MapPin, Users, Plus, Trash2 } from 'lucide-react';
import { getKelurahanDataFromUser, mockAuth } from '@/lib/mockData';

interface AnggotaKeluarga {
  no_urut: string;
  nik: string;
  nama: string;
  shdk: string;
}

export default function FormPindahKeluarPage() {
  const router = useRouter();
  const kelurahanData = getKelurahanDataFromUser();
  const currentUser = mockAuth.getCurrentUser();

  const [anggotaKeluargaList, setAnggotaKeluargaList] = useState<AnggotaKeluarga[]>([
    {
      no_urut: '1',
      nik: '',
      nama: '',
      shdk: 'Kepala Keluarga',
    }
  ]);

  const [formData, setFormData] = useState({
    // Data Surat
    tanggal_surat: new Date().toISOString().split('T')[0],

    // Data Pemohon
    no_kk_pemohon: '',
    nama_pemohon: '',
    nik_pemohon: '',
    no_hp_pemohon: '',
    email_pemohon: '',

    // Jenis Permohonan (1-5)
    jenis_permohonan: '2', // Default: Surat Keterangan Pindah

    // Alamat Asal
    alamat_asal: '',
    rt_asal: '',
    rw_asal: '',
    kel_asal: kelurahanData?.nama || '',
    kec_asal: kelurahanData?.kecamatan || 'Cibodas',
    kota_asal: kelurahanData?.kota || 'Kota Tangerang',
    provinsi_asal: 'Banten',
    pos_asal: '',

    // Klasifikasi Pindah (1-5)
    no_klasifikasi_pindah: '5', // Default: Antar Provinsi

    // Alamat Pindah
    alamat_pindah: '',
    rt_pindah: '',
    rw_pindah: '',
    kel_pindah: '',
    kec_pindah: '',
    kota_kab_pindah: '',
    provinsi_pindah: '',
    pos_pindah: '',

    // Alasan Pindah (1-7)
    no_alasan_pindah: '1', // Default: Pekerjaan

    // Jenis Kepindahan (1-4)
    no_jenis_pindah: '2', // Default: KK + Seluruh Anggota

    // Anggota Keluarga Tidak Pindah (1-4)
    no_anggota_pindah: '4', // Default: Tidak Ada yang Ditinggal

    // Anggota Keluarga Yang Pindah (1-3)
    no_keluarga_pindah: '2', // Default: Membuat KK Baru
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnggotaChange = (index: number, field: keyof AnggotaKeluarga, value: string) => {
    const updated = [...anggotaKeluargaList];
    updated[index] = { ...updated[index], [field]: value };
    setAnggotaKeluargaList(updated);
  };

  const addAnggotaKeluarga = () => {
    const newNo = (anggotaKeluargaList.length + 1).toString();
    setAnggotaKeluargaList([
      ...anggotaKeluargaList,
      {
        no_urut: newNo,
        nik: '',
        nama: '',
        shdk: 'Anak',
      }
    ]);
  };

  const removeAnggotaKeluarga = (index: number) => {
    if (anggotaKeluargaList.length === 1) {
      alert('Minimal harus ada 1 anggota keluarga');
      return;
    }
    const updated = anggotaKeluargaList.filter((_, i) => i !== index);
    // Update nomor urut
    updated.forEach((item, i) => {
      item.no_urut = (i + 1).toString();
    });
    setAnggotaKeluargaList(updated);
  };

  const generateSampleData = () => {
    const sampleData = {
      tanggal_surat: new Date().toISOString().split('T')[0],
      no_kk_pemohon: '3671012345678901',
      nama_pemohon: 'Ahmad Hidayat',
      nik_pemohon: '3671011234567890',
      no_hp_pemohon: '081234567890',
      email_pemohon: 'ahmad.hidayat@email.com',
      jenis_permohonan: '2',
      alamat_asal: 'Jl. Merdeka No. 45',
      rt_asal: '003',
      rw_asal: '005',
      kel_asal: kelurahanData?.nama || 'Cibodas',
      kec_asal: kelurahanData?.kecamatan || 'Cibodas',
      kota_asal: kelurahanData?.kota || 'Tangerang',
      provinsi_asal: 'Banten',
      pos_asal: '15138',
      no_klasifikasi_pindah: '5',
      alamat_pindah: 'Jl. Sudirman No. 123',
      rt_pindah: '002',
      rw_pindah: '004',
      kel_pindah: 'Menteng',
      kec_pindah: 'Menteng',
      kota_kab_pindah: 'Jakarta Pusat',
      provinsi_pindah: 'DKI Jakarta',
      pos_pindah: '10310',
      no_alasan_pindah: '1',
      no_jenis_pindah: '2',
      no_anggota_pindah: '4',
      no_keluarga_pindah: '2',
    };

    const sampleAnggota: AnggotaKeluarga[] = [
      {
        no_urut: '1',
        nik: '3671011234567890',
        nama: 'Ahmad Hidayat',
        shdk: 'Kepala Keluarga',
      },
      {
        no_urut: '2',
        nik: '3671015678901234',
        nama: 'Siti Nurhaliza',
        shdk: 'Istri',
      },
      {
        no_urut: '3',
        nik: '3671016789012345',
        nama: 'Muhammad Rizki',
        shdk: 'Anak',
      }
    ];

    setFormData(sampleData);
    setAnggotaKeluargaList(sampleAnggota);
    alert('Data contoh berhasil dimuat!');
  };

  const handlePreview = () => {
    // Validasi
    if (!formData.no_kk_pemohon || !formData.nama_pemohon || !formData.nik_pemohon) {
      alert('Mohon lengkapi data pemohon');
      return;
    }

    if (!formData.alamat_asal || !formData.rt_asal || !formData.rw_asal) {
      alert('Mohon lengkapi alamat asal');
      return;
    }

    if (!formData.alamat_pindah || !formData.kel_pindah || !formData.kec_pindah) {
      alert('Mohon lengkapi alamat tujuan pindah');
      return;
    }

    // Simpan ke sessionStorage
    const dataToSave = {
      ...formData,
      anggota_keluarga: anggotaKeluargaList,
    };
    sessionStorage.setItem('pindahKeluarFormData', JSON.stringify(dataToSave));
    router.push('/preview-pindah-keluar');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePreview();
  };

  const handleBack = () => {
    router.push('/surat-keterangan');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 p-3 rounded-xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Form Surat Pindah Keluar (F-103)</h1>
                  <p className="text-sm text-gray-600">Formulir Pendaftaran Perpindahan Penduduk</p>
                </div>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateSampleData}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Data Contoh
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Pemohon */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Data Pemohon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. KK <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="no_kk_pemohon"
                    value={formData.no_kk_pemohon}
                    onChange={handleChange}
                    placeholder="16 digit"
                    maxLength={16}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="nik_pemohon"
                    value={formData.nik_pemohon}
                    onChange={handleChange}
                    placeholder="16 digit"
                    maxLength={16}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="nama_pemohon"
                    value={formData.nama_pemohon}
                    onChange={handleChange}
                    placeholder="Nama sesuai KTP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. HP <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="no_hp_pemohon"
                    value={formData.no_hp_pemohon}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="email_pemohon"
                    type="email"
                    value={formData.email_pemohon}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jenis Permohonan */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Jenis Permohonan
              </h2>
              <div className="space-y-2">
                {[
                  { value: '1', label: 'Surat Keterangan Kependudukan' },
                  { value: '2', label: 'Surat Keterangan Pindah' },
                  { value: '3', label: 'Surat Keterangan Pindah Luar Negeri (SKPLN)' },
                  { value: '4', label: 'Surat Keterangan Tempat Tinggal (SKTT)' },
                  { value: '5', label: 'Bagi Orang Asing Tinggal Terbatas' },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="jenis_permohonan"
                      value={option.value}
                      checked={formData.jenis_permohonan === option.value}
                      onChange={handleChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{option.value}. {option.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alamat Asal */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Alamat Asal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="alamat_asal"
                    value={formData.alamat_asal}
                    onChange={handleChange}
                    placeholder="Jalan, No. Rumah"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RT <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="rt_asal"
                    value={formData.rt_asal}
                    onChange={handleChange}
                    placeholder="001"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RW <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="rw_asal"
                    value={formData.rw_asal}
                    onChange={handleChange}
                    placeholder="001"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelurahan
                  </label>
                  <Input
                    name="kel_asal"
                    value={formData.kel_asal}
                    onChange={handleChange}
                    placeholder="Kelurahan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan
                  </label>
                  <Input
                    name="kec_asal"
                    value={formData.kec_asal}
                    onChange={handleChange}
                    placeholder="Kecamatan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota/Kabupaten
                  </label>
                  <Input
                    name="kota_asal"
                    value={formData.kota_asal}
                    onChange={handleChange}
                    placeholder="Kota/Kabupaten"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provinsi
                  </label>
                  <Input
                    name="provinsi_asal"
                    value={formData.provinsi_asal}
                    onChange={handleChange}
                    placeholder="Provinsi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Pos
                  </label>
                  <Input
                    name="pos_asal"
                    value={formData.pos_asal}
                    onChange={handleChange}
                    placeholder="15xxx"
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Klasifikasi Pindah */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Klasifikasi Pindah
              </h2>
              <div className="space-y-2">
                {[
                  { value: '1', label: 'Dalam satu desa/kelurahan' },
                  { value: '2', label: 'Antar desa/kelurahan dalam satu kecamatan' },
                  { value: '3', label: 'Antar kecamatan dalam satu kab./kota' },
                  { value: '4', label: 'Antar kabupaten/kota dalam satu provinsi' },
                  { value: '5', label: 'Antar Provinsi' },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="no_klasifikasi_pindah"
                      value={option.value}
                      checked={formData.no_klasifikasi_pindah === option.value}
                      onChange={handleChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{option.value}. {option.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alamat Tujuan Pindah */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Alamat Tujuan Pindah
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="alamat_pindah"
                    value={formData.alamat_pindah}
                    onChange={handleChange}
                    placeholder="Jalan, No. Rumah"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RT
                  </label>
                  <Input
                    name="rt_pindah"
                    value={formData.rt_pindah}
                    onChange={handleChange}
                    placeholder="001"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RW
                  </label>
                  <Input
                    name="rw_pindah"
                    value={formData.rw_pindah}
                    onChange={handleChange}
                    placeholder="001"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelurahan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="kel_pindah"
                    value={formData.kel_pindah}
                    onChange={handleChange}
                    placeholder="Nama Kelurahan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="kec_pindah"
                    value={formData.kec_pindah}
                    onChange={handleChange}
                    placeholder="Nama Kecamatan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="kota_kab_pindah"
                    value={formData.kota_kab_pindah}
                    onChange={handleChange}
                    placeholder="Nama Kota/Kabupaten"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provinsi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="provinsi_pindah"
                    value={formData.provinsi_pindah}
                    onChange={handleChange}
                    placeholder="Nama Provinsi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Pos
                  </label>
                  <Input
                    name="pos_pindah"
                    value={formData.pos_pindah}
                    onChange={handleChange}
                    placeholder="Kode Pos"
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alasan & Jenis Pindah */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Alasan Pindah
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { value: '1', label: 'Pekerjaan' },
                  { value: '2', label: 'Pendidikan' },
                  { value: '3', label: 'Keamanan' },
                  { value: '4', label: 'Kesehatan' },
                  { value: '5', label: 'Perumahan' },
                  { value: '6', label: 'Keluarga' },
                  { value: '7', label: 'Lainnya' },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="no_alasan_pindah"
                      value={option.value}
                      checked={formData.no_alasan_pindah === option.value}
                      onChange={handleChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{option.value}. {option.label}</span>
                  </label>
                ))}
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-4 mt-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Jenis Kepindahan
              </h2>
              <div className="space-y-2">
                {[
                  { value: '1', label: 'Kepala Keluarga' },
                  { value: '2', label: 'Kepala Keluarga dan Seluruh Anggota Keluarga' },
                  { value: '3', label: 'Kepala Keluarga dan Sebagian Anggota Keluarga' },
                  { value: '4', label: 'Anggota Keluarga' },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="no_jenis_pindah"
                      value={option.value}
                      checked={formData.no_jenis_pindah === option.value}
                      onChange={handleChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{option.value}. {option.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daftar Keluarga Yang Pindah */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-600" />
                  Daftar Keluarga Yang Pindah
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAnggotaKeluarga}
                  className="text-primary-600 border-primary-600 hover:bg-primary-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Anggota
                </Button>
              </div>

              <div className="space-y-4">
                {anggotaKeluargaList.map((anggota, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    {anggotaKeluargaList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAnggotaKeluarga(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                        title="Hapus anggota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Anggota #{anggota.no_urut}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NIK
                        </label>
                        <Input
                          value={anggota.nik}
                          onChange={(e) => handleAnggotaChange(index, 'nik', e.target.value)}
                          placeholder="16 digit"
                          maxLength={16}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Lengkap
                        </label>
                        <Input
                          value={anggota.nama}
                          onChange={(e) => handleAnggotaChange(index, 'nama', e.target.value)}
                          placeholder="Nama lengkap"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status Hubungan Dalam Keluarga (SHDK)
                        </label>
                        <select
                          value={anggota.shdk}
                          onChange={(e) => handleAnggotaChange(index, 'shdk', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="Kepala Keluarga">Kepala Keluarga</option>
                          <option value="Istri">Istri</option>
                          <option value="Anak">Anak</option>
                          <option value="Orang Tua">Orang Tua</option>
                          <option value="Mertua">Mertua</option>
                          <option value="Menantu">Menantu</option>
                          <option value="Cucu">Cucu</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                * Klik &quot;Tambah Anggota&quot; untuk menambahkan anggota keluarga lainnya yang ikut pindah
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pb-6">
            <Button type="button" variant="outline" onClick={handleBack}>
              Batal
            </Button>
            <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
              <Eye className="w-4 h-4 mr-2" />
              Preview Surat
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
