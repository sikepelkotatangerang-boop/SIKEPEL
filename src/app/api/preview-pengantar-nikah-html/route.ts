import { NextRequest, NextResponse } from 'next/server';

/**
 * API untuk preview HTML Surat Pengantar Nikah (N1)
 * Menampilkan preview sesuai format template N1.docx
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

    const tanggalSurat = formatDate(new Date().toISOString());

    // Determine jabatan display logic
    const isLurah = formData.jabatan?.toLowerCase().trim() === 'lurah';
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : (formData.jabatan || '');

    // Kelurahan in uppercase
    const kelurahanUpper = (formData.kelurahan || 'Cibodas').toUpperCase();

    // Generate HTML preview sesuai format N1.docx
    // Helper helper to handle optional values
    const getOptionalValue = (val: any, placeholder: string) => {
      if (!val) return '-';
      return val;
    };

    // Helper to handle required values (fallback to placeholder for debugging if missing)
    const getRequiredValue = (val: any, placeholder: string) => {
      return val || placeholder;
    };

    // Generate HTML preview sesuai format N1.docx
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.5;
      padding: 40px 60px;
      max-width: 850px;
      margin: 0 auto;
      font-size: 12pt;
    }
    .header-left {
      margin-bottom: 40px;
    }
    .header-left p {
      margin: 2px 0;
      line-height: 1.3;
    }
    .model {
      text-align: right;
      margin-bottom: 30px;
      font-weight: bold;
    }
    .title {
      text-align: center;
      margin: 30px 0 20px 0;
      text-decoration: underline;
      font-weight: bold;
      font-size: 14pt;
    }
    .nomor-section {
      text-align: center;
      margin-bottom: 30px;
    }
    .content {
      text-align: justify;
      margin: 20px 0;
    }
    .content p {
      margin: 10px 0;
      text-indent: 50px;
    }
    .data-list {
      margin: 15px 0 15px 30px;
    }
    .data-list table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-list td {
      padding: 3px 0;
      vertical-align: top;
    }
    .data-list td:first-child {
      width: 30px;
    }
    .data-list td:nth-child(2) {
      width: 250px;
    }
    .data-list td:nth-child(3) {
      width: 20px;
      text-align: center;
    }
    .section-title {
      margin: 20px 0 10px 30px;
      font-weight: normal;
    }
    .subsection {
      margin-left: 30px;
    }
    .closing {
      margin-top: 30px;
      text-indent: 50px;
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
  <div class="header-left">
    <p><strong>LAMPIRAN V</strong></p>
    <p><strong>KEPUTUSAN DIREKTUR JENDERAL BIMBINGAN MASYARAKAT ISLAM</strong></p>
    <p><strong>(NOMOR 473 TAHUN 2020)</strong></p>
  </div>

  <div class="model">Model N1</div>

  <div class="header-left">
    <p><strong>KANTOR DESA/KELURAHAN : ${kelurahanUpper}</strong></p>
    <p><strong>KECAMATAN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: CIBODAS</strong></p>
    <p><strong>KABUPATEN/KOTA&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: KOTA TANGERANG</strong></p>
  </div>

  <div class="title">
    PENGANTAR NIKAH
  </div>

  <div class="nomor-section">
    Nomor : ${getRequiredValue(formData.nomor_surat, '{nomor_surat}')}
  </div>

  <div class="content">
    <p>Yang bertanda tangan di bawah ini menerangkan dengan sesungguhnya bahwa :</p>

    <div class="data-list">
      <table>
        <tr>
          <td>1.</td>
          <td>Nama</td>
          <td>:</td>
          <td><strong>${getRequiredValue(formData.nama_pemohon, '{nama_pemohon}')}</strong></td>
        </tr>
        <tr>
          <td>2.</td>
          <td>Nomor Induk Kependudukan (NIK)</td>
          <td>:</td>
          <td>${getRequiredValue(formData.nik_pemohon, '{nik_pemohon}')}</td>
        </tr>
        <tr>
          <td>3.</td>
          <td>Jenis Kelamin</td>
          <td>:</td>
          <td>${getRequiredValue(formData.kelamin_pemohon, '{kelamin_pemohon}')}</td>
        </tr>
        <tr>
          <td>4.</td>
          <td>Tempat dan tanggal lahir</td>
          <td>:</td>
          <td>${getRequiredValue(formData.tempat_lahir_pemohon, '{tempat_lahir_pemohon}')}, ${formatDate(formData.tanggal_lahir_pemohon) || '{tanggal_lahir_pemohon}'}</td>
        </tr>
        <tr>
          <td>5.</td>
          <td>Kewarganegaraan</td>
          <td>:</td>
          <td>${getRequiredValue(formData.negara_pemohon, '{negara_pemohon}')}</td>
        </tr>
        <tr>
          <td>6.</td>
          <td>Agama</td>
          <td>:</td>
          <td>${getRequiredValue(formData.agama_pemohon, '{agama_pemohon}')}</td>
        </tr>
        <tr>
          <td>7.</td>
          <td>Pekerjaan</td>
          <td>:</td>
          <td>${getRequiredValue(formData.pekerjaan_pemohon, '{pekerjaan_pemohon}')}</td>
        </tr>
        <tr>
          <td>8.</td>
          <td>Alamat</td>
          <td>:</td>
          <td>${getRequiredValue(formData.alamat_pemohon, '{alamat_pemohon}')} RT. ${formData.rt_pemohon || '...'} RW. ${formData.rw_pemohon || '...'}</td>
        </tr>
        <tr>
          <td>9.</td>
          <td>Status perkawinan</td>
          <td>:</td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td style="padding-left: 20px;">a. Jejaka/Jejaka Duda</td>
          <td></td>
          <td>: ${formData.status_jika_laki_laki || '-'}</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding-left: 20px;">Atau beristri ke ..</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td style="padding-left: 20px;">b. Perempuan : Perawan, Janda</td>
          <td>:</td>
          <td>${formData.status_jika_perempuan || '-'}</td>
        </tr>
      </table>
    </div>

    <p class="section-title">Adalah benar anak dari perkawinan seorang pria :</p>

    <div class="subsection">
      <p style="text-indent: 0; margin: 15px 0 10px 0;"><strong>Nama Lengkap dan alias : ${getOptionalValue(formData.nama_bapak, '{nama_bapak}')}</strong></p>
      <div class="data-list">
        <table>
          <tr>
            <td></td>
            <td>Nomor Induk Kependudukan (NIK)</td>
            <td>:</td>
            <td>${getOptionalValue(formData.nik_bapak, '{nik_bapak}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Tempat dan tanggal lahir</td>
            <td>:</td>
            <td>${formData.tempat_lahir_bapak ? `${formData.tempat_lahir_bapak}, ${formatDate(formData.tanggal_lahir_bapak)}` : '-'}</td>
          </tr>
          <tr>
            <td></td>
            <td>Kewarganegaraan</td>
            <td>:</td>
            <td>${getOptionalValue(formData.negara_bapak, '{negara_bapak}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Agama</td>
            <td>:</td>
            <td>${getOptionalValue(formData.agama_bapak, '{agama_bapak}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Pekerjaan</td>
            <td>:</td>
            <td>${getOptionalValue(formData.pekerjaan_bapak, '{pekerjaan_bapak}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Alamat</td>
            <td>:</td>
            <td>${getOptionalValue(formData.alamat_bapak, '{alamat_bapak}')}</td>
          </tr>
        </table>
      </div>

      <p style="text-indent: 0; margin: 20px 0 10px 0;">dengan seorang wanita</p>

      <p style="text-indent: 0; margin: 15px 0 10px 0;"><strong>Nama Lengkap dan alias : ${getOptionalValue(formData.nama_ibu, '{nama_ibu}')}</strong></p>
      <div class="data-list">
        <table>
          <tr>
            <td></td>
            <td>Nomor Induk Kependudukan (NIK)</td>
            <td>:</td>
            <td>${getOptionalValue(formData.nik_ibu, '{nik_ibu}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Tempat dan tanggal lahir</td>
            <td>:</td>
            <td>${formData.tempat_lahir_ibu ? `${formData.tempat_lahir_ibu}, ${formatDate(formData.tanggal_lahir_ibu)}` : '-'}</td>
          </tr>
          <tr>
            <td></td>
            <td>Kewarganegaraan</td>
            <td>:</td>
            <td>${getOptionalValue(formData.negara_ibu, '{negara_ibu}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Agama</td>
            <td>:</td>
            <td>${getOptionalValue(formData.agama_ibu, '{agama_ibu}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Pekerjaan</td>
            <td>:</td>
            <td>${getOptionalValue(formData.pekerjaan_ibu, '{pekerjaan_ibu}')}</td>
          </tr>
          <tr>
            <td></td>
            <td>Alamat</td>
            <td>:</td>
            <td>${getOptionalValue(formData.alamat_ibu, '{alamat_ibu}')}</td>
          </tr>
        </table>
      </div>
    </div>

    <p class="closing">Demikian, surat pengantar ini dibuat dengan mengingat sumpah jabatan dan untuk dipergunakan sebagaimana mestinya.</p>
  </div>

  <div class="signature">
    <p>Tangerang, ${tanggalSurat}</p>
    <p>${jabatanHeader}</p>
    <p>${jabatanDetail}</p>
    <p class="signature-name">${getRequiredValue(formData.nama_pejabat, '{nama_pejabat}')}</p>
    <p>NIP. ${formData.nip_pejabat || '-'}</p>
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
