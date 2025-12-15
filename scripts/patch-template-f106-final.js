
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('public/template/F-106.docx');
const content = fs.readFileSync(filePath, 'binary');
const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

console.log('Original XML length:', xml.length);

// 1. Insert Loop Start: {#list_ubah} before no_urut_yang_diubah
// We target the text specifically.
// Regex: no(<[^>]*>|)*_urut(<[^>]*>|)*_yang(<[^>]*>|)*_diubah
const startRegex = /(no(<[^>]*>|)*_urut(<[^>]*>|)*_yang(<[^>]*>|)*_diubah)/i;
const startMatch = xml.match(startRegex);

if (!startMatch) {
    console.error('Could not find Start Placeholder no_urut_yang_diubah');
    process.exit(1);
}

// We insert {#list_ubah} before the match. 
// But we should insert it inside a <w:t> if possible, or just append to text.
// The match[0] is strictly the text "no...diubah" with tags interspersed.
// If we prepend strictly to it, we might break tags if match[0] starts with a closing tag?
// match[0] starts with 'no'. 'no' is text.
// So prepending '{#list_ubah}' to match[0] results in '{#list_ubah}no...'.
// If 'no' is at the start of <w:t>no...</w:t>, it becomes <w:t>{#list_ubah}no...</w:t>. Valid.
// If 'no' is in middle? <w:t>abc no...</w:t> -> <w:t>abc {#list_ubah}no...</w:t>. Valid.

const replacedStart = '{#list_ubah}' + startMatch[0];
xml = xml.replace(startMatch[0], replacedStart);
console.log('Inserted loop start.');

// 2. Insert Loop End: {/list_ubah} after dasar_perubahan_lainnya
// Regex: dasar(<[^>]*>|)*_perubahan(<[^>]*>|)*_lainnya
const endRegex = /(dasar(<[^>]*>|)*_perubahan(<[^>]*>|)*_lainnya)/i;
const endMatch = xml.match(endRegex);

if (!endMatch) {
    console.error('Could not find End Placeholder dasar_perubahan_lainnya');
    process.exit(1);
}

// We append {/list_ubah} to match[0].
const replacedEnd = endMatch[0] + '{/list_ubah}';
xml = xml.replace(endMatch[0], replacedEnd);
console.log('Inserted loop end.');

// Save
zip.file('word/document.xml', xml);
const buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(filePath, buffer);
console.log('Template patched successfully.');
