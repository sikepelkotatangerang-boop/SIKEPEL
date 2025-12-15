import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import db from '@/lib/db';
import puppeteer from 'puppeteer';

/**
 * API untuk generate preview HTML dari template SKU
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

    // Prepare template data for SKU
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
      // Data Usaha
      nama_usaha: formData.nama_usaha || '',
      jenis_usaha: formData.jenis_usaha || '',
      alamat_usaha: formData.alamat_usaha || '',
      rt_usaha: formData.rt_usaha || '',
      rw_usaha: formData.rw_usaha || '',
      kel_usaha: (formData.kel_usaha || 'Cibodas').toUpperCase(),
      kec_usaha: formData.kec_usaha || '',
      kota_kabupaten_usaha: formData.kota_kabupaten_usaha || '',
      pengantar_rt: formData.pengantar_rt ? `Nomor: ${formData.pengantar_rt}` : '',
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    // Load template DOCX
    const templatePath = join(process.cwd(), 'public', 'template', 'SKU.docx');
    const content = readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function() {
        return '';
      },
    });

    // Render document with data
    doc.render(templateData);

    // Generate DOCX buffer
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Save to temp file
    const tempDocxPath = join(tmpdir(), `sku_preview_${Date.now()}.docx`);
    writeFileSync(tempDocxPath, docxBuffer);

    // Launch Puppeteer to convert DOCX to HTML preview
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Generate HTML representation of the document
    const htmlContent = generateHTMLFromTemplate(templateData);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const finalHtml = await page.content();
    
    await browser.close();
    
    // Clean up temp file
    try {
      unlinkSync(tempDocxPath);
    } catch (err) {
      console.error('Error deleting temp file:', err);
    }

    return new NextResponse(finalHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return NextResponse.json(
      { error: 'Failed to generate preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML preview dari template data SKU
 */
function generateHTMLFromTemplate(data: any): string {
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
  <title>Preview SKU - ${data.nama_pemohon}</title>
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
      width: auto;
      margin: 20px 0;
      border-collapse: collapse;
    }
    
    table td {
      padding: 3px 5px;
      vertical-align: top;
      line-height: 1.6;
    }
    
    table td:first-child {
      width: 180px;
      padding-right: 10px;
    }
    
    table td:nth-child(2) {
      width: 20px;
      text-align: left;
      padding: 3px 5px;
    }
    
    table td:nth-child(3) {
      padding-left: 5px;
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
      <p style="text-indent: 40px;">Yang bertanda tangan di bawah ini Lurah ${data.kelurahan} Kecamatan ${data.kecamatan} ${data.kota_kabupaten}, dengan ini menerangkan bahwa:</p>
      
      <table style="margin-left: 40px; margin-top: 15px;">
        <tr>
          <td style="width: 180px;">Nama</td>
          <td style="width: 20px;">:</td>
          <td>${data.nama_pemohon}</td>
        </tr>
        <tr>
          <td>NIK</td>
          <td>:</td>
          <td>${data.nik_pemohon}</td>
        </tr>
        <tr>
          <td>Jenis Kelamin</td>
          <td>:</td>
          <td>${data.kelamin_pemohon}</td>
        </tr>
        <tr>
          <td>Tempat/Tgl Lahir</td>
          <td>:</td>
          <td>${data.tempat_lahir}, ${data.tanggal_lahir}</td>
        </tr>
        <tr>
          <td>Kewarganegaraan</td>
          <td>:</td>
          <td>${data.negara}</td>
        </tr>
        <tr>
          <td>Status Perkawinan</td>
          <td>:</td>
          <td>${data.perkawinan}</td>
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
          <td>Alamat</td>
          <td>:</td>
          <td>${data.alamat} RT ${data.rt} RW ${data.rw}<br/>Kelurahan ${data.kelurahan} Kec. ${data.kecamatan} ${data.kota_kabupaten}.</td>
        </tr>
      </table>
      
      ${data.nama_usaha ? `
      <p style="text-indent: 40px; margin-top: 15px;">Nama tersebut diatas berdasarkan keterangan Ketua RT.${data.rt} RW.${data.rw} ${data.pengantar_rt ? `${data.pengantar_rt}` : ''} dan pengakuan yang bersangkutan pada saat ini mempunyai usaha ${data.jenis_usaha} ${data.nama_usaha} yang beralamat di ${data.alamat_usaha} RT.${data.rt_usaha} RW.${data.rw_usaha} Kelurahan ${data.kel_usaha} Kecamatan ${data.kec_usaha} ${data.kota_kabupaten_usaha}.</p>
      ` : `
      <p style="text-indent: 40px; margin-top: 15px;">Nama tersebut diatas berdasarkan keterangan Ketua RT.${data.rt} RW.${data.rw} ${data.pengantar_rt ? `${data.pengantar_rt}` : ''} dan pengakuan yang bersangkutan pada saat ini.</p>
      `}
      
      <p style="text-indent: 40px; margin-top: 10px;">Demikian surat keterangan ini dibuat dengan sebenarnya, agar dapat dipergunakan sebagaimana mestinya.</p>
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
