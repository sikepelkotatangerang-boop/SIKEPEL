'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Heart, ArrowLeft, FileText, Eye, AlertCircle, Users, Building2, Sparkles } from 'lucide-react';
import { getKelurahanDataFromUser, mockAuth } from '@/lib/mockData';

interface PejabatData {
  id: number;
  kelurahan_id: number;
  nama: string;
  nip: string | null;
  jabatan: string;
  is_active: boolean;
  created_at: Date;
  kelurahan_nama?: string;
}

export default function FormPengantarNikahPage() {
  const router = useRouter();
  const [pejabatError, setPejabatError] = useState<string | null>(null);
  const [isLoadingPejabat, setIsLoadingPejabat] = useState(true);
  const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
  const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');
  const [alamatIbuSamaDenganBapak, setAlamatIbuSamaDenganBapak] = useState(false);

  const kelurahanData = getKelurahanDataFromUser();
  const currentUser = mockAuth.getCurrentUser();

  // Ref untuk track apakah nomor surat sudah di-generate (prevent multiple calls)
  const nomorSuratGenerated = useRef(false);
  const dataRestored = useRef(false);
  const pejabatFetched = useRef(false);

  const [formData, setFormData] = useState({
    // Data Surat
    nomor_surat: '',

    // Data Pemohon
    nik_pemohon: '',
    nama_pemohon: '',
    tempat_lahir_pemohon: '',
    tanggal_lahir_pemohon: '',
    kelamin_pemohon: '',
    agama_pemohon: '',
    pekerjaan_pemohon: '',
    negara_pemohon: 'Indonesia',
    alamat_pemohon: '',
    rt_pemohon: '',
    rw_pemohon: '',
    kelurahan_pemohon: kelurahanData?.nama || 'Cibodas',
    kecamatan_pemohon: 'Tangerang',

    // Status Perkawinan (conditional)
    status_jika_laki_laki: '', // Jejaka/Duda
    status_jika_perempuan: '', // Perawan/Janda

    // Data Bapak
    nik_bapak: '',
    nama_bapak: '',
    bapak_almarhum: false,
    tempat_lahir_bapak: '',
    tanggal_lahir_bapak: '',
    agama_bapak: '',
    pekerjaan_bapak: '',
    negara_bapak: 'Indonesia',
    alamat_bapak: '',

    // Data Ibu
    nik_ibu: '',
    nama_ibu: '',
    ibu_almarhum: false,
    tempat_lahir_ibu: '',
    tanggal_lahir_ibu: '',
    agama_ibu: '',
    pekerjaan_ibu: '',
    negara_ibu: 'Indonesia',
    alamat_ibu: '',

    // Data Kelurahan
    kelurahan: kelurahanData?.nama || 'Cibodas',

    // Data Pejabat
    nama_pejabat: '',
    nip_pejabat: '',
    jabatan: '',
    jabatan_detail: '',
  });

  // Auto-generate nomor surat saat component mount (hanya sekali)
  useEffect(() => {
    const generateNomorSurat = async () => {
      try {
        // Mark as generated to prevent multiple calls
        nomorSuratGenerated.current = true;

        const kelurahanId = currentUser?.kelurahan_id || '';
        const response = await fetch(`/api/generate-nomor-surat?jenis=Pengantar Nikah&kelurahanId=${kelurahanId}`);
        const data = await response.json();

        if (data.success && data.nomorSurat) {
          setFormData(prev => ({
            ...prev,
            nomor_surat: data.nomorSurat,
          }));
        }
      } catch (error) {
        nomorSuratGenerated.current = false; // Reset flag jika error
        console.error('Error generating nomor surat:', error);
      }
    };

    // Hanya generate jika user sudah ada dan belum pernah generate
    if (currentUser && !nomorSuratGenerated.current) {
      generateNomorSurat();
    }
  }, [currentUser]);

  // Fetch data pejabat
  useEffect(() => {
    const fetchPejabat = async () => {
      if (!currentUser || !currentUser.id) {
        setPejabatError('Anda harus login terlebih dahulu');
        setIsLoadingPejabat(false);
        return;
      }

      // Prevent multiple fetches
      if (pejabatFetched.current) {
        return;
      }

      try {
        pejabatFetched.current = true;
        setIsLoadingPejabat(true);
        setPejabatError(null);

        const kelurahanId = currentUser?.kelurahan_id || '';
        const url = kelurahanId
          ? `/api/pejabat/active?userId=${currentUser.id}&kelurahanId=${kelurahanId}`
          : `/api/pejabat/active?userId=${currentUser.id}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          setPejabatError(data.error || 'Gagal mengambil data pejabat');
          setIsLoadingPejabat(false);
          return;
        }

        if (data.success && data.pejabat) {
          setPejabatList(data.pejabat);

          if (data.pejabat.length > 0) {
            const firstPejabat = data.pejabat[0];
            setSelectedPejabatId(firstPejabat.id.toString());
            setFormData(prev => ({
              ...prev,
              nama_pejabat: firstPejabat.nama,
              nip_pejabat: firstPejabat.nip || '',
              jabatan: firstPejabat.jabatan,
              jabatan_detail: firstPejabat.jabatan,
            }));
          }
        }

        setIsLoadingPejabat(false);
      } catch (error) {
        pejabatFetched.current = false; // Reset flag on error to allow retry
        console.error('Error fetching pejabat:', error);
        setPejabatError('Terjadi kesalahan saat mengambil data pejabat');
        setIsLoadingPejabat(false);
      }
    };

    fetchPejabat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePejabatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pejabatId = e.target.value;
    setSelectedPejabatId(pejabatId);

    const selectedPejabat = pejabatList.find(p => p.id.toString() === pejabatId);
    if (selectedPejabat) {
      setFormData(prev => ({
        ...prev,
        nama_pejabat: selectedPejabat.nama,
        nip_pejabat: selectedPejabat.nip || '',
        jabatan: selectedPejabat.jabatan,
        jabatan_detail: selectedPejabat.jabatan,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAlamatIbuSamaDenganBapak = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAlamatIbuSamaDenganBapak(checked);

    if (checked) {
      // Copy alamat bapak ke alamat ibu
      setFormData(prev => ({
        ...prev,
        alamat_ibu: prev.alamat_bapak
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: checked };

      if (name === 'bapak_almarhum') {
        if (checked) {
          newData.nik_bapak = '-';
          newData.tempat_lahir_bapak = '-';
          newData.tanggal_lahir_bapak = '-';
          newData.agama_bapak = '-';
          newData.pekerjaan_bapak = '-';
          newData.negara_bapak = '-';
          newData.alamat_bapak = '-';
        } else {
          newData.nik_bapak = '';
          newData.tempat_lahir_bapak = '';
          newData.tanggal_lahir_bapak = '';
          newData.agama_bapak = '';
          newData.pekerjaan_bapak = '';
          newData.negara_bapak = 'Indonesia';
          newData.alamat_bapak = '';
        }
      }

      if (name === 'ibu_almarhum') {
        if (checked) {
          newData.nik_ibu = '-';
          newData.tempat_lahir_ibu = '-';
          newData.tanggal_lahir_ibu = '-';
          newData.agama_ibu = '-';
          newData.pekerjaan_ibu = '-';
          newData.negara_ibu = '-';
          newData.alamat_ibu = '-';
        } else {
          newData.nik_ibu = '';
          newData.tempat_lahir_ibu = '';
          newData.tanggal_lahir_ibu = '';
          newData.agama_ibu = '';
          newData.pekerjaan_ibu = '';
          newData.negara_ibu = 'Indonesia';
          newData.alamat_ibu = '';
        }
      }

      return newData;
    });
  };

  const generateSampleData = () => {
    const sampleData = {
      // Data Surat
      nomor_surat: formData.nomor_surat, // Keep auto-generated nomor

      // Data Pemohon
      nik_pemohon: '3201234567890123',
      nama_pemohon: 'Ahmad Fauzi',
      tempat_lahir_pemohon: 'Tangerang',
      tanggal_lahir_pemohon: '1995-08-15',
      kelamin_pemohon: 'Laki-laki',
      agama_pemohon: 'Islam',
      pekerjaan_pemohon: 'Karyawan Swasta',
      negara_pemohon: 'Indonesia',
      alamat_pemohon: 'Jl. Merdeka No. 45',
      rt_pemohon: '003',
      rw_pemohon: '005',
      kelurahan_pemohon: kelurahanData?.nama || 'Cibodas',
      kecamatan_pemohon: 'Tangerang',

      // Status Perkawinan
      status_jika_laki_laki: 'Jejaka',
      status_jika_perempuan: '',

      // Data Bapak
      nik_bapak: '3201234567890001',
      nama_bapak: 'Budi Santoso',
      bapak_almarhum: false,
      tempat_lahir_bapak: 'Tangerang',
      tanggal_lahir_bapak: '1970-05-20',
      agama_bapak: 'Islam',
      pekerjaan_bapak: 'Wiraswasta',
      negara_bapak: 'Indonesia',
      alamat_bapak: 'Jl. Merdeka No. 45, RT 003/RW 005, Cibodas, Tangerang',

      // Data Ibu
      nik_ibu: '3201234567890002',
      nama_ibu: 'Siti Aminah',
      ibu_almarhum: false,
      tempat_lahir_ibu: 'Tangerang',
      tanggal_lahir_ibu: '1972-03-10',
      agama_ibu: 'Islam',
      pekerjaan_ibu: 'Ibu Rumah Tangga',
      negara_ibu: 'Indonesia',
      alamat_ibu: 'Jl. Merdeka No. 45, RT 003/RW 005, Cibodas, Tangerang',

      // Data Kelurahan
      kelurahan: kelurahanData?.nama || 'Cibodas',

      // Data Pejabat (keep existing)
      nama_pejabat: formData.nama_pejabat,
      nip_pejabat: formData.nip_pejabat,
      jabatan: formData.jabatan,
      jabatan_detail: formData.jabatan_detail,
    };

    setFormData(sampleData);
    alert('Data contoh berhasil dimuat!');
  };

  const handlePreview = () => {
    const dataToPreview = { ...formData };

    // Append (ALM) / (ALM) to names if checked
    if (dataToPreview.bapak_almarhum && dataToPreview.nama_bapak) {
      dataToPreview.nama_bapak = `${dataToPreview.nama_bapak} (ALM)`;
    }

    if (dataToPreview.ibu_almarhum && dataToPreview.nama_ibu) {
      dataToPreview.nama_ibu = `${dataToPreview.nama_ibu} (ALM)`;
    }

    localStorage.setItem('pengantarNikahFormData', JSON.stringify(dataToPreview));
    router.push('/preview-pengantar-nikah');
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
                <div className="bg-pink-500 p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Form Pengantar Nikah (N-1)</h1>
                  <p className="text-sm text-gray-600">Lengkapi formulir di bawah ini dengan data yang benar</p>
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
        <form className="space-y-6">
          {/* Data Surat */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Data Surat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Surat <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="nomor_surat"
                    value={formData.nomor_surat}
                    onChange={handleChange}
                    placeholder="Auto-generate..."
                    required
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nomor surat otomatis berdasarkan database</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Pemohon */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary-600" />
                Data Pemohon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="nik_pemohon"
                    value={formData.nik_pemohon}
                    onChange={handleChange}
                    placeholder="Masukkan NIK (16 digit)"
                    maxLength={16}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="nama_pemohon"
                    value={formData.nama_pemohon}
                    onChange={handleChange}
                    placeholder="Nama sesuai KTP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="tempat_lahir_pemohon"
                    value={formData.tempat_lahir_pemohon}
                    onChange={handleChange}
                    placeholder="Kota/Kabupaten"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="tanggal_lahir_pemohon"
                    value={formData.tanggal_lahir_pemohon}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kelamin_pemohon"
                    value={formData.kelamin_pemohon}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agama <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="agama_pemohon"
                    value={formData.agama_pemohon}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Agama</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pekerjaan_pemohon"
                    value={formData.pekerjaan_pemohon}
                    onChange={handleChange}
                    placeholder="Contoh: Karyawan Swasta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="negara_pemohon"
                    value={formData.negara_pemohon}
                    onChange={handleChange}
                    placeholder="Indonesia"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="alamat_pemohon"
                    value={formData.alamat_pemohon}
                    onChange={handleChange}
                    placeholder="Jalan, Nomor Rumah"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RT <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="rt_pemohon"
                    value={formData.rt_pemohon}
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
                    type="text"
                    name="rw_pemohon"
                    value={formData.rw_pemohon}
                    onChange={handleChange}
                    placeholder="001"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelurahan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="kelurahan_pemohon"
                    value={formData.kelurahan_pemohon}
                    onChange={handleChange}
                    placeholder="Nama Kelurahan"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Untuk Surat Pernyataan</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="kecamatan_pemohon"
                    value={formData.kecamatan_pemohon}
                    onChange={handleChange}
                    placeholder="Nama Kecamatan"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Untuk Surat Pernyataan</p>
                </div>
              </div>

              {/* Status Perkawinan Conditional */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.kelamin_pemohon === 'Laki-laki' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Perkawinan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status_jika_laki_laki"
                      value={formData.status_jika_laki_laki}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value="Jejaka">Jejaka</option>
                      <option value="Duda">Duda</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Untuk template N1.docx</p>
                  </div>
                )}

                {formData.kelamin_pemohon === 'Perempuan' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Perkawinan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status_jika_perempuan"
                      value={formData.status_jika_perempuan}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value="Perawan">Perawan</option>
                      <option value="Janda">Janda</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Untuk template N1.docx</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Bapak */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Data Bapak Kandung (Opsional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK Bapak
                  </label>
                  <Input
                    type="text"
                    name="nik_bapak"
                    value={formData.nik_bapak}
                    onChange={handleChange}
                    placeholder="Masukkan NIK (16 digit)"
                    maxLength={16}
                    disabled={(formData as any).bapak_almarhum}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Lengkap Bapak
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="bapak_almarhum"
                        id="bapak_almarhum"
                        checked={(formData as any).bapak_almarhum || false}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                      />
                      <label htmlFor="bapak_almarhum" className="ml-2 text-xs text-gray-600 cursor-pointer">
                        Almarhum (ALM)
                      </label>
                    </div>
                  </div>
                  <Input
                    type="text"
                    name="nama_bapak"
                    value={formData.nama_bapak}
                    onChange={handleChange}
                    placeholder="Nama sesuai KTP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Lahir
                  </label>
                  <Input
                    type="text"
                    name="tempat_lahir_bapak"
                    value={formData.tempat_lahir_bapak}
                    onChange={handleChange}
                    placeholder="Kota/Kabupaten"
                    disabled={(formData as any).bapak_almarhum}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <Input
                    type={(formData as any).bapak_almarhum ? "text" : "date"}
                    name="tanggal_lahir_bapak"
                    value={formData.tanggal_lahir_bapak}
                    onChange={handleChange}
                    disabled={(formData as any).bapak_almarhum}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agama
                  </label>
                  <select
                    name="agama_bapak"
                    value={formData.agama_bapak}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={(formData as any).bapak_almarhum}
                  >
                    <option value="">Pilih Agama</option>
                    <option value="-">-</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pekerjaan
                  </label>
                  <Input
                    type="text"
                    name="pekerjaan_bapak"
                    value={formData.pekerjaan_bapak}
                    onChange={handleChange}
                    placeholder="Contoh: Wiraswasta"
                    disabled={(formData as any).bapak_almarhum}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan
                  </label>
                  <Input
                    type="text"
                    name="negara_bapak"
                    value={formData.negara_bapak}
                    onChange={handleChange}
                    placeholder="Indonesia"
                    disabled={(formData as any).bapak_almarhum}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <Input
                    type="text"
                    name="alamat_bapak"
                    value={formData.alamat_bapak}
                    onChange={handleChange}
                    placeholder="Alamat lengkap"
                    disabled={(formData as any).bapak_almarhum}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Ibu */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Data Ibu Kandung (Opsional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK Ibu
                  </label>
                  <Input
                    type="text"
                    name="nik_ibu"
                    value={formData.nik_ibu}
                    onChange={handleChange}
                    placeholder="Masukkan NIK (16 digit)"
                    maxLength={16}
                    disabled={(formData as any).ibu_almarhum}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Lengkap Ibu
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="ibu_almarhum"
                        id="ibu_almarhum"
                        checked={(formData as any).ibu_almarhum || false}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                      />
                      <label htmlFor="ibu_almarhum" className="ml-2 text-xs text-gray-600 cursor-pointer">
                        Almarhumah (ALM)
                      </label>
                    </div>
                  </div>
                  <Input
                    type="text"
                    name="nama_ibu"
                    value={formData.nama_ibu}
                    onChange={handleChange}
                    placeholder="Nama sesuai KTP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Lahir
                  </label>
                  <Input
                    type="text"
                    name="tempat_lahir_ibu"
                    value={formData.tempat_lahir_ibu}
                    onChange={handleChange}
                    placeholder="Kota/Kabupaten"
                    disabled={(formData as any).ibu_almarhum}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <Input
                    type={(formData as any).ibu_almarhum ? "text" : "date"}
                    name="tanggal_lahir_ibu"
                    value={formData.tanggal_lahir_ibu}
                    onChange={handleChange}
                    disabled={(formData as any).ibu_almarhum}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agama
                  </label>
                  <select
                    name="agama_ibu"
                    value={formData.agama_ibu}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={(formData as any).ibu_almarhum}
                  >
                    <option value="">Pilih Agama</option>
                    <option value="-">-</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pekerjaan
                  </label>
                  <Input
                    type="text"
                    name="pekerjaan_ibu"
                    value={formData.pekerjaan_ibu}
                    onChange={handleChange}
                    placeholder="Contoh: Ibu Rumah Tangga"
                    disabled={(formData as any).ibu_almarhum}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan
                  </label>
                  <Input
                    type="text"
                    name="negara_ibu"
                    value={formData.negara_ibu}
                    onChange={handleChange}
                    placeholder="Indonesia"
                    disabled={(formData as any).ibu_almarhum}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Alamat
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="alamatIbuSama"
                        checked={alamatIbuSamaDenganBapak}
                        onChange={handleAlamatIbuSamaDenganBapak}
                        disabled={(formData as any).ibu_almarhum}
                        className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 disabled:opacity-50"
                      />
                      <label htmlFor="alamatIbuSama" className={`ml-2 text-sm text-gray-600 cursor-pointer ${(formData as any).ibu_almarhum ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Sama dengan alamat Bapak
                      </label>
                    </div>
                  </div>
                  <Input
                    type="text"
                    name="alamat_ibu"
                    value={formData.alamat_ibu}
                    onChange={handleChange}
                    placeholder="Alamat lengkap"
                    disabled={(formData as any).ibu_almarhum || alamatIbuSamaDenganBapak}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Pejabat */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                Pejabat Penandatangan
              </h2>

              {pejabatError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{pejabatError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Pejabat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPejabatId}
                    onChange={handlePejabatChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={isLoadingPejabat || pejabatList.length === 0}
                    required
                  >
                    <option value="">
                      {isLoadingPejabat ? 'Memuat...' : 'Pilih Pejabat'}
                    </option>
                    {pejabatList.map((pejabat) => (
                      <option key={pejabat.id} value={pejabat.id}>
                        {pejabat.nama} - {pejabat.jabatan}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPejabatId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Nama Pejabat
                      </label>
                      <p className="text-gray-900 font-medium">{formData.nama_pejabat}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        NIP
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formData.nip_pejabat || '-'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Jabatan
                      </label>
                      <p className="text-gray-900 font-medium">{formData.jabatan}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handlePreview}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Surat
            </Button>
          </div>
        </form>
      </div >
    </DashboardLayout >
  );
}
