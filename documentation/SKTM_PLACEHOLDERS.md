# SKTM.docx - Template Placeholders

**Generated**: 2025-10-20 15:40:53

**Total Placeholders**: 26

## Table of Contents

1. [Placeholder List](#placeholder-list)
2. [Placeholder Locations](#placeholder-locations)
3. [TypeScript Interface](#typescript-interface)
4. [Template Data Mapping](#template-data-mapping)
5. [Usage Example](#usage-example)

## Placeholder List

Total: **26** placeholders

1. `{agama}`
2. `{alamat}`
3. `{alamat_kelurahan}`
4. `{desil}`
5. `{jabatan}`
6. `{jabatan_detail}`
7. `{kecamatan}`
8. `{kelamin_pemohon}`
9. `{kelurahan}`
10. `{keterangan}`
11. `{kota_kabupaten}`
12. `{nama_pejabat}`
13. `{nama_pemohon}`
14. `{negara}`
15. `{nik_pemohon}`
16. `{nip_pejabat}`
17. `{nomor_surat}`
18. `{pekerjaan}`
19. `{pengantar_rt}`
20. `{perkawinan}`
21. `{peruntukan}`
22. `{rt}`
23. `{rw}`
24. `{tanggal_lahir}`
25. `{tanggal_surat}`
26. `{tempat_lahir}`

## Placeholder Locations

Shows where each placeholder appears in the document:

### `{agama}`

- Paragraph 20

### `{alamat}`

- Paragraph 22

### `{alamat_kelurahan}`

- Paragraph 5

### `{desil}`

- Paragraph 27

### `{jabatan}`

- Table 1, Row 1, Cell 1

### `{jabatan_detail}`

- Table 1, Row 1, Cell 1

### `{kecamatan}`

- Paragraph 23

### `{kelamin_pemohon}`

- Paragraph 16

### `{kelurahan}`

**Appears 4 times:**

- Paragraph 4
- Paragraph 12
- Paragraph 23
- Paragraph 25

### `{keterangan}`

- Paragraph 27

### `{kota_kabupaten}`

- Paragraph 23

### `{nama_pejabat}`

- Table 1, Row 1, Cell 1

### `{nama_pemohon}`

- Paragraph 14

### `{negara}`

- Paragraph 18

### `{nik_pemohon}`

- Paragraph 15

### `{nip_pejabat}`

- Table 1, Row 1, Cell 1

### `{nomor_surat}`

- Paragraph 10

### `{pekerjaan}`

- Paragraph 21

### `{pengantar_rt}`

- Paragraph 25

### `{perkawinan}`

- Paragraph 19

### `{peruntukan}`

- Paragraph 29

### `{rt}`

**Appears 2 times:**

- Paragraph 22
- Paragraph 25

### `{rw}`

**Appears 2 times:**

- Paragraph 22
- Paragraph 25

### `{tanggal_lahir}`

- Paragraph 17

### `{tanggal_surat}`

- Table 1, Row 1, Cell 1

### `{tempat_lahir}`

- Paragraph 17

## TypeScript Interface

```typescript
interface SktmFormData {
  agama: string;
  alamat: string;
  alamatKelurahan: string;
  desil: string;
  jabatan: string;
  jabatanDetail: string;
  kecamatan: string;
  kelaminPemohon: string;
  kelurahan: string;
  keterangan: string;
  kotaKabupaten: string;
  namaPejabat: string;
  namaPemohon: string;
  negara: string;
  nikPemohon: string;
  nipPejabat: string;
  nomorSurat: string;
  pekerjaan: string;
  pengantarRt: string;
  perkawinan: string;
  peruntukan: string;
  rt: string;
  rw: string;
  tanggalLahir: string;
  tanggalSurat: string;
  tempatLahir: string;
}
```

## Template Data Mapping

```typescript
const templateData = {
  agama: formData.agama || '',
  alamat: formData.alamat || '',
  alamat_kelurahan: formData.alamat_kelurahan || '',
  desil: formData.desil || '',
  jabatan: formData.jabatan || '',
  jabatan_detail: formData.jabatan_detail || '',
  kecamatan: formData.kecamatan || '',
  kelamin_pemohon: formData.kelamin_pemohon || '',
  kelurahan: formData.kelurahan || '',
  keterangan: formData.keterangan || '',
  kota_kabupaten: formData.kota_kabupaten || '',
  nama_pejabat: formData.nama_pejabat || '',
  nama_pemohon: formData.nama_pemohon || '',
  negara: formData.negara || '',
  nik_pemohon: formData.nik_pemohon || '',
  nip_pejabat: formData.nip_pejabat || '',
  nomor_surat: formData.nomor_surat || '',
  pekerjaan: formData.pekerjaan || '',
  pengantar_rt: formData.pengantar_rt || '',
  perkawinan: formData.perkawinan || '',
  peruntukan: formData.peruntukan || '',
  rt: formData.rt || '',
  rw: formData.rw || '',
  tanggal_lahir: formData.tanggal_lahir || '',
  tanggal_surat: formData.tanggal_surat || '',
  tempat_lahir: formData.tempat_lahir || '',
};
```

## Usage Example

```typescript
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load template
const templatePath = join(process.cwd(), 'public', 'template', 'SKTM.docx');
const content = readFileSync(templatePath, 'binary');

const zip = new PizZip(content);
const doc = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
  nullGetter: function() {
    return '';
  },
});

// Prepare template data
const templateData = {
  agama: formData.agama || '',
  alamat: formData.alamat || '',
  alamat_kelurahan: formData.alamat_kelurahan || '',
  desil: formData.desil || '',
  jabatan: formData.jabatan || '',
  // ... (see Template Data Mapping section for complete list)
};

// Render document
doc.render(templateData);

// Generate DOCX buffer
const buffer = doc.getZip().generate({
  type: 'nodebuffer',
  compression: 'DEFLATE',
});
```

## Notes

- All placeholders use the format `{placeholder_name}`
- Empty strings (`''`) are used as default values
- Special characters in placeholder names require quotes in object keys
- Template file: `public/template/SKTM.docx`

