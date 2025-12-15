'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Heart,
  Users, 
  MapPin, 
  Home,
  Eye,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Building2,
  FileText
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
  nomor_surat: string;
  nama_suami: string;
  tempat_lahir_suami: string;
  tanggal_lahir_suami: string;
  agama_suami: string;
  pekerjaan_suami: string;
  negara_suami: string;
  alamat_suami: string;
  rt_suami: string;
  rw_suami: string;
  kel_suami: string;
  kec_suami: string;
  kota_suami: string;
  nama_istri: string;
  tempat_lahir_istri: string;
  tanggal_lahir_istri: string;
  agama_istri: string;
  pekerjaan_istri: string;
  negara_istri: string;
  alamat_istri: string;
  rt_istri: string;
  rw_istri: string;
  kel_istri: string;
  kec_istri: string;
  kota_istri: string;
  tanggal_pernikahan: string;
  keterangan_akta_perkawinan: string;
  peruntukan: string;
  pengantar_rt: string;
  kelurahan: string;
  alamat_kelurahan: string;
  pejabat_id?: number;
  nama_pejabat: string;
  nip_pejabat: string;
  jabatan: string;
}

export default function FormSuamiIstriPage() {
  const router = useRouter();
  const currentUser = mockAuth.getCurrentUser();
  const kelurahanData = getKelurahanDataFromUser();
  
  // Ref untuk track apakah nomor surat sudah di-generate (prevent multiple calls)
  const nomorSuratGenerated = useRef(false);
  // Ref untuk track apakah data sudah di-restore dari sessionStorage
  const dataRestored = useRef(false);
  // Track if pejabat has been fetched to prevent multiple calls
  const pejabatFetched = useRef(false);
  // Track if kelurahan data has been updated to prevent multiple calls
  const kelurahanUpdated = useRef(false);
  
  const [formData, setFormData] = useState<FormData>({
    nomor_surat: '',
    nama_suami: '',
    tempat_lahir_suami: '',
    tanggal_lahir_suami: '',
    agama_suami: 'Islam',
    pekerjaan_suami: '',
    negara_suami: 'Indonesia',
    alamat_suami: '',
    rt_suami: '',
    rw_suami: '',
    kel_suami: kelurahanData?.nama || 'Cibodas',
    kec_suami: kelurahanData?.kecamatan || 'Cibodas',
    kota_suami: kelurahanData?.kota || 'Kota Tangerang',
    nama_istri: '',
    tempat_lahir_istri: '',
    tanggal_lahir_istri: '',
    agama_istri: 'Islam',
    pekerjaan_istri: '',
    negara_istri: 'Indonesia',
    alamat_istri: '',
    rt_istri: '',
    rw_istri: '',
    kel_istri: kelurahanData?.nama || 'Cibodas',
    kec_istri: kelurahanData?.kecamatan || 'Cibodas',
    kota_istri: kelurahanData?.kota || 'Kota Tangerang',
    tanggal_pernikahan: '',
    keterangan_akta_perkawinan: '',
    peruntukan: '',
    pengantar_rt: '',
    kelurahan: kelurahanData?.nama || 'Cibodas',
    alamat_kelurahan: kelurahanData?.alamat || '',
    nama_pejabat: '',
    nip_pejabat: '',
    jabatan: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
  const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');
  const [isLoadingPejabat, setIsLoadingPejabat] = useState(true);
  const [pejabatError, setPejabatError] = useState<string | null>(null);
  const [sameAddress, setSameAddress] = useState(true);

  // Fetch pejabat
  useEffect(() => {
    const fetchPejabat = async () => {
      if (!currentUser?.id) {
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
          return;
        }
        
        if (data.success && data.pejabat) {
          setPejabatList(data.pejabat);
          
          // Check if there's stored data to restore FIRST
          const storedData = sessionStorage.getItem('suami_istri_preview_data');
          
          if (storedData && !dataRestored.current) {
            // Restore data dari sessionStorage
            try {
              const parsedData = JSON.parse(storedData);
              dataRestored.current = true;
              
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
          
          // Auto-select first pejabat only if no data was restored
          if (!dataRestored.current && data.pejabat.length > 0) {
            const firstPejabat = data.pejabat[0];
            setSelectedPejabatId(firstPejabat.id.toString());
            setFormData(prev => ({
              ...prev,
              pejabat_id: firstPejabat.id,
              nama_pejabat: firstPejabat.nama,
              nip_pejabat: firstPejabat.nip || '',
              jabatan: firstPejabat.jabatan,
            }));
          }
        }
      } catch (error) {
        pejabatFetched.current = false; // Reset flag on error to allow retry
        setPejabatError('Terjadi kesalahan saat mengambil data pejabat');
      } finally {
        setIsLoadingPejabat(false);
      }
    };
    
    fetchPejabat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Run only once on mount

  // Update kelurahan
  useEffect(() => {
    if (kelurahanData && !kelurahanUpdated.current) {
      kelurahanUpdated.current = true;
      setFormData(prev => ({
        ...prev,
        kelurahan: kelurahanData.nama,
        alamat_kelurahan: kelurahanData.alamat,
        kel_suami: kelurahanData.nama,
        kec_suami: kelurahanData.kecamatan,
        kota_suami: kelurahanData.kota,
        kel_istri: kelurahanData.nama,
        kec_istri: kelurahanData.kecamatan,
        kota_istri: kelurahanData.kota,
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
        const response = await fetch(`/api/generate-nomor-surat?jenis=Surat Keterangan Suami Istri&kelurahanId=${kelurahanId}`);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
  // ✅ Single setState dengan batch updates
  setFormData(prev => {
    const updates: Partial<FormData> = { [name]: value };
    
    // Auto-copy alamat suami ke istri jika checkbox aktif
    if (sameAddress) {
      if (name === 'alamat_suami') updates.alamat_istri = value;
      if (name === 'rt_suami') updates.rt_istri = value;
      if (name === 'rw_suami') updates.rw_istri = value;
      if (name === 'kel_suami') updates.kel_istri = value;
      if (name === 'kec_suami') updates.kec_istri = value;
      if (name === 'kota_suami') updates.kota_istri = value;
    }
    
    return { ...prev, ...updates };
  });
};

  const handlePejabatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pejabatId = e.target.value;
    setSelectedPejabatId(pejabatId);
    if (pejabatId) {
      const selectedPejabat = pejabatList.find(p => p.id.toString() === pejabatId);
      if (selectedPejabat) {
        setFormData(prev => ({
          ...prev,
          pejabat_id: selectedPejabat.id,
          nama_pejabat: selectedPejabat.nama,
          nip_pejabat: selectedPejabat.nip || '',
          jabatan: selectedPejabat.jabatan,
        }));
      }
    }
  };

  const handleSameAddressChange = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        alamat_istri: prev.alamat_suami,
        rt_istri: prev.rt_suami,
        rw_istri: prev.rw_suami,
        kel_istri: prev.kel_suami,
        kec_istri: prev.kec_suami,
        kota_istri: prev.kota_suami,
      }));
    }
  };

  const generateSampleData = () => {
    // ✅ Gunakan functional update untuk preserve data pejabat dan nomor surat
    setFormData(prev => ({
      ...prev,
      // Keep existing nomor_surat (auto-generated)
      nama_suami: 'Ahmad Yani',
      tempat_lahir_suami: 'Tangerang',
      tanggal_lahir_suami: '1990-05-15',
      agama_suami: 'Islam',
      pekerjaan_suami: 'Wiraswasta',
      negara_suami: 'Indonesia',
      alamat_suami: 'Jl. Merdeka No. 123',
      rt_suami: '001',
      rw_suami: '005',
      kel_suami: kelurahanData?.nama || 'Cibodas',
      kec_suami: kelurahanData?.kecamatan || 'Cibodas',
      kota_suami: kelurahanData?.kota || 'Kota Tangerang',
      nama_istri: 'Siti Aminah',
      tempat_lahir_istri: 'Tangerang',
      tanggal_lahir_istri: '1992-08-20',
      agama_istri: 'Islam',
      pekerjaan_istri: 'Ibu Rumah Tangga',
      negara_istri: 'Indonesia',
      alamat_istri: 'Jl. Merdeka No. 123',
      rt_istri: '001',
      rw_istri: '005',
      kel_istri: kelurahanData?.nama || 'Cibodas',
      kec_istri: kelurahanData?.kecamatan || 'Cibodas',
      kota_istri: kelurahanData?.kota || 'Kota Tangerang',
      tanggal_pernikahan: '2015-06-10',
      keterangan_akta_perkawinan: 'Akta Nikah No. 123/AN/2015 tertanggal 10 Juni 2015',
      peruntukan: 'Administrasi Bank',
      pengantar_rt: `No. 001/RT.001/X/${new Date().getFullYear()}`,
      kelurahan: kelurahanData?.nama || 'Cibodas',
      alamat_kelurahan: kelurahanData?.alamat || '',
      // ✅ Keep existing pejabat data (prev values)
      pejabat_id: prev.pejabat_id,
      nama_pejabat: prev.nama_pejabat,
      nip_pejabat: prev.nip_pejabat,
      jabatan: prev.jabatan,
    }));
    setSameAddress(true);
  };

  const handlePreview = () => {
    if (!formData.nama_suami || !formData.nama_istri) {
      alert('Mohon lengkapi data suami dan istri');
      return;
    }
    if (!formData.tanggal_pernikahan) {
      alert('Mohon isi tanggal pernikahan');
      return;
    }
    if (!formData.nama_pejabat) {
      alert('Data pejabat penandatangan belum dipilih. Hubungi admin untuk menambahkan data pejabat.');
      return;
    }
    
    // Simpan data ke sessionStorage untuk digunakan di halaman preview
    const dataToSave = {
      ...formData,
      pejabat_id: selectedPejabatId,
    };
    sessionStorage.setItem('suami_istri_preview_data', JSON.stringify(dataToSave));
    
    router.push('/preview-suami-istri');
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <div className="bg-pink-500 p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Form Surat Keterangan Suami Istri</h1>
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

        {/* Data Surat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Data Surat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <Input type="text" name="nomor_surat" value={formData.nomor_surat} onChange={handleChange} placeholder="Auto-generate..." required readOnly className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Nomor surat otomatis berdasarkan database</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Suami */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Data Suami
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                <Input type="text" name="nama_suami" value={formData.nama_suami} onChange={handleChange} placeholder="Masukkan nama lengkap suami" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir <span className="text-red-500">*</span></label>
                <Input type="text" name="tempat_lahir_suami" value={formData.tempat_lahir_suami} onChange={handleChange} placeholder="Contoh: Tangerang" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir <span className="text-red-500">*</span></label>
                <Input type="date" name="tanggal_lahir_suami" value={formData.tanggal_lahir_suami} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agama <span className="text-red-500">*</span></label>
                <select name="agama_suami" value={formData.agama_suami} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pekerjaan <span className="text-red-500">*</span></label>
                <Input type="text" name="pekerjaan_suami" value={formData.pekerjaan_suami} onChange={handleChange} placeholder="Contoh: Wiraswasta" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kewarganegaraan <span className="text-red-500">*</span></label>
                <Input type="text" name="negara_suami" value={formData.negara_suami} onChange={handleChange} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat <span className="text-red-500">*</span></label>
                <Input type="text" name="alamat_suami" value={formData.alamat_suami} onChange={handleChange} placeholder="Contoh: Jl. Merdeka No. 123" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RT <span className="text-red-500">*</span></label>
                <Input type="text" name="rt_suami" value={formData.rt_suami} onChange={handleChange} placeholder="001" maxLength={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RW <span className="text-red-500">*</span></label>
                <Input type="text" name="rw_suami" value={formData.rw_suami} onChange={handleChange} placeholder="005" maxLength={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelurahan <span className="text-red-500">*</span></label>
                <Input type="text" name="kel_suami" value={formData.kel_suami} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan <span className="text-red-500">*</span></label>
                <Input type="text" name="kec_suami" value={formData.kec_suami} onChange={handleChange} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten <span className="text-red-500">*</span></label>
                <Input type="text" name="kota_suami" value={formData.kota_suami} onChange={handleChange} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Istri */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-pink-600" />
                Data Istri
              </CardTitle>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={sameAddress} onChange={(e) => handleSameAddressChange(e.target.checked)} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Alamat sama dengan suami</span>
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                <Input type="text" name="nama_istri" value={formData.nama_istri} onChange={handleChange} placeholder="Masukkan nama lengkap istri" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir <span className="text-red-500">*</span></label>
                <Input type="text" name="tempat_lahir_istri" value={formData.tempat_lahir_istri} onChange={handleChange} placeholder="Contoh: Tangerang" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir <span className="text-red-500">*</span></label>
                <Input type="date" name="tanggal_lahir_istri" value={formData.tanggal_lahir_istri} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agama <span className="text-red-500">*</span></label>
                <select name="agama_istri" value={formData.agama_istri} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pekerjaan <span className="text-red-500">*</span></label>
                <Input type="text" name="pekerjaan_istri" value={formData.pekerjaan_istri} onChange={handleChange} placeholder="Contoh: Ibu Rumah Tangga" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kewarganegaraan <span className="text-red-500">*</span></label>
                <Input type="text" name="negara_istri" value={formData.negara_istri} onChange={handleChange} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat <span className="text-red-500">*</span></label>
                <Input type="text" name="alamat_istri" value={formData.alamat_istri} onChange={handleChange} placeholder="Contoh: Jl. Merdeka No. 123" disabled={sameAddress} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RT <span className="text-red-500">*</span></label>
                <Input type="text" name="rt_istri" value={formData.rt_istri} onChange={handleChange} placeholder="001" maxLength={3} disabled={sameAddress} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RW <span className="text-red-500">*</span></label>
                <Input type="text" name="rw_istri" value={formData.rw_istri} onChange={handleChange} placeholder="005" maxLength={3} disabled={sameAddress} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelurahan <span className="text-red-500">*</span></label>
                <Input type="text" name="kel_istri" value={formData.kel_istri} onChange={handleChange} disabled={sameAddress} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan <span className="text-red-500">*</span></label>
                <Input type="text" name="kec_istri" value={formData.kec_istri} onChange={handleChange} disabled={sameAddress} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten <span className="text-red-500">*</span></label>
                <Input type="text" name="kota_istri" value={formData.kota_istri} onChange={handleChange} disabled={sameAddress} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Pernikahan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-600" />
              Data Pernikahan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pernikahan <span className="text-red-500">*</span></label>
                <Input type="date" name="tanggal_pernikahan" value={formData.tanggal_pernikahan} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan Akta Perkawinan <span className="text-red-500">*</span></label>
                <Input type="text" name="keterangan_akta_perkawinan" value={formData.keterangan_akta_perkawinan} onChange={handleChange} placeholder="Contoh: Akta Nikah No. 123/AN/2015" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keperluan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Keperluan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peruntukan <span className="text-red-500">*</span></label>
                <Input type="text" name="peruntukan" value={formData.peruntukan} onChange={handleChange} placeholder="Contoh: Administrasi Bank" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Pengantar RT <span className="text-red-500">*</span></label>
                <Input type="text" name="pengantar_rt" value={formData.pengantar_rt} onChange={handleChange} placeholder="Contoh: No. 001/RT.001/X/2025" required />
              </div>
            </div>
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
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
      </div>
    </DashboardLayout>
  );
}