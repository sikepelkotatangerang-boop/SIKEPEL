import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import db from '@/lib/db';

/**
 * API untuk generate preview HTML Surat Keterangan Umum
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validasi data pejabat (NIP bisa kosong)
    if (!formData.nama_pejabat || !formData.jabatan) {
      return NextResponse.json(
        { error: 'Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.' },
        { status: 400 }
      );
    }

    // Get alamat kelurahan from database
    let alamatKelurahan = formData.alamat_kelurahan || '';
    if (formData.kelurahan) {
      try {
        const kelurahanResult = await db.query<{ alamat: string }>(
          'SELECT alamat FROM kelurahan WHERE LOWER(nama) = LOWER($1) LIMIT 1',
          [formData.kelurahan]
        );

        if (kelurahanResult.rows.length > 0) {
          alamatKelurahan = kelurahanResult.rows[0].alamat;
        }
      } catch (dbError) {
        console.error('Error fetching kelurahan address:', dbError);
      }
    }

    // Format tanggal lahir to Indonesian format
    const formatTanggal = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Check if jabatan contains "Lurah" (case insensitive)
    const isLurah = formData.jabatan?.toLowerCase().trim() === 'lurah';
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : formData.jabatan || '';

    // Prepare template data
    const templateData = {
      nomor_surat: formData.nomor_surat || '',
      tanggal_surat: formatTanggal(new Date().toISOString()),
      pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '',

      // Data Pemohon
      nik_pemohon: formData.nik_pemohon || '',
      nama_pemohon: formData.nama_pemohon || '',
      tempat_lahir: formData.tempat_lahir || '',
      tanggal_lahir: formatTanggal(formData.tanggal_lahir),
      kelamin_pemohon: formData.kelamin_pemohon || '',
      agama: formData.agama || '',
      pekerjaan: formData.pekerjaan || '',
      perkawinan: formData.perkawinan || '',
      negara: formData.negara || 'Indonesia',

      // Alamat
      alamat: formData.alamat || '',
      rt: formData.rt || '',
      rw: formData.rw || '',
      kelurahan: (formData.kelurahan || 'Cibodas').toUpperCase(),
      alamat_kelurahan: alamatKelurahan,
      kecamatan: formData.kecamatan || '',
      kota_kabupaten: formData.kota_kabupaten || '',

      // Keperluan
      keperluan: formData.peruntukan || '', // Keep for backward compatibility if needed
      peruntukan: formData.peruntukan || '',

      // Data Pejabat
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    // Generate HTML preview
    const htmlContent = generatePreviewHTML(templateData);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML preview dari template data
 */
function generatePreviewHTML(data: any): string {
  // Read logo and convert to base64
  const logoPath = join(process.cwd(), 'public', 'assets', 'logo_kota.png');
  let logoBase64 = '';

  try {
    const logoBuffer = readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error reading logo:', error);
  }

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Surat Keterangan Umum - ${data.nama_pemohon}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .preview-container {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 20mm;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      position: relative;
    }
    
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #000;
      padding-bottom: 15px;
      gap: 20px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }
    
    .header-text {
      flex: 1;
      text-align: center;
    }
    
    .header-text h1 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    
    .header-text h2 {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .header-text p {
      font-size: 11px;
      margin: 1px 0;
    }
    
    .title {
      text-align: center;
      margin: 30px 0 20px 0;
    }
    
    .title h2 {
      font-size: 16px;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 5px;
    }
    
    .title p {
      font-size: 14px;
    }
    
    .content {
      font-size: 12px;
      line-height: 1.8;
      text-align: justify;
    }
    
    .content p {
      margin-bottom: 10px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    table td {
      padding: 4px 8px;
      vertical-align: top;
    }
    
    table td:first-child {
      width: 30%;
    }
    
    table td:nth-child(2) {
      width: 5%;
    }
    
    .signature {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
    }
    
    .signature-box {
      text-align: center;
      min-width: 200px;
    }
    
    .signature-box p {
      font-size: 12px;
      margin: 5px 0;
    }
    
    .signature-space {
      height: 60px;
    }
    
    .signature-name {
      font-weight: bold;
      text-decoration: underline;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .preview-container {
        width: 100%;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <!-- Header -->
    <div class="header">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo">` : ''}
      <div class="header-text">
        <h1>PEMERINTAH ${data.kota_kabupaten ? data.kota_kabupaten.toUpperCase() : 'KOTA TANGERANG'}</h1>
        <h2>KECAMATAN ${data.kecamatan ? data.kecamatan.toUpperCase() : ''}</h2>
        <h2>KELURAHAN ${data.kelurahan}</h2>
        <p>${data.alamat_kelurahan}</p>
      </div>
    </div>

    <!-- Title -->
    <div class="title">
      <h2>SURAT KETERANGAN</h2>
      <p>Nomor: ${data.nomor_surat}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="text-indent: 40px;">Yang bertanda tangan di bawah ini Lurah ${data.kelurahan} Kecamatan ${data.kecamatan} ${data.kota_kabupaten}, dengan ini menerangkan bahwa :</p>

      <table>
        <tr>
          <td>Nama</td>
          <td>:</td>
          <td>${data.nama_pemohon}</td>
        </tr>
        <tr>
          <td>NIK</td>
          <td>:</td>
          <td>${data.nik_pemohon}</td>
        </tr>
        <tr>
          <td>Tempat, Tanggal Lahir</td>
          <td>:</td>
          <td>${data.tempat_lahir}, ${data.tanggal_lahir}</td>
        </tr>
        <tr>
          <td>Jenis Kelamin</td>
          <td>:</td>
          <td>${data.kelamin_pemohon}</td>
        </tr>
        <tr>
          <td>Agama</td>
          <td>:</td>
          <td>${data.agama}</td>
        </tr>
        <tr>
          <td>Pekerjaan</td>
          <td>:</td>
          <td>${data.pekerjaan}</td>
        </tr>
        <tr>
          <td>Status Perkawinan</td>
          <td>:</td>
          <td>${data.perkawinan}</td>
        </tr>
        <tr>
          <td>Kewarganegaraan</td>
          <td>:</td>
          <td>${data.negara}</td>
        </tr>
        <tr>
          <td>Alamat</td>
          <td>:</td>
          <td>${data.alamat}, RT ${data.rt}/RW ${data.rw}, Kelurahan ${data.kelurahan}, Kecamatan ${data.kecamatan}, ${data.kota_kabupaten}</td>
        </tr>
      </table>

      <p style="text-indent: 40px; margin-top: 15px;">${data.peruntukan}</p>

      <p style="text-indent: 40px; margin-top: 10px;">Demikian surat keterangan ini dibuat dengan sebenarnya, agar dapat dipergunakan sebagaimana mestinya.</p>
    </div>

    <!-- Signature -->
    <div class="signature">
      <div class="signature-box">
        <p>${data.kelurahan}, ${data.tanggal_surat}</p>
        <p>${data.jabatan}</p>
        ${data.jabatan_detail ? `<p>${data.jabatan_detail}</p>` : ''}
        <div class="signature-space"></div>
        <p class="signature-name">${data.nama_pejabat}</p>
        ${data.nip_pejabat ? `<p>NIP. ${data.nip_pejabat}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
