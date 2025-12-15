'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Heart, ArrowLeft, FileText, Sparkles, User, MapPin, Building2, AlertCircle, Eye, Loader2 } from 'lucide-react';
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

export default function FormBelumMenikahPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pejabatError, setPejabatError] = useState<string | null>(null);
  const [isLoadingPejabat, setIsLoadingPejabat] = useState(true);
  const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
  const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');

  // Get data kelurahan dari user yang login
  const kelurahanData = getKelurahanDataFromUser();
  const currentUser = mockAuth.getCurrentUser();

  // Track refs to prevent multiple calls
  const pejabatFetched = useRef(false);
  const kelurahanUpdated = useRef(false);
  const nomorSuratFetched = useRef(false);

  const [formData, setFormData] = useState({
    // Data Surat
    nomor_surat: '',

    // Data Pemohon
    nik_pemohon: '',
    nama_pemohon: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    kelamin_pemohon: '',
    agama: '',
    pekerjaan: '',
    perkawinan: 'Belum Kawin',
    negara: 'Indonesia',

    // Alamat
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: kelurahanData?.nama || '',
    alamat_kelurahan: kelurahanData?.alamat || '',
    kecamatan: kelurahanData?.kecamatan || 'Cibodas',
    kota_kabupaten: kelurahanData?.kota || 'Kota Tangerang',

    // Keperluan
    peruntukan: '',
    pengantar_rt: '',

    // Data Pejabat
    nama_pejabat: '',
    nip_pejabat: '',
    jabatan: '',
  });

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
        console.error('Error fetching pejabat:', error);
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

  // Auto-generate nomor surat saat component mount
  useEffect(() => {
    const generateNomorSurat = async () => {
      // Prevent multiple calls
      if (nomorSuratFetched.current) return;

      try {
        nomorSuratFetched.current = true;
        const kelurahanId = currentUser?.kelurahan_id || '';
        const response = await fetch(`/api/generate-nomor-surat?jenis=Belum Menikah&kelurahanId=${kelurahanId}`);
        const data = await response.json();

        if (data.success && data.nomorSurat) {
          setFormData(prev => {
            // Only set if not already set (e.g. from restore)
            if (prev.nomor_surat) return prev;
            return {
              ...prev,
              nomor_surat: data.nomorSurat,
            };
          });
        }
      } catch (error) {
        console.error('Error generating nomor surat:', error);
        nomorSuratFetched.current = false; // Allow retry on error
      }
    };

    if (currentUser && !nomorSuratFetched.current) {
      generateNomorSurat();
    }
  }, [currentUser]);

  // Restore data dari sessionStorage saat kembali dari preview
  useEffect(() => {
    const storedData = sessionStorage.getItem('belumMenikahFormData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
        }));

        // Set selected pejabat jika ada
        if (parsedData.pejabat_id) {
          setSelectedPejabatId(parsedData.pejabat_id.toString());
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      // Data Surat
      nomor_surat: formData.nomor_surat, // Keep auto-generated number

      // Data Pemohon
      nik_pemohon: '3671012345678901',
      nama_pemohon: 'Ahmad Rizki Pratama',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1995-08-17',
      kelamin_pemohon: 'Laki-laki',
      agama: 'Islam',
      pekerjaan: 'Karyawan Swasta',
      perkawinan: 'Belum Kawin',
      negara: 'Indonesia',

      // Alamat
      alamat: 'Jl. Merdeka No. 45',
      rt: '002',
      rw: '003',
      kelurahan: kelurahanData?.nama || 'Cibodas',
      alamat_kelurahan: kelurahanData?.alamat || 'Jl. Raya Cibodas No. 45, Cibodas',
      kecamatan: kelurahanData?.kecamatan || 'Cibodas',
      kota_kabupaten: kelurahanData?.kota || 'Kota Tangerang',

      // Keperluan
      peruntukan: 'Persyaratan Melamar Pekerjaan',
      pengantar_rt: '001/RT.002/RW.003/X/2025',

      // Data Pejabat (keep current selection)
      nama_pejabat: formData.nama_pejabat,
      nip_pejabat: formData.nip_pejabat,
      jabatan: formData.jabatan,
    };

    setFormData(sampleData);
    alert('Data contoh berhasil dimuat! ✅');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi data pejabat
    if (pejabatError) {
      alert(pejabatError);
      return;
    }

    if (!formData.nama_pejabat || !formData.jabatan) {
      alert('Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.');
      return;
    }

    // Simpan data ke sessionStorage untuk digunakan di halaman preview
    sessionStorage.setItem('belumMenikahFormData', JSON.stringify(formData));

    // Redirect ke halaman preview
    router.push('/preview-belum-menikah');
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
              <h1 className="text-2xl font-bold text-gray-900">Form Surat Keterangan Belum Menikah</h1>
              <p className="text-sm text-gray-600">Lengkapi formulir di bawah ini dengan data yang benar</p>
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
                    onChange={handleInputChange}
                    placeholder="Auto-generate..."
                    required
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nomor surat otomatis berdasarkan database</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Pengantar RT
                  </label>
                  <Input
                    type="text"
                    name="pengantar_rt"
                    value={formData.pengantar_rt}
                    onChange={handleInputChange}
                    placeholder="Contoh: 001/RT.003/RW.005/X/2025"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - Nomor surat pengantar dari RT</p>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="nik_pemohon"
                    value={formData.nik_pemohon}
                    onChange={handleInputChange}
                    placeholder="16 digit NIK"
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
                    onChange={handleInputChange}
                    placeholder="Nama sesuai KTP"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleInputChange}
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
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kelamin_pemohon"
                    value={formData.kelamin_pemohon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    name="agama"
                    value={formData.agama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Karyawan Swasta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Perkawinan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="perkawinan"
                    value={formData.perkawinan}
                    onChange={handleInputChange}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: Belum Kawin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="negara"
                    value={formData.negara}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alamat */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Alamat Pemohon
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jl. Merdeka No. 123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="kota_kabupaten"
                    value={formData.kota_kabupaten}
                    onChange={handleInputChange}
                    placeholder="Kota/Kabupaten"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keperluan */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Keperluan
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peruntukan Surat <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="peruntukan"
                  value={formData.peruntukan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Persyaratan Melamar Pekerjaan"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Untuk keperluan apa surat ini dibuat</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Pejabat */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                Data Pejabat Penandatangan
              </h2>

              {isLoadingPejabat ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Memuat data pejabat...</span>
                </div>
              ) : pejabatError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{pejabatError}</p>
                    <p className="text-xs text-red-600 mt-1">Hubungi administrator untuk menambahkan data pejabat.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Pejabat <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedPejabatId}
                      onChange={handlePejabatChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Pilih Pejabat --</option>
                      {pejabatList.map((pejabat) => (
                        <option key={pejabat.id} value={pejabat.id.toString()}>
                          {pejabat.nama} - {pejabat.jabatan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPejabatId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">Informasi Pejabat Terpilih:</h3>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p><span className="font-medium">Nama:</span> {formData.nama_pejabat}</p>
                        <p><span className="font-medium">NIP:</span> {formData.nip_pejabat || '-'}</p>
                        <p><span className="font-medium">Jabatan:</span> {formData.jabatan}</p>
                      </div>
                    </div>
                  )}
                </>
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
              type="submit"
              disabled={isSubmitting || isLoadingPejabat || !!pejabatError}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Preview
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
