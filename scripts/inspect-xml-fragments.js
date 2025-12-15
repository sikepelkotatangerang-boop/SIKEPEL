
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('public/template/F-106.docx');
const content = fs.readFileSync(filePath, 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// We want to find the XML string that represents "{no_urut_yang_diubah}"
// and "{dasar_perubahan_lainnya}" to wrap them.

// Split by typical tag chars to find the sequence
// We are looking for "no" ... "urut" ... "yang" ... "diubah"
// and wrap it.

// Simple heuristic: 
// 1. Find the first occurrence of "no_urut_yang_diubah" (ignoring tags).
// 2. Identify the surrounding <w:t> or <w:r> tags.
// 3. Insert loop tag.

// Let's print the XML around "no_urut_yang_diubah":
const regex = /no(<[^>]*>|)*_urut(<[^>]*>|)*_yang(<[^>]*>|)*_diubah/i;
const match = xml.match(regex);
if (match) {
    console.log("Found match for no_urut_yang_diubah:");
    console.log(match[0]);
    console.log("Index:", match.index);

    // Check context
    const start = Math.max(0, match.index - 50);
    const end = Math.min(xml.length, match.index + match[0].length + 50);
    console.log("Context:\n", xml.substring(start, end));
} else {
    console.log("No match for no_urut_yang_diubah");
}

const regex2 = /dasar(<[^>]*>|)*_perubahan(<[^>]*>|)*_lainnya/i;
const match2 = xml.match(regex2);
if (match2) {
    console.log("Found match for dasar_perubahan_lainnya:");
    console.log(match2[0]);
    console.log("Index:", match2.index);

    const start = Math.max(0, match2.index - 50);
    const end = Math.min(xml.length, match2.index + match2[0].length + 50);
    console.log("Context:\n", xml.substring(start, end));
} else {
    console.log("No match for dasar_perubahan_lainnya");
}
