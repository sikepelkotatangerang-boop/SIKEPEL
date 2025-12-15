import { NextRequest, NextResponse } from 'next/server';

/**
 * API untuk preview HTML Surat Keluar
 * Menampilkan preview sesuai format template SURATKELUAR.docx
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body;

    // Format tanggal
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const tanggalSurat = formatDate(formData.tanggal_surat || new Date().toISOString());

    // Kelurahan in uppercase
    const kelurahanUpper = (formData.kelurahan || 'Cibodas').toUpperCase();

    // Determine jabatan display logic
    // If jabatan = "LURAH" → {jabatan} = empty, {jabatan_detail} = "LURAH"
    // If jabatan = other → {jabatan} = "a.n LURAH", {jabatan_detail} = actual jabatan
    const isLurah = formData.jabatan?.toLowerCase().includes('lurah') && 
                    !formData.jabatan?.toLowerCase().includes('sekretaris') &&
                    !formData.jabatan?.toLowerCase().includes('camat');
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : (formData.jabatan || '');

    // Format tujuan (multiple recipients with numbering)
    let tujuanFormatted = '';
    if (formData.tujuan) {
      const tujuanList = formData.tujuan.split('\n').filter((t: string) => t.trim() !== '');
      if (tujuanList.length > 1) {
        // Multiple recipients - add numbering
        tujuanFormatted = tujuanList.map((t: string, i: number) => 
          `${i + 1}. ${t.trim()}`
        ).join('<br>');
      } else if (tujuanList.length === 1) {
        // Single recipient - no numbering
        tujuanFormatted = tujuanList[0].trim();
      }
    }

    // Format isi surat dengan paragraf
    const isiSuratFormatted = formData.isi_surat ? 
      formData.isi_surat.split('\n').map((p: string) => 
        p.trim() ? `<p style="text-indent: 50px; text-align: justify;">${p}</p>` : ''
      ).join('') : '';

    // Format data acara jika ada
    const dataAcaraFormatted = formData.data_acara ? 
      formData.data_acara.split('\n').map((line: string) => line).join('<br>') : '';

    // Generate HTML preview
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      padding: 40px 60px;
      max-width: 850px;
      margin: 0 auto;
      font-size: 12pt;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #000;
      padding-bottom: 15px;
    }
    .header h2 {
      margin: 5px 0;
      font-size: 16pt;
      font-weight: bold;
    }
    .header p {
      margin: 2px 0;
      font-size: 10pt;
    }
    .kop-section {
      margin: 20px 0;
    }
    .kop-section table {
      width: 100%;
      border-collapse: collapse;
    }
    .kop-section td {
      padding: 3px 0;
      vertical-align: top;
    }
    .kop-section td:first-child {
      width: 120px;
    }
    .kop-section td:nth-child(2) {
      width: 20px;
      text-align: center;
    }
    .content {
      margin: 20px 0;
    }
    .content p {
      margin: 10px 0;
      text-align: justify;
    }
    .tujuan-section {
      margin: 20px 0;
    }
    .data-acara {
      margin: 20px 0 20px 50px;
      line-height: 1.8;
    }
    .closing {
      margin-top: 30px;
      text-indent: 50px;
      text-align: justify;
    }
    .signature {
      margin-top: 40px;
      text-align: right;
      margin-right: 80px;
    }
    .signature p {
      margin: 5px 0;
      text-align: center;
    }
    .signature-name {
      margin-top: 80px;
      font-weight: bold;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>PEMERINTAH KOTA TANGERANG</h2>
    <h2>KELURAHAN ${kelurahanUpper}</h2>
    <p>${formData.alamat_kelurahan || ''}</p>
  </div>

  <div class="kop-section">
    <table>
      <tr>
        <td>Nomor</td>
        <td>:</td>
        <td>${formData.nomor_surat || '{nomor_surat}'}</td>
      </tr>
      <tr>
        <td>Sifat</td>
        <td>:</td>
        <td>${formData.sifat || 'Biasa'}</td>
      </tr>
      <tr>
        <td>Lampiran</td>
        <td>:</td>
        <td>${formData.jumlah_lampiran || '0'} ${parseInt(formData.jumlah_lampiran || '0') > 1 ? 'berkas' : 'berkas'}</td>
      </tr>
      <tr>
        <td>Perihal</td>
        <td>:</td>
        <td><strong>${formData.perihal || '{perihal}'}</strong></td>
      </tr>
    </table>
  </div>

  <div class="tujuan-section">
    <p style="margin-bottom: 10px;">Kepada Yth.</p>
    <p style="margin-left: 30px; line-height: 1.8;">${tujuanFormatted}</p>
    <p style="margin-top: 10px;">di -</p>
    <p style="margin-left: 50px; margin-bottom: 20px;"><strong>Tempat</strong></p>
  </div>

  <div class="content">
    ${isiSuratFormatted}
    
    ${dataAcaraFormatted ? `
    <div class="data-acara">
      ${dataAcaraFormatted}
    </div>
    ` : ''}
    
    <p class="closing">${formData.akhiran || 'Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.'}</p>
  </div>

  <div class="signature">
    <p>${kelurahanUpper}, ${tanggalSurat}</p>
    <p>${jabatanHeader}</p>
    <p>${jabatanDetail}</p>
    <p class="signature-name">${formData.nama_pejabat || '{nama_pejabat}'}</p>
    <p>NIP. ${formData.nip_pejabat || '{nip_pejabat}'}</p>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating HTML preview:', error);
    return NextResponse.json(
      { error: 'Gagal membuat preview HTML' },
      { status: 500 }
    );
  }
}
