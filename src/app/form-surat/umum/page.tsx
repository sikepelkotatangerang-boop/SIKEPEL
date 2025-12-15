'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FileText, ArrowLeft, Sparkles, Building2, AlertCircle, Eye } from 'lucide-react';
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

export default function FormUmumPage() {
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
  const nomorSuratGenerated = useRef(false);
  const dataRestored = useRef(false);

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
    perkawinan: '',
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
    peruntukan: '', // Isi keterangan yang diperlukan
    pengantar_rt: '',

    // Data Pejabat
    pejabat_id: '',
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
              pejabat_id: firstPejabat.id.toString(),
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
        setPejabatError('Terjadi kesalahan saat mengambil data pejabat');
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

  // Restore data dari sessionStorage saat kembali dari preview (HARUS PERTAMA)
  useEffect(() => {
    const storedData = sessionStorage.getItem('umumFormData');
    if (storedData && !dataRestored.current) {
      try {
        dataRestored.current = true;
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
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  // Auto-generate nomor surat saat component mount (hanya sekali)
  useEffect(() => {
    const generateNomorSurat = async () => {
      try {
        // Mark as generated to prevent multiple calls
        nomorSuratGenerated.current = true;

        const kelurahanId = currentUser?.kelurahan_id || '';
        const response = await fetch(`/api/generate-nomor-surat?jenis=Surat Keterangan Umum&kelurahanId=${kelurahanId}`);
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

  const handlePejabatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pejabatId = e.target.value;
    setSelectedPejabatId(pejabatId);

    const selectedPejabat = pejabatList.find(p => p.id.toString() === pejabatId);
    if (selectedPejabat) {
      setFormData(prev => ({
        ...prev,
        pejabat_id: selectedPejabat.id.toString(),
        nama_pejabat: selectedPejabat.nama,
        nip_pejabat: selectedPejabat.nip || '',
        jabatan: selectedPejabat.jabatan,
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

  const generateSampleData = () => {
    const sampleData = {
      ...formData,
      nik_pemohon: '3671012345678901',
      nama_pemohon: 'Ahmad Rizki Pratama',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1995-08-17',
      kelamin_pemohon: 'Laki-laki',
      agama: 'Islam',
      pekerjaan: 'Wiraswasta',
      perkawinan: 'Belum Kawin',
      alamat: 'Jl. Merdeka No. 45',
      rt: '002',
      rw: '003',
      peruntukan: 'Untuk melamar pekerjaan',
      pengantar_rt: '001/RT.002/RW.003/X/2025',
    };
    setFormData(sampleData);
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
    sessionStorage.setItem('umumFormData', JSON.stringify(formData));

    // Redirect ke halaman preview
    router.push('/preview-umum');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                sessionStorage.removeItem('umumFormData');
                router.push('/surat-keterangan');
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Form Surat Keterangan Umum
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Isi formulir untuk membuat Surat Keterangan Umum
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={generateSampleData}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Isi Contoh Data
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Surat */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Data Surat</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nomor Surat"
                  name="nomor_surat"
                  value={formData.nomor_surat}
                  onChange={handleChange}
                  required
                  placeholder="B/001/400.8.2.2/X/2025"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Pemohon */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Data Pemohon</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="NIK"
                  name="nik_pemohon"
                  value={formData.nik_pemohon}
                  onChange={handleChange}
                  required
                  placeholder="3671012345678901"
                  maxLength={16}
                />
                <Input
                  label="Nama Lengkap"
                  name="nama_pemohon"
                  value={formData.nama_pemohon}
                  onChange={handleChange}
                  required
                  placeholder="Ahmad Rizki Pratama"
                />
                <Input
                  label="Tempat Lahir"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={handleChange}
                  required
                  placeholder="Jakarta"
                />
                <Input
                  label="Tanggal Lahir"
                  name="tanggal_lahir"
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kelamin_pemohon"
                    value={formData.kelamin_pemohon}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agama <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="agama"
                    value={formData.agama}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <Input
                  label="Pekerjaan"
                  name="pekerjaan"
                  value={formData.pekerjaan}
                  onChange={handleChange}
                  required
                  placeholder="Wiraswasta"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Perkawinan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="perkawinan"
                    value={formData.perkawinan}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Status</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
                <Input
                  label="Kewarganegaraan"
                  name="negara"
                  value={formData.negara}
                  onChange={handleChange}
                  required
                  placeholder="Indonesia"
                />
              </div>
            </CardContent>
          </Card>

          {/* Alamat */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Alamat</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Jl. Merdeka No. 45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Input
                  label="RT"
                  name="rt"
                  value={formData.rt}
                  onChange={handleChange}
                  required
                  placeholder="002"
                  maxLength={3}
                />
                <Input
                  label="RW"
                  name="rw"
                  value={formData.rw}
                  onChange={handleChange}
                  required
                  placeholder="003"
                  maxLength={3}
                />
                <Input
                  label="Kelurahan"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleChange}
                  placeholder="Kelurahan"
                  required
                />
                <Input
                  label="Kecamatan"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  placeholder="Kecamatan"
                  required
                />
                <Input
                  label="Kota/Kabupaten"
                  name="kota_kabupaten"
                  value={formData.kota_kabupaten}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Peruntukan */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Peruntukan</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peruntukan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="peruntukan"
                    value={formData.peruntukan}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Contoh: Untuk melamar pekerjaan / Untuk persyaratan sekolah"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Isi peruntukan surat ini
                  </p>
                </div>
                <Input
                  label="Nomor Pengantar RT (Opsional)"
                  name="pengantar_rt"
                  value={formData.pengantar_rt}
                  onChange={handleChange}
                  placeholder="001/RT.002/RW.003/X/2025"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pejabat Penandatangan */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Pejabat Penandatangan</h2>
              </div>

              {isLoadingPejabat ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Memuat data pejabat...</p>
                </div>
              ) : pejabatError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{pejabatError}</p>
                  </div>
                </div>
              ) : pejabatList.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Tidak Ada Pejabat</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Belum ada pejabat aktif yang terdaftar. Hubungi admin untuk menambahkan pejabat.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Pejabat <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedPejabatId}
                      onChange={handlePejabatChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Pejabat</option>
                      {pejabatList.map((pejabat) => (
                        <option key={pejabat.id} value={pejabat.id}>
                          {pejabat.nama} - {pejabat.jabatan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPejabatId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">Detail Pejabat:</p>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p><span className="font-medium">Nama:</span> {formData.nama_pejabat}</p>
                        <p><span className="font-medium">NIP:</span> {formData.nip_pejabat || '-'}</p>
                        <p><span className="font-medium">Jabatan:</span> {formData.jabatan}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem('umumFormData');
                router.push('/surat-keterangan');
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingPejabat || !!pejabatError}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {isSubmitting ? 'Memproses...' : 'Preview Dokumen'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
