import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import db from '@/lib/db';

/**
 * API untuk generate preview HTML Formulir KTP
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validasi data pemohon
    if (!formData.nama || !formData.nik || !formData.nomor_kk) {
      return NextResponse.json(
        { error: 'Data pemohon tidak lengkap. Mohon isi semua field yang diperlukan.' },
        { status: 400 }
      );
    }

    // Prepare template data (sesuai placeholder template PENGANTARKTP.docx)
    const templateData = {
      nama: formData.nama || '',
      nik: formData.nik || '',
      nomor_kk: formData.nomor_kk || '',
      nomor_handphone: formData.nomor_handphone || '',
      email: formData.email || '',
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
 * Generate HTML preview sederhana untuk Formulir KTP
 */
function generatePreviewHTML(data: any): string {
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
  <title>Preview Formulir KTP - ${data.nama}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
      font-size: 10pt;
    }
    
    .preview-container {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 15mm;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      position: relative;
    }
    
    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: bold;
      color: rgba(200, 200, 200, 0.3);
      z-index: 1;
      pointer-events: none;
      user-select: none;
    }
    
    .content {
      position: relative;
      z-index: 2;
    }
    
    /* Header */
    .doc-header {
      border: 2px solid #000;
      padding: 8px;
      margin-bottom: 15px;
    }
    
    .doc-number {
      text-align: right;
      font-weight: bold;
      font-size: 14pt;
      margin-bottom: 10px;
    }
    
    .doc-title {
      text-align: center;
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 5px;
    }
    
    .doc-subtitle {
      font-size: 9pt;
      padding: 0 10px;
      line-height: 1.4;
    }
    
    /* Section Headers */
    .section-header {
      background-color: #e0e0e0;
      padding: 5px 8px;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 8px;
      border: 1px solid #000;
    }
    
    /* Data Table */
    .data-table {
      width: 100%;
      border: 1px solid #000;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    
    .data-table td {
      border: 1px solid #000;
      padding: 6px 8px;
      vertical-align: top;
    }
    
    .data-table .label-col {
      width: 5%;
      text-align: center;
      font-weight: bold;
    }
    
    .data-table .field-col {
      width: 45%;
    }
    
    .data-table .value-col {
      background-color: #f9f9f9;
    }
    
    /* Grid Table */
    .grid-table {
      width: 100%;
      border: 1px solid #000;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    
    .grid-table th,
    .grid-table td {
      border: 1px solid #000;
      padding: 4px 6px;
      text-align: center;
      font-size: 9pt;
    }
    
    .grid-table th {
      background-color: #e0e0e0;
      font-weight: bold;
    }
    
    .grid-table .left-align {
      text-align: left;
    }
    
    /* Checkbox Section */
    .checkbox-section {
      border: 1px solid #000;
      padding: 10px;
      margin-bottom: 10px;
    }
    
    .checkbox-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .checkbox-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      font-size: 9pt;
    }
    
    .checkbox-item {
      display: flex;
      align-items: flex-start;
      gap: 5px;
    }
    
    .checkbox {
      width: 12px;
      height: 12px;
      border: 1px solid #000;
      display: inline-block;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    /* Footer */
    .footer {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 10pt;
    }
    
    .signature-box {
      text-align: center;
      width: 200px;
    }
    
    .signature-space {
      height: 60px;
    }
    
    .signature-line {
      border-bottom: 1px solid #000;
      width: 180px;
      margin: 0 auto;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .preview-container {
        width: 100%;
        margin: 0;
        padding: 15mm;
        box-shadow: none;
      }
      
      .watermark {
        color: rgba(200, 200, 200, 0.2);
      }
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <!-- Watermark -->
    <div class="watermark">PREVIEW</div>
    
    <div class="content">
      <!-- Document Header -->
      <div class="doc-header">
        <div class="doc-number">F-1.02</div>
        <div class="doc-title">FORMULIR PENDAFTARAN PERISTIWA KEPENDUDUKAN</div>
        <div class="doc-subtitle">
          Perhatian:<br>
          Harap diisi dengan huruf cetak dan menggunakan tinta hitam
        </div>
      </div>
      
      <!-- Section I: Data Pemohon Perorangan -->
      <div class="section-header">I &nbsp;&nbsp; DATA PEMOHON PERORANGAN</div>
      
      <table class="data-table">
        <tr>
          <td class="label-col">1</td>
          <td class="field-col">NAMA LENGKAP</td>
          <td class="value-col">${data.nama}</td>
        </tr>
        <tr>
          <td class="label-col">2</td>
          <td class="field-col">NOMOR INDUK KEPENDUDUKAN</td>
          <td class="value-col">${data.nik}</td>
        </tr>
        <tr>
          <td class="label-col">3</td>
          <td class="field-col">NOMOR KARTU KELUARGA</td>
          <td class="value-col">${data.nomor_kk}</td>
        </tr>
        <tr>
          <td class="label-col">4</td>
          <td class="field-col">NOMOR HANDPHONE - WA</td>
          <td class="value-col">${data.nomor_handphone}</td>
        </tr>
        <tr>
          <td class="label-col">5</td>
          <td class="field-col">ALAMAT EMAIL</td>
          <td class="value-col">${data.email}</td>
        </tr>
      </table>
      
      <!-- Section II: Jenis Permohonan -->
      <div class="section-header">II &nbsp;&nbsp; JENIS PERMOHONAN ( ANGKA DILINGKARI )</div>
      
      <table class="grid-table">
        <tr>
          <th rowspan="2" style="width: 5%;">I</th>
          <th colspan="3">KARTU KELUARGA</th>
          <th rowspan="2" style="width: 5%;">II</th>
          <th colspan="3">KTP-el</th>
          <th rowspan="2" style="width: 5%;">III</th>
          <th colspan="3">KARTU IDENTITAS ANAK ( KIA )</th>
          <th rowspan="2" style="width: 5%;">IV</th>
          <th colspan="3">PERUBAHAN DATA</th>
        </tr>
        <tr>
          <th style="width: 5%;">A</th>
          <th class="left-align">BARU</th>
          <th style="width: 5%;">A</th>
          <th style="width: 5%;">A</th>
          <th class="left-align">BARU</th>
          <th style="width: 5%;">A</th>
          <th style="width: 5%;">A</th>
          <th class="left-align">BARU</th>
          <th style="width: 5%;">A</th>
          <th style="width: 5%;">A</th>
          <th class="left-align">KK</th>
          <th style="width: 5%;">A</th>
        </tr>
        <tr>
          <td>1</td>
          <td>B</td>
          <td class="left-align">Membentuk Keluarga Baru</td>
          <td>B</td>
          <td>2</td>
          <td>B</td>
          <td class="left-align">Penggantian Kepala Keluarga</td>
          <td>B</td>
          <td>1</td>
          <td>B</td>
          <td class="left-align">Hilang</td>
          <td>B</td>
          <td>1</td>
          <td>B</td>
          <td class="left-align">KTP-el</td>
          <td>B</td>
        </tr>
        <tr>
          <td>2</td>
          <td></td>
          <td class="left-align">Pindah</td>
          <td></td>
          <td>3</td>
          <td></td>
          <td class="left-align">Pindah Datang</td>
          <td></td>
          <td>2</td>
          <td></td>
          <td class="left-align">Rusak</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
        </tr>
        <tr>
          <td>3</td>
          <td>C</td>
          <td class="left-align">HILANG/ RUSAK</td>
          <td>C</td>
          <td>4</td>
          <td>C</td>
          <td class="left-align">Perpanjangan Hak Tinggal Tetap ( ITAP )</td>
          <td>C</td>
          <td></td>
          <td>C</td>
          <td class="left-align">PERPANJANGAN ITAP</td>
          <td>C</td>
          <td></td>
          <td>C</td>
          <td class="left-align">KIA</td>
          <td>C</td>
        </tr>
        <tr>
          <td>4</td>
          <td></td>
          <td class="left-align">Hilang</td>
          <td></td>
          <td>5</td>
          <td></td>
          <td class="left-align">Perubahan Kependudukan</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="left-align">Melampirkan: - Formulir Perubahan Data dan</td>
          <td></td>
        </tr>
        <tr>
          <td>5</td>
          <td></td>
          <td class="left-align">Rusak</td>
          <td></td>
          <td>6</td>
          <td></td>
          <td class="left-align">Perubahan Administrasi Kependudukan</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
          <td>1)</td>
          <td></td>
          <td class="left-align">Bukti Dokumen Perubahan Data</td>
          <td></td>
        </tr>
        <tr>
          <td>6</td>
          <td>D</td>
          <td class="left-align">PERUBAHAN DATA</td>
          <td>D</td>
          <td>7</td>
          <td>D</td>
          <td class="left-align">PERALIHAN ITAP</td>
          <td>D</td>
          <td></td>
          <td>D</td>
          <td class="left-align">LAINNYA</td>
          <td>D</td>
          <td>2)</td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
        </tr>
        <tr>
          <td>7</td>
          <td></td>
          <td class="left-align">Memindahkan dalam KK</td>
          <td></td>
          <td></td>
          <td>E</td>
          <td class="left-align">PERUBAHAN STATUS KEWARGANEGARAAN</td>
          <td>E</td>
          <td>1</td>
          <td></td>
          <td class="left-align">Hilang</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
        </tr>
        <tr>
          <td>8</td>
          <td></td>
          <td class="left-align">Perubahan elemen data yang tercantum dalam KK</td>
          <td></td>
          <td></td>
          <td>F</td>
          <td class="left-align">LUAR DOMISILI</td>
          <td>F</td>
          <td>2</td>
          <td></td>
          <td class="left-align">Rusak</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
        </tr>
        <tr>
          <td>9</td>
          <td>E</td>
          <td class="left-align">HILANG/ RUSAK</td>
          <td>E</td>
          <td></td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
          <td></td>
          <td>G</td>
          <td class="left-align">ITAP/IMIGRASI</td>
          <td>G</td>
          <td></td>
          <td></td>
          <td class="left-align"></td>
          <td></td>
        </tr>
      </table>
      
      <div style="font-size: 9pt; margin-bottom: 10px;">
        Catatan: Pemohon SKTT sesuai Pasal 12 ayat (1) Perka Dukcapil No 8 Tahun 2021
      </div>
      
      <!-- Section III: Persyaratan -->
      <div class="section-header">III &nbsp;&nbsp; PERSYARATAN YANG DILAMPIRKAN ( BERI TANDA CENTANG - ✓ )</div>
      
      <div class="checkbox-section">
        <div class="checkbox-grid">
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>KK Lama/ KK Rusak</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Surat Keterangan Tidak Pendaftaran Peristiwa Kependudukan dari Pejabat Penting</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Buku Nikah/ Kutipan Akta Perkawinan</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>SPTJM di ketahui Instansi yang berwenang</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Kutipan Akta Perceraian</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Akta Kelahiran</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Surat Keterangan Pindah Luar Negeri</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Surat Keterangan Pindah dari tempat lama atau tidak</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>KTP-el Rusak / KTP-el Daerah Asal</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Surat Pernyataan kehilangan sesuai dengan anggota keluarga</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Dokumen Kependudukan / Paspor</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Surat Keterangan Pindah Luar Negeri</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Surat Keterangan Tinggal Luar Negeri</span>
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span>
            <span>Kartu KITAP/ Kartu ITAP / Kartu ITAS Tinggal Tetap</span>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="signature-box">
          <div>Kota Tangerang, ........., ......., 20.....</div>
          <div style="margin-top: 5px; font-weight: bold;">Petugas</div>
          <div class="signature-space"></div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div>Pemohon,</div>
          <div class="signature-space"></div>
          <div class="signature-line"></div>
          <div style="margin-top: 5px;">(${data.nama})</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
