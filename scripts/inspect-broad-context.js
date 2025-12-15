
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('public/template/F-106.docx'), 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();
const text = xml.replace(/<[^>]+>/g, ' ');

// Print a large chunk around "Nama" or "NIK"
const pattern = /NIK/g;
let match;
while ((match = pattern.exec(text)) !== null) {
    console.log(`Found NIK at ${match.index}:`);
    console.log(text.substring(match.index - 50, match.index + 100));
    console.log('---');
}

const pattern2 = /Nama/g;
while ((match = pattern2.exec(text)) !== null) {
    console.log(`Found Nama at ${match.index}:`);
    console.log(text.substring(match.index - 50, match.index + 100));
    console.log('---');
}
