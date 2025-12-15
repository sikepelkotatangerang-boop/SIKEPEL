import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import ConvertAPI from 'convertapi';

// Configure ConvertAPI
// Ensure you have CONVERT_API_SECRET in your .env.local
// If not, this might fail or we should handle fallback.
const convertApiSecret = process.env.CONVERT_API_SECRET;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { dataWilayah, formData, entries } = body;

        // 1. Prepare Data for Template
        const list_ubah = entries.map((entry: any) => ({
            // Data Identitas
            no_urut_yang_diubah: entry.no_urut,
            nama_yang_diubah: entry.nama,
            nik_yang_diubah: entry.nik,
            shdk_yang_diubah: entry.shdk,

            // Data Rincian (Using same no_urut?)
            no_urut: entry.no_urut,

            // Pendidikan
            pendidikan_semula: entry.changes.pendidikan.active ? entry.changes.pendidikan.semula : '',
            pendidikan_akhir: entry.changes.pendidikan.active ? entry.changes.pendidikan.menjadi : '',
            dasar_perubahan_pendidikan: entry.changes.pendidikan.active ? entry.changes.pendidikan.dasar : '',

            // Pekerjaan
            pekerjaan_semula: entry.changes.pekerjaan.active ? entry.changes.pekerjaan.semula : '',
            pekerjaan_akhir: entry.changes.pekerjaan.active ? entry.changes.pekerjaan.menjadi : '',
            dasar_perubahan_pekerjaan: entry.changes.pekerjaan.active ? entry.changes.pekerjaan.dasar : '',

            // Agama
            no_urut_agamadanperubahanlainnya: entry.no_urut,
            agama_semula: entry.changes.agama.active ? entry.changes.agama.semula : '',
            agama_akhir: entry.changes.agama.active ? entry.changes.agama.menjadi : '',
            dasar_perubahan_agama: entry.changes.agama.active ? entry.changes.agama.dasar : '',

            // Lainnya
            elemen_lainnya: entry.changes.lainnya.active ? entry.changes.lainnya.elemen : '',
            lainnya_semula: entry.changes.lainnya.active ? entry.changes.lainnya.semula : '',
            lainnya_akhir: entry.changes.lainnya.active ? entry.changes.lainnya.menjadi : '',
            dasar_perubahan_lainnya: entry.changes.lainnya.active ? entry.changes.lainnya.dasar : '',
        }));

        const templateData = {
            // Wilayah & Pemohon
            provinsi: dataWilayah.provinsi,
            kabupaten: dataWilayah.kabupaten_kota,
            kabupaten_kota: dataWilayah.kabupaten_kota,
            kecamatan: dataWilayah.kecamatan,
            desa_kelurahan: dataWilayah.desakelurahan,

            // Pemohon
            nama_pemohon: formData.nama_lengkap,
            nik_pemohon: formData.nik,
            kk_pemoohon: formData.no_kk,
            alamat_pemohon: `${formData.alamat_rumah}, RT ${formData.rt}/RW ${formData.rw}, Kode Pos ${formData.kode_pos}`,

            tanggal_surat: new Date(formData.tanggal_surat).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            }),

            // The loop
            list_ubah: list_ubah
        };

        // 2. Load Template
        const templatePath = path.resolve('public/template/F-106.docx');
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => '', // Replace missing tags with empty string
        });

        // 3. Render Template
        doc.render(templateData);
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // 4. Save DOCX temporarily
        const fileName = `F106_${formData.nik}_${Date.now()}`;
        const outputDir = path.resolve('public/storage/surat');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const docxPath = path.join(outputDir, `${fileName}.docx`);
        fs.writeFileSync(docxPath, buf);

        // 5. Convert to PDF using ConvertAPI
        let pdfUrl = '';
        let finalFilePath = docxPath;
        let fileType = 'docx';

        if (convertApiSecret) {
            try {
                const convertapi = new ConvertAPI(convertApiSecret);
                const result = await convertapi.convert('pdf', {
                    File: docxPath
                }, 'docx');

                const pdfPath = path.join(outputDir, `${fileName}.pdf`);
                await result.saveFiles(pdfPath);

                finalFilePath = pdfPath;
                fileType = 'pdf';

                pdfUrl = `/storage/surat/${fileName}.pdf`;

                // Optional: Delete DOCX if PDF success? 
                // Maybe keep it for backup.
            } catch (convErr) {
                console.error('ConvertAPI failed:', convErr);
                // Fallback: Use DOCX
                pdfUrl = `/storage/surat/${fileName}.docx`;
                console.log('Falling back to DOCX');
            }
        } else {
            console.warn('No CONVERT_API_SECRET found. Skipping PDF conversion.');
            pdfUrl = `/storage/surat/${fileName}.docx`;
        }

        // 6. Save to Database
        // Table: documents
        // Columns: nomor_surat, jenis_dokumen, perihal, tujuan, tanggal_surat, status, storage_bucket_url, kelurahan_id...

        const nomorSurat = `F-106/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`;

        const kelurahan = await db.queryOne('SELECT id FROM kelurahan WHERE nama = $1', ['CIBODAS']);
        const kelurahanId = kelurahan ? kelurahan.id : 1;

        await db.query(
            `INSERT INTO documents 
            (nomor_surat, jenis_dokumen, perihal, tujuan, tanggal_surat, status, storage_bucket_url, kelurahan_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                nomorSurat,
                'F-1.06', // jenis_dokumen (Use the form code or generic type)
                'Surat Pernyataan Perubahan Data (F-1.06)',
                'Dinas Kependudukan', // tujuan (used to be penerima)
                formData.tanggal_surat,
                'active', // status (default in schema is active)
                pdfUrl, // storage_bucket_url (storing relative path)
                kelurahanId
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Dokumen berhasil dibuat',
            url: pdfUrl,
            type: fileType
        });

    } catch (error: any) {
        console.error('Error processing F-106:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal memproses dokumen' },
            { status: 500 }
        );
    }
}
