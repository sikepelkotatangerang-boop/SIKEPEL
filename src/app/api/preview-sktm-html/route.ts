import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync } from 'fs';
import { join } from 'path';
import db from '@/lib/db';
import puppeteer from 'puppeteer';

/**
 * API untuk generate preview HTML dari template SKTM
 * Menggunakan Puppeteer untuk render DOCX ke HTML
 */
export async function POST(request: NextRequest) {
  let browser;

  try {
    const formData = await request.json();

    // Validasi data pejabat
    if (!formData.nama_pejabat || !formData.nip_pejabat || !formData.jabatan) {
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
        // Continue with provided alamat_kelurahan if database query fails
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

    // Format jabatan berdasarkan role
    const isLurah = formData.jabatan?.toLowerCase().trim() === 'lurah';
    let jabatanHeader = '';
    let jabatanDetail = '';
    
    if (isLurah) {
      // Jika Lurah: jabatan = "LURAH CIBODAS", jabatan_detail = kosong
      const kelurahanName = (formData.kelurahan || 'CIBODAS').toUpperCase();
      jabatanHeader = 'LURAH';
      // jabatanHeader = `LURAH ${kelurahanName}`;
      jabatanDetail = '';
    } else {
      // Jika bukan Lurah: jabatan = "a.n LURAH", jabatan_detail = jabatan asli
      jabatanHeader = 'a.n LURAH';
      jabatanDetail = formData.jabatan || '';
    }

    // Determine keterangan and desil based on desil selection
    let keterangan = '';
    let desilValue = '';
    
    if (formData.desil === 'Desil 6-10') {
      // Desil 6-10: Gunakan kalimat alternatif, desil kosong
      keterangan = 'Menurut pengakuan yang bersangkutan nama tersebut keluarga berpenghasilan rendah';
      desilValue = '';
    } else {
      // Desil 1-5: Gunakan kalimat DTSEN, tampilkan desil
      keterangan = 'Sesuai dengan yang tercantum dalam DTSEN (Data Tunggal Sosial Ekonomi Nasional) benar nama tersebut merupakan warga yang kurang mampu dengan Peringkat Kesejahteraan Warga / Desil';
      desilValue = formData.desil || '';
    }

    // Prepare template data
    const templateData = {
      nomor_surat: formData.nomor_surat || '',
      tanggal_surat: formatTanggal(new Date().toISOString()),
      tahun_surat: new Date().getFullYear().toString(),
      nik_pemohon: formData.nik_pemohon || '',
      nama_pemohon: formData.nama_pemohon || '',
      tempat_lahir: formData.tempat_lahir || '',
      tanggal_lahir: formatTanggal(formData.tanggal_lahir),
      kelamin_pemohon: formData.kelamin_pemohon || '',
      agama: formData.agama || '',
      pekerjaan: formData.pekerjaan || '',
      perkawinan: formData.perkawinan || '',
      negara: formData.negara || 'Indonesia',
      alamat: formData.alamat || '',
      rt: formData.rt || '',
      rw: formData.rw || '',
      kelurahan: (formData.kelurahan || 'Cibodas').toUpperCase(),
      alamat_kelurahan: alamatKelurahan,
      kecamatan: formData.kecamatan || '',
      kota_kabupaten: formData.kota_kabupaten || '',
      keterangan: keterangan, // Conditional keterangan
      desil: desilValue, // Conditional desil (kosong untuk 6-10)
      peruntukan: formData.peruntukan || '',
      pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '', // Tambahkan prefix "Nomor: " jika ada
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
    // Continue without logo if file not found
  }

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview SKTM - ${data.nama_pemohon}</title>
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
      /* A4 size: 210mm x 297mm */
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
      margin-left: 25px
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
    
    table {
      width: 100%;
      margin: 20px 0;
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
      
      <table>
        <tr>
          <td>Nama</td>
          <td>:</td>
          <td><strong>${data.nama_pemohon}</strong></td>
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
      
      <p>Berdasarkan ${data.pengantar_rt ? `Surat Pengantar RT ${data.pengantar_rt}` : 'keterangan yang ada'}, bahwa nama tersebut di atas benar-benar penduduk Kelurahan ${data.kelurahan}. ${data.keterangan}${data.desil ? ` <strong>${data.desil}</strong>` : ''}.</p>
      
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
