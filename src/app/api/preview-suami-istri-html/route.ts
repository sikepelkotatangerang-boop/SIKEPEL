import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import db from '@/lib/db';

/**
 * API untuk generate preview HTML dari template Surat Keterangan Suami Istri
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validasi data pejabat
    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
      return NextResponse.json(
        { error: 'Data pejabat penandatangan tidak lengkap. Hubungi admin untuk menambahkan data pejabat.' },
        { status: 400 }
      );
    }

    // Validasi data suami istri
    if (!formData.nama_suami || !formData.nama_istri) {
      return NextResponse.json(
        { error: 'Data suami dan istri harus dilengkapi' },
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

    // Format tanggal to Indonesian format
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
      tahun_surat: new Date().getFullYear().toString(),
      
      // Data Suami
      nama_suami: formData.nama_suami || '',
      tempat_lahir_suami: formData.tempat_lahir_suami || '',
      tanggal_lahir_suami: formatTanggal(formData.tanggal_lahir_suami),
      agama_suami: formData.agama_suami || '',
      pekerjaan_suami: formData.pekerjaan_suami || '',
      negara_suami: formData.negara_suami || 'Indonesia',
      alamat_suami: formData.alamat_suami || '',
      rt_suami: formData.rt_suami || '',
      rw_suami: formData.rw_suami || '',
      kel_suami: formData.kel_suami || '',
      kec_suami: formData.kec_suami || '',
      kota_suami: formData.kota_suami || '',
      
      // Data Istri
      nama_istri: formData.nama_istri || '',
      tempat_lahir_istri: formData.tempat_lahir_istri || '',
      tanggal_lahir_istri: formatTanggal(formData.tanggal_lahir_istri),
      agama_istri: formData.agama_istri || '',
      pekerjaan_istri: formData.pekerjaan_istri || '',
      negara_istri: formData.negara_istri || 'Indonesia',
      alamat_istri: formData.alamat_istri || '',
      rt_istri: formData.rt_istri || '',
      rw_istri: formData.rw_istri || '',
      kel_istri: formData.kel_istri || '',
      kec_istri: formData.kec_istri || '',
      kota_istri: formData.kota_istri || '',
      
      // Data Pernikahan
      tanggal_pernikahan: formatTanggal(formData.tanggal_pernikahan),
      keterangan_akta_perkawinan: formData.keterangan_akta_perkawinan || '',
      
      // Keperluan
      peruntukan: formData.peruntukan || '',
      pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '',
      
      // Data Kelurahan & Pejabat
      kelurahan: (formData.kelurahan || 'Cibodas').toUpperCase(),
      alamat_kelurahan: alamatKelurahan,
      kecamatan: formData.kec_suami || formData.kecamatan || '',
      kota_kabupaten: formData.kota_suami || formData.kota_kabupaten || '',
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
  <title>Preview Surat Keterangan Suami Istri - ${data.nama_suami} & ${data.nama_istri}</title>
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
    
    .header-logo {
      flex-shrink: 0;
    }
    
    .header-logo img {
      width: 110px;
      height: 110px;
      object-fit: contain;
      margin-left: 25px;
    }
    
    .header-text {
      flex: 1;
      text-align: center;
    }
    
    .header-text h1 {
      font-size: 18px;
      font-weight: bold;
      margin: 5px 0;
      text-transform: uppercase;
    }
    
    .header-text p {
      font-size: 12px;
      margin: 2px 0;
    }
    
    .header-spacer {
      width: 80px;
      flex-shrink: 0;
    }
    
    .title {
      text-align: center;
      margin: 30px 0;
    }
    
    .title h2 {
      font-size: 16px;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 5px;
    }
    
    .title p {
      font-size: 12px;
    }
    
    .content {
      font-size: 12px;
      line-height: 1.8;
      text-align: justify;
    }
    
    .content p {
      margin-bottom: 15px;
    }
    
    .section-title {
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    table {
      width: 100%;
      margin: 15px 0;
      border-collapse: collapse;
    }
    
    table td {
      padding: 5px;
      vertical-align: top;
    }
    
    table td:first-child {
      width: 200px;
    }
    
    table td:nth-child(2) {
      width: 20px;
      text-align: center;
    }
    
    .signature {
      margin-top: 50px;
      text-align: right;
    }
    
    .signature-content {
      display: inline-block;
      text-align: center;
      min-width: 250px;
    }
    
    .signature p {
      margin: 5px 0;
    }
    
    .signature .name {
      margin-top: 80px;
      font-weight: bold;
      text-decoration: underline;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      color: rgba(255, 0, 0, 0.1);
      font-weight: bold;
      pointer-events: none;
      z-index: 1000;
    }
    
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      
      .preview-container {
        width: 100%;
        min-height: auto;
        box-shadow: none;
        padding: 0;
        margin: 0;
      }
      
      .watermark {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">PREVIEW</div>
  
  <div class="preview-container">
    <!-- Header -->
    <div class="header">
      <div class="header-logo">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo Kota">` : ''}
      </div>
      <div class="header-text">
        <h1>PEMERINTAH ${data.kota_kabupaten?.toUpperCase() || 'KOTA TANGERANG'}</h1>
        <h1>KECAMATAN ${data.kecamatan?.toUpperCase() || 'CIBODAS'}</h1>
        <h1>KELURAHAN ${data.kelurahan}</h1>
        <p>${data.alamat_kelurahan || 'Jl. Raya Cibodas No. 45, Cibodas'}</p>
      </div>
      <div class="header-spacer"></div>
    </div>
    
    <!-- Title -->
    <div class="title">
      <h2>SURAT KETERANGAN</h2>
      <p>Nomor: ${data.nomor_surat}</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p>Yang bertanda tangan di bawah ini ${data.jabatan} ${data.kelurahan}, Kecamatan ${data.kecamatan}, ${data.kota_kabupaten}, menerangkan bahwa:</p>
      
      <!-- Data Suami -->
      <p class="section-title">I. SUAMI</p>
      <table>
        <tr>
          <td>Nama</td>
          <td>:</td>
          <td><strong>${data.nama_suami}</strong></td>
        </tr>
        <tr>
          <td>Tempat, Tanggal Lahir</td>
          <td>:</td>
          <td>${data.tempat_lahir_suami}, ${data.tanggal_lahir_suami}</td>
        </tr>
        <tr>
          <td>Agama</td>
          <td>:</td>
          <td>${data.agama_suami}</td>
        </tr>
        <tr>
          <td>Pekerjaan</td>
          <td>:</td>
          <td>${data.pekerjaan_suami}</td>
        </tr>
        <tr>
          <td>Kewarganegaraan</td>
          <td>:</td>
          <td>${data.negara_suami}</td>
        </tr>
        <tr>
          <td>Alamat</td>
          <td>:</td>
          <td>${data.alamat_suami}, RT ${data.rt_suami}/RW ${data.rw_suami}, Kelurahan ${data.kel_suami}, Kecamatan ${data.kec_suami}, ${data.kota_suami}</td>
        </tr>
      </table>
      
      <!-- Data Istri -->
      <p class="section-title">II. ISTRI</p>
      <table>
        <tr>
          <td>Nama</td>
          <td>:</td>
          <td><strong>${data.nama_istri}</strong></td>
        </tr>
        <tr>
          <td>Tempat, Tanggal Lahir</td>
          <td>:</td>
          <td>${data.tempat_lahir_istri}, ${data.tanggal_lahir_istri}</td>
        </tr>
        <tr>
          <td>Agama</td>
          <td>:</td>
          <td>${data.agama_istri}</td>
        </tr>
        <tr>
          <td>Pekerjaan</td>
          <td>:</td>
          <td>${data.pekerjaan_istri}</td>
        </tr>
        <tr>
          <td>Kewarganegaraan</td>
          <td>:</td>
          <td>${data.negara_istri}</td>
        </tr>
        <tr>
          <td>Alamat</td>
          <td>:</td>
          <td>${data.alamat_istri}, RT ${data.rt_istri}/RW ${data.rw_istri}, Kelurahan ${data.kel_istri}, Kecamatan ${data.kec_istri}, ${data.kota_istri}</td>
        </tr>
      </table>
      
      <p>Berdasarkan ${data.pengantar_rt ? `Surat Pengantar RT ${data.pengantar_rt}` : 'keterangan yang ada'}, bahwa kedua nama tersebut di atas adalah benar suami istri yang sah, menikah pada tanggal <strong>${data.tanggal_pernikahan}</strong>${data.keterangan_akta_perkawinan ? ` dengan ${data.keterangan_akta_perkawinan}` : ''}.</p>
      
      <p>Surat keterangan ini dibuat untuk keperluan: <strong>${data.peruntukan}</strong></p>
      
      <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>
    
    <!-- Signature -->
    <div class="signature">
      <div class="signature-content">
        <p>Tangerang, ${data.tanggal_surat}</p>
        <p><strong>${data.jabatan}</strong></p>
        ${data.jabatan_detail ? `<p>${data.jabatan_detail}</p>` : ''}
        <p class="name">${data.nama_pejabat}</p>
        ${data.nip_pejabat ? `<p>NIP. ${data.nip_pejabat}</p>` : ''}
      </div>
    </div>
  </div>
  
  <script>
    // Auto print on load (optional)
    // window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `;
}
