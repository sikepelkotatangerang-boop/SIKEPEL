'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Plus,
  FileCheck,
  Home,
  Briefcase,
  Users,
  Heart,
  FileText,
  Building,
  CreditCard,
  Search
} from 'lucide-react';

// Data jenis pelayanan surat keterangan
const jenisPelayanan = [
  {
    id: 1,
    nama: 'Surat Keterangan Tidak Mampu (SKTM)',
    icon: Users,
    color: 'bg-yellow-500',
    deskripsi: 'Surat keterangan yang menyatakan bahwa seseorang termasuk dalam kategori tidak mampu secara ekonomi.',
    persyaratan: [
      'Fotocopy KTP pemohon',
      'Fotocopy Kartu Keluarga (KK)',
      'Surat Pengantar RT/RW',
      'Surat keterangan penghasilan (jika ada)',
      'Pas foto 3x4 (2 lembar)',
      'Materai 10.000'
    ],
    waktuProses: '1-2 hari kerja',
    formUrl: '/form-surat/sktm'
  },
  {
    id: 2,
    nama: 'Surat Keterangan Belum Memiliki Rumah',
    icon: Home,
    color: 'bg-blue-500',
    deskripsi: 'Surat keterangan yang menyatakan bahwa seseorang belum memiliki rumah.',
    persyaratan: [
      'Fotocopy KTP pemohon',
      'Fotocopy Kartu Keluarga (KK)',
      'Surat Pengantar RT/RW',
      'Pas foto 3x4 (2 lembar)',
      'Materai 10.000'
    ],
    waktuProses: '1-2 hari kerja',
    formUrl: '/form-surat/belum-rumah'
  },
  {
    id: 3,
    nama: 'Surat Keterangan Suami Istri',
    icon: Heart,
    color: 'bg-pink-500',
    deskripsi: 'Surat keterangan yang menyatakan hubungan suami istri.',
    persyaratan: [
      'Fotocopy KTP suami dan istri',
      'Fotocopy Kartu Keluarga (KK)',
      'Fotocopy Buku Nikah',
      'Surat Pengantar RT/RW',
      'Pas foto 4x6 (2 lembar)',
      'Materai 10.000'
    ],
    waktuProses: '1-2 hari kerja',
    formUrl: '/form-surat/suami-istri'
  },
  {
    id: 4,
    nama: 'Surat Keterangan Usaha',
    icon: Briefcase,
    color: 'bg-green-500',
    deskripsi: 'Surat keterangan yang menyatakan bahwa seseorang memiliki usaha di wilayah tertentu.',
    persyaratan: [
      'Fotocopy KTP pemilik usaha',
      'Fotocopy Kartu Keluarga (KK)',
      'Surat Pengantar RT/RW',
      'Pas foto 3x4 (2 lembar)',
      'Foto tempat usaha',
      'Materai 10.000'
    ],
    waktuProses: '2-3 hari kerja',
    formUrl: '/form-surat/usaha'
  },
  {
    id: 5,
    nama: 'Surat Keterangan Belum Menikah',
    icon: Users,
    color: 'bg-purple-500',
    deskripsi: 'Surat keterangan yang menyatakan bahwa seseorang belum pernah menikah.',
    persyaratan: [
      'Fotocopy KTP pemohon',
      'Fotocopy Kartu Keluarga (KK)',
      'Fotocopy Akta Kelahiran',
      'Surat Pengantar RT/RW',
      'Pas foto 4x6 (2 lembar)',
      'Materai 10.000'
    ],
    waktuProses: '1-2 hari kerja',
    formUrl: '/form-surat/belum-menikah'
  },
  {
    id: 6,
    nama: 'Surat Keterangan Umum',
    icon: FileText,
    color: 'bg-gray-500',
    deskripsi: 'Surat keterangan untuk berbagai keperluan umum lainnya.',
    persyaratan: [
      'Fotocopy KTP pemohon',
      'Fotocopy Kartu Keluarga (KK)',
      'Surat Pengantar RT/RW',
      'Pas foto 3x4 (2 lembar)',
      'Materai 10.000'
    ],
    waktuProses: '1-2 hari kerja',
    formUrl: '/form-surat/umum'
  },
  {
    id: 7,
    nama: 'Formulir KTP',
    icon: CreditCard,
    color: 'bg-indigo-500',
    deskripsi: 'Formulir pendaftaran peristiwa kependudukan untuk KK, KTP-el, KIA, dan perubahan data.',
    persyaratan: [
      'Fotocopy KTP pemohon',
      'Fotocopy Kartu Keluarga (KK)',
      'Nomor Handphone / WA',
      'Alamat Email',
      'Dokumen pendukung sesuai jenis permohonan'
    ],
    waktuProses: '1 hari kerja',
    formUrl: '/form-surat/pengantar-ktp'
  },
  {
    id: 8,
    nama: 'Surat Pengantar Nikah (N1)',
    icon: Heart,
    color: 'bg-red-500',
    deskripsi: 'Surat pengantar untuk keperluan pernikahan dari kelurahan.',
    persyaratan: [
      'Fotocopy KTP calon pengantin',
      'Fotocopy Kartu Keluarga (KK)',
      'Fotocopy Akta Kelahiran',
      'Surat Pengantar RT/RW',
      'Pas foto 4x6 (2 lembar)',
      'Materai 10.000'
    ],
    waktuProses: '1-2 hari kerja',
    formUrl: '/form-surat/pengantar-nikah'
  },
  {
    id: 9,
    nama: 'Surat Pindah Keluar (F-103)',
    icon: Building,
    color: 'bg-orange-500',
    deskripsi: 'Formulir pendaftaran perpindahan penduduk keluar dari wilayah kelurahan.',
    persyaratan: [
      'Fotocopy KTP pemohon',
      'Fotocopy Kartu Keluarga (KK)',
      'Surat Pengantar RT/RW',
      'Alamat tujuan pindah yang jelas',
      'Nomor Handphone / WA',
      'Alamat Email'
    ],
    waktuProses: '2-3 hari kerja',
    formUrl: '/form-surat/pindah-keluar'
  },
  // {
  //   id: 10,
  //   nama: 'Surat Perubahan Data (F-106)',
  //   icon: FileText,
  //   color: 'bg-teal-500',
  //   deskripsi: 'Surat Pernyataan Perubahan Elemen Data Kependudukan.',
  //   persyaratan: [
  //     'Fotocopy KTP pemohon',
  //     'Fotocopy Kartu Keluarga (KK)',
  //     'Bukti pendukung perubahan data (Ijazah, SK, dll)',
  //     'Surat Pengantar RT/RW'
  //   ],
  //   waktuProses: '1-2 hari kerja',
  //   formUrl: '/form-surat/perubahan-data'
  // }
];

