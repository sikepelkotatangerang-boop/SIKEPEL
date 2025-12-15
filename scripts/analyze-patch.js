
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('public/template/F-106.docx');
const content = fs.readFileSync(filePath, 'binary');
const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

// Regex to find nama_yang_diubah with tags in between
// e.g. nama<...>_yang<...>_diubah
const namesRegex = /nama(<[^>]*>)*_yang(<[^>]*>)*_diubah/i;
const match = xml.match(namesRegex);

if (!match) {
    console.error('Could not find nama_yang_diubah even with fuzzy search.');
    process.exit(1);
}

console.log('Found nama_yang_diubah at index:', match.index);
const startIndex = match.index;

// Find the start of the row container <w:tr ...
// We search backwards from startIndex
const rowStartTag = '<w:tr ';
const rowStartSimple = '<w:tr>';
let trStart = -1;

for (let i = startIndex; i >= 0; i--) {
    if (xml.substring(i, i + rowStartTag.length) === rowStartTag || xml.substring(i, i + rowStartSimple.length) === rowStartSimple) {
        trStart = i;
        break;
    }
}

if (trStart === -1) {
    console.error('Could not find start of <w:tr> for nama_yang_diubah');
    process.exit(1);
}

console.log('Row starts at:', trStart);

// Now finding the END of the loop.
// The user lists many fields. The last one is likely 'dasar_perubahan_lainnya' or 'lainnya_akhir'.
// Let's look for 'dasar_perubahan_lainnya'
const endPlaceholder = 'dasar_perubahan_lainnya';
const endMatch = xml.indexOf(endPlaceholder);

if (endMatch === -1) {
    console.error('Could not find dasar_perubahan_lainnya');
    // Fallback: Use the end of the row where nama_yang_diubah is found if we assume 1 row.
}

console.log('Found dasar_perubahan_lainnya at:', endMatch);

let trEnd = -1;
if (endMatch !== -1) {
    // specific end row
    trEnd = xml.indexOf('</w:tr>', endMatch);
} else {
    // same row as start
    trEnd = xml.indexOf('</w:tr>', startIndex);
}

if (trEnd === -1) {
    console.error('Could not find </w:tr>');
    process.exit(1);
}

trEnd = trEnd + 7; // include </w:tr>

console.log(`Loop should wrap from ${trStart} to ${trEnd}`);

// Injecting Loop Tags
// {#list_ubah} BEFORE the row
// {/list_ubah} AFTER the row (end)

// However, valid docxtemplater loop over rows usually requires the tag to be INSIDE the cell or paragraph if ensuring table integrity, 
// OR just flatly around the <w:tr> elements. 
// "If you want to loop over table rows, you can place the start tag in the first cell and the end tag in the last cell..."
// OR "You can also put the start tag before the first <w:tr> and the end tag after the last </w:tr>, but this requires raw XML editing" which is what we are doing.

const newXml = xml.slice(0, trStart) +
    '<w:t>{#list_ubah}</w:t>' + // This might break if not in a run/para. 
    // Actually, putting it strictly before tr might be invalid valid OpenXML if not in a w:body? 
    // Tables are usually <w:tbl> <w:tr> ...
    // Inserting <w:t> directly in <w:tbl> is invalid. It must be in a <w:tr><w:tc><w:p><w:r>...

    // Safer approach: use docxtemplater syntax <w:tr> ... <w:tc> ... {#list_ubah} ... </w:tr>
    // But then I need to parse the XML perfectly.

    // Let's TRY putting the loop tag just before the placeholder inside the content?
    // But that doesn't loop the ROW.

    // Docxtemplater 'table row' loop:
    // {#users} (in first cell) ... {/users} (in last cell)

    // I need to insert `{#list_ubah}` at the beginning of the text content of the first cell of the starting row.
    // And `{/list_ubah}` at the end of the text content of the last cell of the ending row.

    // I will replace `nama_` (start of placeholder) with `{#list_ubah}nama_`?
    // No, that loops the user, but maybe not the row if docxtemplater doesn't detect the row scope.
    // Docxtemplater auto-detects row loop if tags are in the same row.

    // Let's try: Replace the first placeholder `{no_urut_yang_diubah}` (or whatever comes first) with `{#list_ubah}{no_urut_yang_diubah}`.
    // And replace the last placeholder with `{dasar_perubahan_lainnya}{/list_ubah}`.

    // Placeholders:
    // 1. {no_urut_yang_diubah} or {nama_yang_diubah}?

    xml.slice(trStart, trEnd) +
    xml.slice(trEnd);
