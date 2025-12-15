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

    const changes = formData.perubahan_list || [];

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SURAT PERNYATAAN PERUBAHAN ELEMEN DATA KEPENDUDUKAN</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.3;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
      color: #000;
      background: white;
    }
    .top-code {
      text-align: right;
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 20px;
      border: 1px solid #000;
      display: inline-block;
      padding: 5px 15px;
      float: right;
    }
    .header-clear {
      clear: both;
    }
    .header {
      text-align: center;
      font-weight: bold;
      margin-bottom: 30px;
      margin-top: 10px;
    }
    .header-title {
      font-size: 14pt;
      text-decoration: underline;
    }
    .section-title {
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 5px;
      font-size: 11pt;
      background-color: #ddd;
      border: 1px solid #000;
      padding: 2px 5px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    table.data-table td {
      padding: 4px;
      vertical-align: top;
      border: 1px solid #000;
    }
    .label-col {
      width: 200px;
      background-color: #f9f9f9;
    }
    
    table.changes-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table.changes-table th, table.changes-table td {
      border: 1px solid #000;
      padding: 5px;
      text-align: left;
      font-size: 10pt;
    }
    table.changes-table th {
      background-color: #ddd;
      text-align: center;
      font-weight: bold;
    }

    .footer {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    .signature-box {
      width: 250px;
      text-align: center;
    }
    .signature-space {
      height: 70px;
    }
  </style>
</head>
<body>
  <div style="overflow: hidden;">
    <div class="top-code">F-1.06</div>
  </div>
  
  <div class="header header-clear">
    <div class="header-title">SURAT PERNYATAAN PERUBAHAN ELEMEN DATA KEPENDUDUKAN</div>
  </div>

  <div class="section-title">I. DATA WILAYAH</div>
  <table class="data-table">
    <tr>
      <td class="label-col">PROVINSI</td>
      <td>${formData.provinsi || '-'}</td>
    </tr>
    <tr>
      <td class="label-col">KABUPATEN/KOTA</td>
      <td>${formData.kabupaten_kota || '-'}</td>
    </tr>
    <tr>
      <td class="label-col">KECAMATAN</td>
      <td>${formData.kecamatan || '-'}</td>
    </tr>
    <tr>
      <td class="label-col">DESA/KELURAHAN</td>
      <td>${formData.desakelurahan || '-'}</td>
    </tr>
  </table>

  <div class="section-title">II. DATA PEMOHON</div>
  <table class="data-table">
    <tr>
      <td class="label-col">NAMA LENGKAP</td>
      <td><strong>${formData.nama_lengkap || '-'}</strong></td>
    </tr>
    <tr>
      <td class="label-col">NIK</td>
      <td>${formData.nik || '-'}</td>
    </tr>
    <tr>
      <td class="label-col">NOMOR KK</td>
      <td>${formData.no_kk || '-'}</td>
    </tr>
    <tr>
      <td class="label-col">ALAMAT RUMAH</td>
      <td>
        ${formData.alamat_rumah || '-'} <br>
        RT ${formData.rt || '-'} / RW ${formData.rw || '-'} <br>
        Kode Pos: ${formData.kode_pos || '-'}
      </td>
    </tr>
  </table>

  <div class="section-title">III. RINCIAN PERUBAHAN DATA</div>
  <table class="changes-table">
    <thead>
      <tr>
        <th style="width: 30px;">NO</th>
        <th>ELEMEN DATA</th>
        <th>SEMULA</th>
        <th>MENJADI</th>
        <th>DASAR PERUBAHAN</th>
      </tr>
    </thead>
    <tbody>
      ${changes.map((item: any, index: number) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${item.elemen_data || '-'}</td>
        <td>${item.semula || '-'}</td>
        <td>${item.menjadi || '-'}</td>
        <td>${item.dasar_perubahan || '-'}</td>
      </tr>
      `).join('')}
      ${changes.length === 0 ? '<tr><td colspan="5" style="text-align:center;">Tidak ada data perubahan</td></tr>' : ''}
    </tbody>
  </table>

  <div class="footer">
    <div class="signature-box">
      <p>${formData.kabupaten_kota}, ${formatTanggal(formData.tanggal_surat)}</p>
      <p>Pemohon,</p>
      <div class="signature-space">
        <!-- Meterai placeholder if needed -->
        <div style="font-size: 9px; color: #999; margin-top: 30px;">(Materai 10000)</div>
      </div>
      <p style="text-decoration: underline;"><strong>${formData.nama_lengkap}</strong></p>
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