export default function SuratKeteranganPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter pelayanan berdasarkan search
  const filteredPelayanan = jenisPelayanan.filter((jenis) =>
    jenis.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jenis.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pelayanan Administrasi</h1>
          <p className="mt-2 text-gray-600">
            Pilih jenis pelayanan administrasi yang Anda butuhkan
          </p>
        </div>

        {/* Search Bar */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari jenis pelayanan... (contoh: domisili, usaha, SKTM)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 h-12 text-base border-2 focus:border-primary-500"
              />
            </div>
            {searchTerm && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Ditemukan <span className="font-semibold text-primary-600">{filteredPelayanan.length}</span> hasil
                </p>
                {filteredPelayanan.length > 0 && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jenis Pelayanan Grid */}
        {filteredPelayanan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPelayanan.map((jenis) => {
              const Icon = jenis.icon;

              return (
                <Card
                  key={jenis.id}
                  className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-200 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`${jenis.color} p-4 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-2">
                          {jenis.nama}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                          {jenis.deskripsi}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-blue-700">
                              {jenis.waktuProses}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="shadow-md hover:shadow-lg transition-shadow"
                            onClick={() => router.push(jenis.formUrl || '/surat-keterangan')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajukan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white shadow-md">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tidak ada hasil ditemukan
                </h3>
                <p className="text-gray-600 mb-4">
                  Tidak ada jenis pelayanan yang cocok dengan pencarian &quot;{searchTerm}&quot;
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                >
                  Reset Pencarian
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 shadow-md">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Informasi Penting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      Pastikan semua dokumen persyaratan dalam kondisi baik dan terbaca dengan jelas
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      Fotocopy dokumen tidak perlu dilegalisir
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      Waktu proses dapat berbeda tergantung kelengkapan dokumen
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      Untuk informasi lebih lanjut, hubungi petugas pelayanan di kelurahan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
