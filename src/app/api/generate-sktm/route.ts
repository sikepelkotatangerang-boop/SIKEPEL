import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import db from '@/lib/db';
import ConvertAPI from 'convertapi';
import { getSetting } from '@/lib/utils/settings';

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

    // Load the template
    const templatePath = join(process.cwd(), 'public', 'template', 'SKTM.docx');
    const content = readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function () {
        return '';
      },
    });

    // Prepare data for template
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

    // Format bulan ke romawi
    const getBulanRomawi = () => {
      const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      return bulanRomawi[new Date().getMonth()];
    };

    // Check if jabatan contains "Lurah" (case insensitive)
    const isLurah = formData.jabatan?.toLowerCase().trim() === 'lurah';

    // Jika Lurah: tampilkan "LURAH" saja
    // Jika bukan Lurah: tampilkan "a.n LURAH" di jabatan_header dan jabatan asli di jabatan_detail
    const jabatanHeader = isLurah ? 'LURAH' : 'a.n LURAH';
    const jabatanDetail = isLurah ? '' : formData.jabatan || '';

    // Prepare template data sesuai dengan placeholder di template
    const templateData = {
      // Data Surat
      nomor_surat: formData.nomor_surat || '',
      tanggal_surat: formatTanggal(new Date().toISOString()),
      tahun_surat: new Date().getFullYear().toString(),
      bulan_romawi: getBulanRomawi(),

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

      // Data Ekonomi
      desil: formData.desil || '',

      // Keperluan
      peruntukan: formData.peruntukan || '',
      pengantar_rt: formData.pengantar_rt || '',

      // Data Pejabat
      nama_pejabat: formData.nama_pejabat || '',
      nip_pejabat: formData.nip_pejabat || '',
      jabatan: jabatanHeader,
      jabatan_detail: jabatanDetail,
    };

    // Render the document (new API - tidak pakai setData lagi)
    try {
      doc.render(templateData);
    } catch (renderError: any) {
      throw new Error(`Template render error: ${renderError.message}`);
    }

    // Generate the DOCX document
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Convert DOCX to PDF using ConvertAPI
    const convertApiSecret = await getSetting('CONVERTAPI_SECRET') || process.env.CONVERTAPI_SECRET;

    // If ConvertAPI not configured, return DOCX instead
    if (!convertApiSecret) {
      return new NextResponse(new Uint8Array(docxBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="SKTM_${formData.nama_pemohon?.replace(/\s+/g, '_')}_${Date.now()}.docx"`,
        },
      });
    }

    // Save DOCX to temporary file
    const tempDocxPath = join(tmpdir(), `sktm_${Date.now()}.docx`);
    let tempPdfPath: string | null = null;

    try {
      writeFileSync(tempDocxPath, docxBuffer);

      const convertapi = new ConvertAPI(convertApiSecret);

      // Convert DOCX file to PDF
      const result = await convertapi.convert(
        'pdf',
        { File: tempDocxPath },
        'docx'
      );

      // Save PDF to temporary file
      tempPdfPath = join(tmpdir(), `sktm_${Date.now()}.pdf`);
      await result.files[0].save(tempPdfPath);

      // Read PDF file
      const pdfBuffer = readFileSync(tempPdfPath);

      // Return the PDF document
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="SKTM_${formData.nama_pemohon?.replace(/\s+/g, '_')}_${Date.now()}.pdf"`,
        },
      });
    } catch (convertError: any) {
      // Fallback: Return DOCX if PDF conversion fails
      return new NextResponse(new Uint8Array(docxBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="SKTM_${formData.nama_pemohon?.replace(/\s+/g, '_')}_${Date.now()}.docx"`,
        },
      });
    } finally {
      // Cleanup temporary files
      try {
        if (tempDocxPath) unlinkSync(tempDocxPath);
        if (tempPdfPath) unlinkSync(tempPdfPath);
      } catch (cleanupError) {
        // Silent cleanup error
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
