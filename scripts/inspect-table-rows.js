
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('public/template/F-106.docx'), 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Helper to find the table row containing a specific text
function findRowContext(textToFind) {
    const index = xml.indexOf(textToFind);
    if (index === -1) {
        console.log(`Text "${textToFind}" not found.`);
        return;
    }

    // Search backwards for <w:tr
    const rowStart = xml.lastIndexOf('<w:tr ', index);
    const rowStartSimple = xml.lastIndexOf('<w:tr>', index);
    const realStart = Math.max(rowStart, rowStartSimple);

    // Search forwards for </w:tr>
    const rowEnd = xml.indexOf('</w:tr>', index);

    if (realStart !== -1 && rowEnd !== -1) {
        console.log(`Found "${textToFind}" inside a table row.`);
        console.log(`Row starts at: ${realStart}, Ends at: ${rowEnd}`);
        console.log(`Snippet: ${xml.substring(realStart, realStart + 100)} ... ${xml.substring(rowEnd - 100, rowEnd + 7)}`);
    } else {
        console.log(`"${textToFind}" found but seemingly not in a standard row structure (or detection failed).`);
        console.log(`Surrounding XML: ${xml.substring(index - 100, index + 100)}`);
    }
}

findRowContext('{nama_yang_diubah}');
findRowContext('{pendidikan_semula}');
