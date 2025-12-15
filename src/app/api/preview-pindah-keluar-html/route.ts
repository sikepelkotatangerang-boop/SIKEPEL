import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Format tanggal
    const formatTanggal = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
    };

    const jenisPermohonanMap: { [key: string]: string } = {
      '1': 'Surat Keterangan Kependudukan',
      '2': 'Surat Keterangan Pindah',
      '3': 'Surat Keterangan Pindah Luar Negeri (SKPLN)',
      '4': 'Surat Keterangan Tempat Tinggal (SKTT)',
      '5': 'Bagi Orang Asing Tinggal Terbatas',
    };

    const klasifikasiMap: { [key: string]: string } = {
      '1': 'Dalam satu desa/kelurahan',
      '2': 'Antar desa/kelurahan dalam satu kecamatan',
      '3': 'Antar kecamatan dalam satu kab./kota',
      '4': 'Antar kabupaten/kota dalam satu provinsi',
      '5': 'Antar Provinsi',
    };

    const alasanMap: { [key: string]: string } = {
      '1': 'Pekerjaan',
      '2': 'Pendidikan',
      '3': 'Keamanan',
      '4': 'Kesehatan',
      '5': 'Perumahan',
      '6': 'Keluarga',
      '7': 'Lainnya',
    };

    const jenisPindahMap: { [key: string]: string } = {
      '1': 'Kepala Keluarga',
      '2': 'Kepala Keluarga dan Seluruh Anggota Keluarga',
      '3': 'Kepala Keluarga dan Sebagian Anggota Keluarga',
      '4': 'Anggota Keluarga',
    };

    const anggotaKeluarga = formData.anggota_keluarga || [];

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Surat Pindah Keluar (F-103)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      background: #fff;
      padding: 20px;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #000;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .header p {
      font-size: 10pt;
      font-style: italic;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      margin-bottom: 10px;
      padding: 5px 10px;
      background: #f0f0f0;
      border-left: 4px solid #333;
    }
    .field {
      display: flex;
      margin-bottom: 8px;
      padding: 5px 0;
    }
    .field-label {
      width: 200px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .field-separator {
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    .field-value {
      flex: 1;
    }
    .address-box {
      border: 1px solid #ccc;
      padding: 15px;
      background: #fafafa;
      margin-top: 10px;
    }
    .family-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .family-table th,
    .family-table td {
      border: 1px solid #333;
      padding: 8px;
      text-align: left;
    }
    .family-table th {
      background: #e0e0e0;
      font-weight: bold;
      text-align: center;
    }
    .footer {
      margin-top: 40px;
      text-align: right;
    }
    .signature-box {
      display: inline-block;
      text-align: center;
      min-width: 200px;
    }
    .signature-line {
      margin-top: 80px;
      border-top: 1px solid #000;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FORMULIR PENDAFTARAN PERPINDAHAN PENDUDUK</h1>
    <p>Formulir F-103</p>
    <p style="font-size: 9pt; margin-top: 10px;">
      <strong>Perhatian:</strong> Harap diisi dengan huruf cetak dan menggunakan tinta hitam
    </p>
  </div>

  <div class="section">
    <div class="section-title">DATA PEMOHON</div>
    <div class="field">
      <div class="field-label">1. No. KK</div>
      <div class="field-separator">:</div>
      <div class="field-value">${formData.no_kk_pemohon || '-'}</div>
    </div>
    <div class="field">
      <div class="field-label">2. Nama Lengkap Pemohon</div>
      <div class="field-separator">:</div>
      <div class="field-value">${formData.nama_pemohon || '-'}</div>
    </div>
    <div class="field">
      <div class="field-label">3. NIK</div>
      <div class="field-separator">:</div>
      <div class="field-value">${formData.nik_pemohon || '-'}</div>
    </div>
    <div class="field">
      <div class="field-label">No. HP</div>
      <div class="field-separator">:</div>
      <div class="field-value">${formData.no_hp_pemohon || '-'}</div>
    </div>
    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-separator">:</div>
      <div class="field-value">${formData.email_pemohon || '-'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">JENIS PERMOHONAN</div>
    <div class="field">
      <div class="field-label">4. Jenis Permohonan</div>
      <div class="field-separator">:</div>
      <div class="field-value">
        ${formData.jenis_permohonan}. ${jenisPermohonanMap[formData.jenis_permohonan] || '-'}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">ALAMAT ASAL</div>
    <div class="field">
      <div class="field-label">5. Alamat Jelas</div>
      <div class="field-separator">:</div>
      <div class="field-value">${formData.alamat_asal || '-'}</div>
    </div>
    <div class="address-box">
      <div class="field">
        <div class="field-label">RT / RW</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.rt_asal || '-'} / ${formData.rw_asal || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">a. Desa/Kelurahan</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.kel_asal || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">b. Kecamatan</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.kec_asal || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">c. Kabupaten/Kota</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.kota_asal || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">d. Provinsi</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.provinsi_asal || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Kode Pos</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.pos_asal || '-'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">KLASIFIKASI PINDAH</div>
    <div class="field">
      <div class="field-label">6. Klasifikasi Pindah</div>
      <div class="field-separator">:</div>
      <div class="field-value">
        ${formData.no_klasifikasi_pindah}. ${klasifikasiMap[formData.no_klasifikasi_pindah] || '-'}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">ALAMAT TUJUAN PINDAH</div>
    <div class="field">
      <div class="field-label">7. Alamat Pindah</div>
      <div class="field-separator">:</div>
      <div class="field-value">${formData.alamat_pindah || '-'}</div>
    </div>
    <div class="address-box">
      <div class="field">
        <div class="field-label">RT / RW</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.rt_pindah || '-'} / ${formData.rw_pindah || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">a. Desa/Kelurahan</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.kel_pindah || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">b. Kecamatan</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.kec_pindah || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">c. Kabupaten/Kota</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.kota_kab_pindah || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">d. Provinsi</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.provinsi_pindah || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Kode Pos</div>
        <div class="field-separator">:</div>
        <div class="field-value">${formData.pos_pindah || '-'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">ALASAN DAN JENIS KEPINDAHAN</div>
    <div class="field">
      <div class="field-label">8. Alasan Pindah</div>
      <div class="field-separator">:</div>
      <div class="field-value">
        ${formData.no_alasan_pindah}. ${alasanMap[formData.no_alasan_pindah] || '-'}
      </div>
    </div>
    <div class="field">
      <div class="field-label">9. Jenis Kepindahan</div>
      <div class="field-separator">:</div>
      <div class="field-value">
        ${formData.no_jenis_pindah}. ${jenisPindahMap[formData.no_jenis_pindah] || '-'}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DAFTAR KELUARGA YANG PINDAH</div>
    <table class="family-table">
      <thead>
        <tr>
          <th style="width: 40px;">NO</th>
          <th style="width: 150px;">NIK</th>
          <th>NAMA LENGKAP</th>
          <th style="width: 150px;">SHDK</th>
        </tr>
      </thead>
      <tbody>
        ${anggotaKeluarga.map((anggota: any, index: number) => `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${anggota.nik || '-'}</td>
            <td>${anggota.nama || '-'}</td>
            <td>${anggota.shdk || '-'}</td>
          </tr>
        `).join('')}
        ${anggotaKeluarga.length === 0 ? '<tr><td colspan="4" style="text-align: center; font-style: italic;">Tidak ada data</td></tr>' : ''}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Tangerang, ${formatTanggal(formData.tanggal_surat || new Date().toISOString())}</p>
    <div class="signature-box">
      <p style="margin-bottom: 10px;">Pemohon,</p>
      <div class="signature-line">
        <strong>${formData.nama_pemohon || '(...........................)'}</strong>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('Error generating HTML preview:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat preview HTML' },
      { status: 500 }
    );
  }
}
