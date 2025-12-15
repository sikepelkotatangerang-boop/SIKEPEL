'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  FileText,
  User,
  MapPin,
  Home,
  Eye,
  AlertCircle,
  Loader2,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Building2
} from 'lucide-react';
import { mockAuth, getKelurahanDataFromUser } from '@/lib/mockData';

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

interface FormData {
  // Nomor Surat
  nomor_surat: string;

  // Data Pemohon
  nik_pemohon: string;
  nama_pemohon: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  kelamin_pemohon: string;
  agama: string;
  pekerjaan: string;
  perkawinan: string;
  negara: string;

  // Alamat
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota_kabupaten: string;
  alamat_kelurahan: string;

  // Keperluan
  peruntukan: string;
  pengantar_rt: string;

  // Data Pejabat (auto-filled)
  pejabat_id?: number;
  nama_pejabat: string;
  nip_pejabat: string;
  jabatan: string;
}

export default function FormBelumRumahPage() {
  const router = useRouter();
  const currentUser = mockAuth.getCurrentUser();
  const kelurahanData = getKelurahanDataFromUser();

  // Ref untuk track apakah nomor surat sudah di-generate (prevent multiple calls)
  const nomorSuratGenerated = useRef(false);
  // Track if pejabat has been fetched to prevent multiple calls
  const pejabatFetched = useRef(false);
  // Track if kelurahan data has been updated to prevent multiple calls
  const kelurahanUpdated = useRef(false);

  const [formData, setFormData] = useState<FormData>({
    nomor_surat: '',
    nik_pemohon: '',
    nama_pemohon: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    kelamin_pemohon: 'Laki-laki',
    agama: 'Islam',
    pekerjaan: '',
    perkawinan: 'Kawin',
    negara: 'Indonesia',
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: kelurahanData?.nama || '',
    kecamatan: kelurahanData?.kecamatan || 'Cibodas',
    kota_kabupaten: kelurahanData?.kota || 'Kota Tangerang',
    peruntukan: '',
    pengantar_rt: '',
    nama_pejabat: '',
    nip_pejabat: '',
    jabatan: '',
    alamat_kelurahan: kelurahanData?.alamat || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPejabat, setIsLoadingPejabat] = useState(true);
  const [pejabatError, setPejabatError] = useState<string | null>(null);
  const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
  const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');

  // Fetch data pejabat dari database
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

          // Auto-select first pejabat if available
          if (data.pejabat.length > 0) {
            const firstPejabat = data.pejabat[0];
            setSelectedPejabatId(firstPejabat.id.toString());
            setFormData(prev => ({
              ...prev,
              nama_pejabat: firstPejabat.nama,
              nip_pejabat: firstPejabat.nip || '',
              jabatan: firstPejabat.jabatan,
            }));
          }
        }

        setIsLoadingPejabat(false);
      } catch (error) {
        pejabatFetched.current = false; // Reset flag on error to allow retry
        setPejabatError('Terjadi kesalahan saat mengambil data pejabat. Hubungi admin.');
        setIsLoadingPejabat(false);
      }
    };

    fetchPejabat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data kelurahan saat component mount
  useEffect(() => {
    if (kelurahanData && !kelurahanUpdated.current) {
      kelurahanUpdated.current = true;
      setFormData(prev => ({
        ...prev,
        kelurahan: kelurahanData.nama,
        alamat_kelurahan: kelurahanData.alamat,
        kecamatan: kelurahanData.kecamatan,
        kota_kabupaten: kelurahanData.kota,
      }));
    }
  }, []); // Run only once on mount

  // Auto-generate nomor surat saat component mount (hanya sekali)
  useEffect(() => {
    const generateNomorSurat = async () => {
      try {
        // Mark as generated to prevent multiple calls
        nomorSuratGenerated.current = true;

        const kelurahanId = currentUser?.kelurahan_id || '';
        const response = await fetch(`/api/generate-nomor-surat?jenis=Belum Memiliki Rumah&kelurahanId=${kelurahanId}`);
        const data = await response.json();

        if (data.success && data.nomorSurat) {
          setFormData(prev => ({
            ...prev,
            nomor_surat: data.nomorSurat,
          }));
        }
      } catch (error) {
        nomorSuratGenerated.current = false; // Reset flag jika error
      }
    };

    // Hanya generate jika user sudah ada dan belum pernah generate
    if (currentUser && !nomorSuratGenerated.current) {
      generateNomorSurat();
    }
  }, [currentUser]);

  // Restore data dari sessionStorage saat kembali dari preview
  useEffect(() => {
    const storedData = sessionStorage.getItem('belum_rumah_preview_data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        // Jika ada nomor surat yang tersimpan, mark sebagai sudah generated
        if (parsedData.nomor_surat) {
          nomorSuratGenerated.current = true;
        }

        setFormData(prev => ({
          ...prev,
          ...parsedData,
        }));

        // Set selected pejabat jika ada
        if (parsedData.pejabat_id) {
          setSelectedPejabatId(parsedData.pejabat_id.toString());
        }
      } catch (error) {
        // Silent fail - data restoration is optional
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePejabatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pejabatId = e.target.value;
    setSelectedPejabatId(pejabatId);

    if (pejabatId) {
      const selectedPejabat = pejabatList.find(p => p.id.toString() === pejabatId);
      if (selectedPejabat) {
        setFormData(prev => ({
          ...prev,
          nama_pejabat: selectedPejabat.nama,
          nip_pejabat: selectedPejabat.nip || '',
          jabatan: selectedPejabat.jabatan,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        nama_pejabat: '',
        nip_pejabat: '',
        jabatan: '',
      }));
    }
  };

  const generateSampleData = () => {
    const sampleData = {
      // Data Pemohon
      nik_pemohon: '3201234567890123',
      nama_pemohon: 'Budi Santoso',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '1985-05-15',
      kelamin_pemohon: 'Laki-laki',
      agama: 'Islam',
      pekerjaan: 'Karyawan Swasta',
      perkawinan: 'Kawin',
      negara: 'Indonesia',

      // Alamat
      alamat: 'Jl. Merdeka No. 123',
      rt: '003',
      rw: '005',
      kelurahan: kelurahanData?.nama || 'Cibodas',
      kecamatan: kelurahanData?.kecamatan || 'Cibodas',
      kota_kabupaten: kelurahanData?.kota || 'Kota Tangerang',
      alamat_kelurahan: kelurahanData?.alamat || 'Jl. Raya Cibodas No. 45, Cibodas',

      // Keperluan
      peruntukan: 'Pengajuan KPR di Bank',
      pengantar_rt: '001/RT.003/RW.005/X/2025',

      // Data Pejabat
      nama_pejabat: formData.nama_pejabat,
      nip_pejabat: formData.nip_pejabat,
      jabatan: formData.jabatan,
    };

    setFormData(prev => ({
      ...prev,
      ...sampleData,
    }));
    alert('Data contoh berhasil dimuat!');
  };

  const handlePreview = async () => {
    // Validasi data pejabat
    if (pejabatError) {
      alert(pejabatError);
      return;
    }

    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
      alert('Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.');
      return;
    }

    // Simpan data ke sessionStorage untuk digunakan di halaman preview
    const dataToSave = {
      ...formData,
      pejabat_id: selectedPejabatId,
    };
    sessionStorage.setItem('belum_rumah_preview_data', JSON.stringify(dataToSave));

    // Redirect ke halaman preview
    router.push('/preview-belum-rumah');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi data pejabat
    if (pejabatError) {
      alert(pejabatError);
      return;
    }

    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
      alert('Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.');
      return;
    }

    // Redirect ke preview terlebih dahulu
    handlePreview();
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
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Form Surat Keterangan Belum Memiliki Rumah</h1>
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
            Hasilkan Data Contoh
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Surat */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Data Surat
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Surat <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="nomor_surat"
                  value={formData.nomor_surat}
                  onChange={handleInputChange}
                  placeholder="Auto-generate..."
                  required
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Nomor surat otomatis berdasarkan database</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Pemohon */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Data Pemohon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="NIK"
                  name="nik_pemohon"
                  value={formData.nik_pemohon}
                  onChange={handleInputChange}
                  placeholder="16 digit NIK"
                  maxLength={16}
                  required
                />
                <Input
                  label="Nama Lengkap"
                  name="nama_pemohon"
                  value={formData.nama_pemohon}
                  onChange={handleInputChange}
                  placeholder="Nama sesuai KTP"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tempat Lahir"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={handleInputChange}
                  placeholder="Kota/Kabupaten"
                  required
                />
                <Input
                  label="Tanggal Lahir"
                  name="tanggal_lahir"
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <select
                    name="kelamin_pemohon"
                    value={formData.kelamin_pemohon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agama
                  </label>
                  <select
                    name="agama"
                    value={formData.agama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Pekerjaan"
                  name="pekerjaan"
                  value={formData.pekerjaan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Karyawan Swasta"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Perkawinan
                  </label>
                  <select
                    name="perkawinan"
                    value={formData.perkawinan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
              </div>

              <Input
                label="Kewarganegaraan"
                name="negara"
                value={formData.negara}
                onChange={handleInputChange}
                required
              />
            </CardContent>
          </Card>

          {/* Alamat */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                Alamat Tempat Tinggal
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat lengkap"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RT <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="rt"
                    value={formData.rt}
                    onChange={handleInputChange}
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
                    name="rw"
                    value={formData.rw}
                    onChange={handleInputChange}
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
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleInputChange}
                    placeholder="Kelurahan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                    placeholder="Kecamatan"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kabupaten/Kota <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="kota_kabupaten"
                    value={formData.kota_kabupaten}
                    onChange={handleInputChange}
                    placeholder="Masukkan kabupaten/kota"
                    required
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Kantor Kelurahan
                  </label>
                  <Input
                    type="text"
                    name="alamat_kelurahan"
                    value={formData.alamat_kelurahan}
                    onChange={handleInputChange}
                    placeholder="Alamat kantor kelurahan"
                  />
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Keperluan */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Keperluan</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peruntukan/Keperluan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="peruntukan"
                  value={formData.peruntukan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Pengajuan KPR, Subsidi Perumahan, dll"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <Input
                label="Nomor Surat Pengantar RT (Opsional)"
                name="pengantar_rt"
                value={formData.pengantar_rt}
                onChange={handleInputChange}
                placeholder="Contoh: 001/RT.003/RW.005/X/2025"
              />
            </CardContent>
          </Card>

          {/* Data Pejabat Penandatangan */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Data Pejabat Penandatangan</h2>

              {/* Error Alert */}
              {pejabatError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Perhatian!</p>
                    <p className="text-sm text-red-700 mt-1">{pejabatError}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoadingPejabat && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">Memuat data pejabat...</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Pejabat Penandatangan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPejabatId}
                    onChange={handlePejabatChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={isLoadingPejabat || pejabatList.length === 0}
                  >
                    <option value="">-- Pilih Pejabat --</option>
                    {pejabatList.map((pejabat) => (
                      <option key={pejabat.id} value={pejabat.id}>
                        {currentUser?.role === 'admin' && pejabat.kelurahan_nama
                          ? `${pejabat.kelurahan_nama} - ${pejabat.nama} (${pejabat.jabatan})`
                          : `${pejabat.nama} - ${pejabat.jabatan}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentUser?.role === 'admin'
                      ? 'Admin dapat memilih pejabat dari semua kelurahan'
                      : 'Pilih pejabat yang akan menandatangani surat'}
                  </p>
                </div>
              </div>

              {/* Detail Pejabat Terpilih */}
              {selectedPejabatId && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Detail Pejabat Terpilih:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    {currentUser?.role === 'admin' && (
                      <div>
                        <span className="text-gray-600">Kelurahan:</span>
                        <p className="font-medium text-gray-900">
                          {pejabatList.find(p => p.id.toString() === selectedPejabatId)?.kelurahan_nama || '-'}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Nama:</span>
                      <p className="font-medium text-gray-900">{formData.nama_pejabat}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">NIP:</span>
                      <p className="font-medium text-gray-900">{formData.nip_pejabat || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jabatan:</span>
                      <p className="font-medium text-gray-900">{formData.jabatan}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isSubmitting || !!pejabatError || isLoadingPejabat}
              className="min-w-[200px]"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Dokumen
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
