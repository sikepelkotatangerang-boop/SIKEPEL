-- Seed Data untuk Surat Keterangan Belum Memiliki Rumah
-- Mock data untuk testing dan development

-- Insert mock data untuk berbagai kasus penggunaan
INSERT INTO belum_rumah_documents (
  nomor_surat, tanggal_surat,
  nik_pemohon, nama_pemohon, tempat_lahir, tanggal_lahir,
  kelamin_pemohon, agama, pekerjaan, perkawinan, negara,
  alamat, rt, rw, kelurahan, kecamatan, kota_kabupaten,
  peruntukan, pengantar_rt,
  pejabat_id, nama_pejabat, nip_pejabat, jabatan,
  kelurahan_id, created_by, status
) VALUES

-- 1. Pemohon untuk KPR (Kredit Pemilikan Rumah)
(
  '474.3/001/SKB-R/I/2025',
  '2025-01-10',
  '3671012505950001',
  'Ahmad Fauzi Rahman',
  'Tangerang',
  '1995-05-25',
  'Laki-laki',
  'Islam',
  'Karyawan Swasta',
  'Kawin',
  'Indonesia',
  'Jl. Mawar No. 15',
  '003',
  '005',
  'Cibodas',
  'Cibodas',
  'Kota Tangerang',
  'Pengajuan KPR (Kredit Pemilikan Rumah) di Bank Mandiri',
  '001/RT.003/I/2025',
  1,
  'Drs. H. Ahmad Suryadi, M.Si',
  '196501011990031001',
  'Lurah Cibodas',
  1,
  2,
  'active'
),

-- 2. Pemohon untuk subsidi perumahan
(
  '474.3/002/SKB-R/I/2025',
  '2025-01-12',
  '3671015208920002',
  'Siti Nurhaliza',
  'Jakarta',
  '1992-08-12',
  'Perempuan',
  'Islam',
  'Guru',
  'Kawin',
  'Indonesia',
  'Jl. Melati Raya No. 28',
  '005',
  '002',
  'Cibodas',
  'Cibodas',
  'Kota Tangerang',
  'Pengajuan Subsidi Perumahan Pemerintah',
  '002/RT.005/I/2025',
  1,
  'Drs. H. Ahmad Suryadi, M.Si',
  '196501011990031001',
  'Lurah Cibodas',
  1,
  2,
  'active'
),

-- 3. Pemohon muda untuk KPR pertama
(
  '474.3/003/SKB-R/I/2025',
  '2025-01-13',
  '3671011503980003',
  'Budi Santoso',
  'Tangerang',
  '1998-03-15',
  'Laki-laki',
  'Islam',
  'Wiraswasta',
  'Belum Kawin',
  'Indonesia',
  'Jl. Anggrek No. 42',
  '007',
  '003',
  'Cibodas Baru',
  'Cibodas',
  'Kota Tangerang',
  'Pengajuan KPR Rumah Pertama di BRI',
  '003/RT.007/I/2025',
  2,
  'H. Bambang Hermanto, S.Sos',
  '196702121991031002',
  'Lurah Cibodas Baru',
  2,
  3,
  'active'
),

-- 4. Pemohon untuk program rumah murah
(
  '474.3/004/SKB-R/I/2025',
  '2025-01-14',
  '3671016710880004',
  'Dewi Lestari',
  'Bandung',
  '1988-10-27',
  'Perempuan',
  'Islam',
  'Pegawai Negeri',
  'Kawin',
  'Indonesia',
  'Jl. Dahlia No. 8',
  '002',
  '001',
  'Panunggangan Barat',
  'Cibodas',
  'Kota Tangerang',
  'Pendaftaran Program Rumah Murah Kementerian PUPR',
  '004/RT.002/I/2025',
  3,
  'Dra. Hj. Siti Maryam, M.M',
  '196803151992032001',
  'Lurah Panunggangan Barat',
  3,
  4,
  'active'
),

-- 5. Pemohon untuk KPR Syariah
(
  '474.3/005/SKB-R/I/2025',
  '2025-01-15',
  '3671012209930005',
  'Muhammad Rizki',
  'Tangerang',
  '1993-09-22',
  'Laki-laki',
  'Islam',
  'Karyawan Swasta',
  'Kawin',
  'Indonesia',
  'Jl. Kenanga No. 12',
  '004',
  '006',
  'Cibodasari',
  'Cibodas',
  'Kota Tangerang',
  'Pengajuan KPR Syariah di Bank Muamalat',
  '005/RT.004/I/2025',
  4,
  'H. Yusuf Hidayat, S.IP',
  '196904201993031003',
  'Lurah Cibodasari',
  4,
  5,
  'active'
),

