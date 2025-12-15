'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Send, ArrowLeft, FileText, Sparkles, Building2, AlertCircle, Eye, Calendar } from 'lucide-react';
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

export default function FormSuratKeluarPage() {
  const router = useRouter();
  const [pejabatError, setPejabatError] = useState<string | null>(null);
  const [isLoadingPejabat, setIsLoadingPejabat] = useState(true);
  const [pejabatList, setPejabatList] = useState<PejabatData[]>([]);
  const [selectedPejabatId, setSelectedPejabatId] = useState<string>('');
  const [tujuanList, setTujuanList] = useState<string[]>(['']);

  const kelurahanData = getKelurahanDataFromUser();
  const currentUser = mockAuth.getCurrentUser();

  const [formData, setFormData] = useState({
    // Data Surat
    nomor_surat: '',
    tanggal_surat: new Date().toISOString().split('T')[0], // Default hari ini
    perihal: '',
    sifat: 'Biasa',
    jumlah_lampiran: '0',

    // Isi Surat
    isi_surat: '',

    // Data Acara (optional)
    hari_acara: '',
    tanggal_acara: '',
    waktu_acara: '',
    tempat_acara: '',

    // Akhiran surat (optional)
    akhiran: 'Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.',

    // Data Kelurahan
    kelurahan: kelurahanData?.nama || 'Cibodas',
    alamat_kelurahan: kelurahanData?.alamat || '',

    // Data Pejabat
    nama_pejabat: '',
    nip_pejabat: '',
    jabatan: '',
    jabatan_detail: '',
  });

  // Fetch data pejabat
  useEffect(() => {
    const fetchPejabat = async () => {
      if (!currentUser || !currentUser.id) {
        setPejabatError('Anda harus login terlebih dahulu');
        setIsLoadingPejabat(false);
        return;
      }

      try {
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
        console.error('Error fetching pejabat:', error);
        setPejabatError('Terjadi kesalahan saat mengambil data pejabat');
        setIsLoadingPejabat(false);
      }
    };

    fetchPejabat();
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

  const handleTujuanChange = (index: number, value: string) => {
    const newTujuanList = [...tujuanList];
    newTujuanList[index] = value;
    setTujuanList(newTujuanList);
  };

  const addTujuan = () => {
    setTujuanList([...tujuanList, '']);
  };

  const removeTujuan = (index: number) => {
    if (tujuanList.length > 1) {
      const newTujuanList = tujuanList.filter((_, i) => i !== index);
      setTujuanList(newTujuanList);
    }
  };

  const generateSampleData = () => {
    const sampleData = {
      nomor_surat: 'B/001/400.8/X/2025',
      tanggal_surat: '2025-10-18',
      perihal: 'Undangan Rapat Koordinasi',
      sifat: 'Penting',
      jumlah_lampiran: '1',
      isi_surat: 'Dengan hormat,\n\nSehubungan dengan akan dilaksanakannya Rapat Koordinasi tingkat Kelurahan, dengan ini kami mengundang Bapak/Ibu untuk hadir pada:',
      hari_acara: 'Senin',
      tanggal_acara: '2025-10-20',
      waktu_acara: '09:00 WIB s.d. selesai',
      tempat_acara: 'Aula Kelurahan Cibodas',
      akhiran: 'Demikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya kami ucapkan terima kasih.',
      kelurahan: kelurahanData?.nama || 'Cibodas',
      alamat_kelurahan: kelurahanData?.alamat || '',
      nama_pejabat: formData.nama_pejabat,
      nip_pejabat: formData.nip_pejabat,
      jabatan: formData.jabatan,
      jabatan_detail: formData.jabatan_detail,
    };

    setFormData(sampleData);
    setTujuanList([
      'Kepala Dinas Kependudukan dan Pencatatan Sipil Kota Tangerang',
      'Camat Tangerang',
      'Ketua RW 001 Kelurahan Cibodas'
    ]);
    alert('Data contoh berhasil dimuat!');
  };

  const handlePreview = () => {
    // Build data_acara string from individual fields
    let data_acara = '';
    if (formData.hari_acara || formData.tanggal_acara || formData.waktu_acara || formData.tempat_acara) {
      const parts = [];
      if (formData.hari_acara && formData.tanggal_acara) {
        parts.push(`Hari/Tanggal : ${formData.hari_acara}, ${formData.tanggal_acara}`);
      } else if (formData.hari_acara) {
        parts.push(`Hari         : ${formData.hari_acara}`);
      } else if (formData.tanggal_acara) {
        parts.push(`Tanggal      : ${formData.tanggal_acara}`);
      }
      if (formData.waktu_acara) {
        parts.push(`Waktu        : ${formData.waktu_acara}`);
      }
      if (formData.tempat_acara) {
        parts.push(`Tempat       : ${formData.tempat_acara}`);
      }
      data_acara = parts.join('\n');
    }

    const dataToSave = {
      ...formData,
      tujuan: tujuanList.filter(t => t.trim() !== '').join('\n'),
      data_acara
    };
    localStorage.setItem('suratKeluarFormData', JSON.stringify(dataToSave));
    router.push('/preview-surat-keluar');
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
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Form Surat Keluar</h1>
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
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800"
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
                    placeholder="Contoh: B/001/400.8/X/2025"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Masukkan nomor surat secara manual</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Surat <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="tanggal_surat"
                    value={formData.tanggal_surat}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Tanggal pembuatan surat</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sifat Surat <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sifat"
                    value={formData.sifat}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera</option>
                    <option value="Sangat Segera">Sangat Segera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Lampiran
                  </label>
                  <Input
                    type="number"
                    name="jumlah_lampiran"
                    value={formData.jumlah_lampiran}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perihal <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="perihal"
                    value={formData.perihal}
                    onChange={handleChange}
                    placeholder="Contoh: Undangan Rapat Koordinasi"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tujuan Surat <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {tujuanList.map((tujuan, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          value={tujuan}
                          onChange={(e) => handleTujuanChange(index, e.target.value)}
                          placeholder={`Tujuan ${index + 1}: Nama instansi/pejabat`}
                          required={index === 0}
                        />
                        {tujuanList.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeTujuan(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTujuan}
                      className="w-full"
                    >
                      + Tambah Tujuan
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Klik &quot;Tambah Tujuan&quot; untuk menambah lebih dari satu tujuan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Isi Surat */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Isi Surat
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Isi Surat <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="isi_surat"
                    value={formData.isi_surat}
                    onChange={handleChange}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tulis isi surat di sini..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Gunakan Enter untuk paragraf baru</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kalimat Penutup
                  </label>
                  <textarea
                    name="akhiran"
                    value={formData.akhiran}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Kalimat penutup surat..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Kalimat penutup standar sudah terisi otomatis, dapat diubah sesuai kebutuhan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Acara (Optional) */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Data Acara (Opsional)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Isi bagian ini jika surat berisi undangan atau informasi acara
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hari Acara
                  </label>
                  <Input
                    type="text"
                    name="hari_acara"
                    value={formData.hari_acara}
                    onChange={handleChange}
                    placeholder="Contoh: Senin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Acara
                  </label>
                  <Input
                    type="date"
                    name="tanggal_acara"
                    value={formData.tanggal_acara}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Acara
                  </label>
                  <Input
                    type="text"
                    name="waktu_acara"
                    value={formData.waktu_acara}
                    onChange={handleChange}
                    placeholder="Contoh: 09:00 WIB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Acara
                  </label>
                  <Input
                    type="text"
                    name="tempat_acara"
                    value={formData.tempat_acara}
                    onChange={handleChange}
                    placeholder="Contoh: Aula Kelurahan"
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
                    <h3 className="font-semibold text-red-900 mb-1">Perhatian</h3>
                    <p className="text-sm text-red-700">{pejabatError}</p>
                  </div>
                </div>
              )}

              {isLoadingPejabat ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Memuat data pejabat...</p>
                </div>
              ) : pejabatList.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Pejabat <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedPejabatId}
                      onChange={handlePejabatChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {pejabatList.map((pejabat) => (
                        <option key={pejabat.id} value={pejabat.id}>
                          {pejabat.nama} - {pejabat.jabatan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Pejabat
                      </label>
                      <Input
                        type="text"
                        value={formData.nama_pejabat}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIP
                      </label>
                      <Input
                        type="text"
                        value={formData.nip_pejabat}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jabatan
                      </label>
                      <Input
                        type="text"
                        value={formData.jabatan}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Tidak ada data pejabat aktif</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
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
              className="bg-blue-600 hover:bg-blue-700"
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
