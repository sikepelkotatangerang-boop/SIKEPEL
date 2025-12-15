
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('public/template/F-106.docx'), 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Find indices
const idx1 = xml.indexOf('nama_yang_diubah');
const idx2 = xml.indexOf('pendidikan_semula');

console.log(`Index nama_yang_diubah: ${idx1}`);
console.log(`Index pendidikan_semula: ${idx2}`);

if (idx1 !== -1) {
    const start = Math.max(0, idx1 - 500);
    const end = Math.min(xml.length, idx1 + 1000); // Look ahead to see if it connects to pendidikan
    console.log('--- Context around nama_yang_diubah ---');
    console.log(xml.substring(start, end));
}

if (idx2 !== -1 && Math.abs(idx2 - idx1) > 1000) { // Only print if far apart
    const start = Math.max(0, idx2 - 500);
    const end = Math.min(xml.length, idx2 + 500);
    console.log('--- Context around pendidikan_semula ---');
    console.log(xml.substring(start, end));
}