-- 6. Pemohon untuk bantuan perumahan korban bencana
(
  '474.3/006/SKB-R/I/2025',
  '2025-01-16',
  '3671015511910006',
  'Ani Wijayanti',
  'Tangerang',
  '1991-11-15',
  'Perempuan',
  'Kristen',
  'Ibu Rumah Tangga',
  'Kawin',
  'Indonesia',
  'Jl. Flamboyan No. 5',
  '001',
  '004',
  'Uwung Jaya',
  'Cibodas',
  'Kota Tangerang',
  'Bantuan Perumahan Korban Kebakaran',
  '006/RT.001/I/2025',
  5,
  'Drs. H. Rahmat Hidayat',
  '197005101994031001',
  'Lurah Uwung Jaya',
  5,
  6,
  'active'
),

-- 7. Pemohon untuk program rumah ASN
(
  '474.3/007/SKB-R/I/2025',
  '2025-01-17',
  '3671011808940007',
  'Eko Prasetyo',
  'Surabaya',
  '1994-08-18',
  'Laki-laki',
  'Islam',
  'Pegawai Negeri Sipil',
  'Kawin',
  'Indonesia',
  'Jl. Cempaka No. 20',
  '006',
  '007',
  'Jatiuwung',
  'Cibodas',
  'Kota Tangerang',
  'Program Rumah ASN Kementerian PANRB',
  '007/RT.006/I/2025',
  6,
  'Hj. Nurhayati, S.Sos, M.Si',
  '197106151995032001',
  'Lurah Jatiuwung',
  6,
  7,
  'active'
),

-- 8. Pemohon untuk KPR BTN
(
  '474.3/008/SKB-R/I/2025',
  '2025-01-18',
  '3671016203960008',
  'Rina Marlina',
  'Tangerang',
  '1996-03-22',
  'Perempuan',
  'Islam',
  'Karyawan Swasta',
  'Belum Kawin',
  'Indonesia',
  'Jl. Bougenville No. 33',
  '008',
  '008',
  'Cibodas',
  'Cibodas',
  'Kota Tangerang',
  'Pengajuan KPR di Bank BTN',
  '008/RT.008/I/2025',
  1,
  'Drs. H. Ahmad Suryadi, M.Si',
  '196501011990031001',
  'Lurah Cibodas',
  1,
  2,
  'active'
),

-- 9. Pemohon untuk program rumah DP 0%
(
  '474.3/009/SKB-R/I/2025',
  '2025-01-19',
  '3671012710970009',
  'Dedi Kurniawan',
  'Bekasi',
  '1997-10-27',
  'Laki-laki',
  'Islam',
  'Karyawan Swasta',
  'Kawin',
  'Indonesia',
  'Jl. Teratai No. 17',
  '009',
  '009',
  'Cibodas Baru',
  'Cibodas',
  'Kota Tangerang',
  'Program Rumah DP 0% Developer',
  '009/RT.009/I/2025',
  2,
  'H. Bambang Hermanto, S.Sos',
  '196702121991031002',
  'Lurah Cibodas Baru',
  2,
  3,
  'active'
),

-- 10. Pemohon untuk subsidi rumah MBR (Masyarakat Berpenghasilan Rendah)
(
  '474.3/010/SKB-R/I/2025',
  '2025-01-20',
  '3671015809890010',
  'Yuni Astuti',
  'Tangerang',
  '1989-09-18',
  'Perempuan',
  'Islam',
  'Buruh Pabrik',
  'Kawin',
  'Indonesia',
  'Jl. Kamboja No. 9',
  '010',
  '010',
  'Panunggangan Barat',
  'Cibodas',
  'Kota Tangerang',
  'Subsidi Rumah MBR (Masyarakat Berpenghasilan Rendah)',
  '010/RT.010/I/2025',
  3,
  'Dra. Hj. Siti Maryam, M.M',
  '196803151992032001',
  'Lurah Panunggangan Barat',
  3,
  4,
  'active'
);

-- Verify inserted data
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT kelurahan) as total_kelurahan,
  COUNT(DISTINCT peruntukan) as total_peruntukan
FROM belum_rumah_documents;

-- Show summary by kelurahan
SELECT 
  kelurahan,
  COUNT(*) as jumlah_surat,
  MIN(tanggal_surat) as tanggal_awal,
  MAX(tanggal_surat) as tanggal_akhir
FROM belum_rumah_documents
GROUP BY kelurahan
ORDER BY kelurahan;

-- Show summary by purpose
SELECT 
  peruntukan,
  COUNT(*) as jumlah
FROM belum_rumah_documents
GROUP BY peruntukan
ORDER BY jumlah DESC;
