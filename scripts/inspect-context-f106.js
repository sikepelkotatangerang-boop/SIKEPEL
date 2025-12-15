
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('public/template/F-106.docx'), 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Remove tags but keep placeholders
const text = xml.replace(/<[^>]+>/g, ' ');

// Helper to print context
function printContext(placeholder) {
    const index = text.indexOf(placeholder);
    if (index === -1) return;
    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + 100);
    console.log(`Context for ${placeholder}:`);
    console.log('...' + text.substring(start, end).replace(/\s+/g, ' ') + '...');
    console.log('-----------------------------------');
}

const placeholders = [
    '{nama}',
    '{nik}',
    '{shdk}',
    '{no_urut}',
    '{pendidikan_semula}',
    '{pekerjaan_semula}',
    '{agama_semula}',
    '{elemen_lainnya}'
];

placeholders.forEach(printContext);
