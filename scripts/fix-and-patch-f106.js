
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('public/template/F-106.docx');
const content = fs.readFileSync(filePath, 'binary');
const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

console.log('Original XML length:', xml.length);

// STEP 1: REVERT CORRUPTION
// We look for the strings we likely created.

// 1. Start Revert
// We created {{#list_ubah}no_urut...
// We want to turn {{#list_ubah} back into {
let revertedXml = xml.replace(/{{#list_ubah}/g, '{');
if (revertedXml === xml) {
    console.log('Warning: Could not find {{#list_ubah} to revert. It might be slightly different.');
    // Try without the brace? regex: /{#list_ubah}/g -> '' ?
    // If I prepended it, maybe checking for {#list_ubah} is safer.
    // If I see <w:t>{#list_ubah}no_urut, removing {#list_ubah} works.
    revertedXml = xml.replace(/{#list_ubah}/g, '');
}
xml = revertedXml;

// 2. End Revert
// We created dasar_perubahan_lainnya{/list_ubah}
// We want to remove {/list_ubah}
revertedXml = xml.replace(/{ \/list_ubah}/g, ''); // just in case
revertedXml = revertedXml.replace(/{\/list_ubah}/g, '');
xml = revertedXml;

console.log('Reverted attempt finished. XML length:', xml.length);

// STEP 2: APPLY CORRECT PATCH

// 1. Find Start Placeholder: {no_urut_yang_diubah}
// We want to inject {#list_ubah} BEFORE the opening {
// Regex for no_urut_yang_diubah
const startNameRegex = /no(<[^>]*>|)*_urut(<[^>]*>|)*_yang(<[^>]*>|)*_diubah/i;
const startMatch = xml.match(startNameRegex);

if (!startMatch) {
    console.error('Could not find start placeholder no_urut_yang_diubah');
    process.exit(1);
}

const startIdx = startMatch.index;
// Find the opening brace { BEFORE startIdx
const openBraceIdx = xml.lastIndexOf('{', startIdx);
if (openBraceIdx === -1) {
    console.error('Could not find opening brace for start placeholder.');
    process.exit(1);
}

// Check if there's any other brace in between to avoid false match
const checkClose = xml.lastIndexOf('}', startIdx);
if (checkClose > openBraceIdx) {
    console.warn('Warning: found } between { and placeholder name. Might be targeting wrong brace.');
}

console.log(`Found start placeholder at ${startIdx}. Brace at ${openBraceIdx}.`);
// Insert {#list_ubah} BEFORE the brace.
// <w:t>{no_urut... -> <w:t>{#list_ubah}{no_urut...
// wait, that's what created {{#...
// Correct is: <w:t>{#list_ubah}</w:t><w:t>{no_urut...
// OR just {#list_ubah}{no_urut... IS CORRECT if docxtemplater parses it as TWO tags.
// But {{#... is ONE tag starting with {#...
// So if I have {{#list_ubah}no_urut...}, that is ONE tag.
// I want {#list_ubah}{no_urut...} -> TWO tags.
// So I need to insert `{#list_ubah}` before `{`.
// Result: `{#list_ubah}{no_urut...`.
// This parses as:
// Tag 1: `{#list_ubah` (Missing closing }???)
// Ah, `{#list_ubah}` must be closed by `}`.
// So: `{#list_ubah}{no_urut...` -> Tag 1 is `{#list_ubah`... where is the }?
// It merges with the next {? No.
// I MUST INSERT A CLOSING BRACE for the loop tag!
// `{#list_ubah}` is the tag CONTENT. The delimiters happen outside.
// So I need to insert `{` + `#list_ubah` + `}`.
// Total: `{#list_ubah}` tag.
// So I must insert `{#list_ubah}` BEFORE the existing `{`.
// result: `{#list_ubah}{no_urut...}`.
// Tag 1: `{#list_ubah}`. Tag 2: `{no_urut...}`.
// THIS IS CORRECT.

// So why did my previous "Start Revert" code look for `{{`?
// Because I replaced `name` with `{#list_ubah}name`.
// And `name` was preceded by `{` in the original XML.
// So I got `{` + `{#list_ubah}name` = `{{#list_ubah}name`.
// This is ONE tag `{#list_ubah}name` starting with extra `{`.
// And it ends with `}`.
// So docxtemplater saw tag: `{#list_ubah}name`.
// And complained about `Duplicate open tag` `{{`.

// So, to Fix:
// I need `{#list_ubah}` (full tag) BEFORE `{no_urut...`.
// So I insert `{#list_ubah}` before the `{`.

const beforeBrace = xml.slice(0, openBraceIdx);
const afterBrace = xml.slice(openBraceIdx);
// Insert {#list_ubah} (which is { #list_ubah })
xml = beforeBrace + '{#list_ubah}' + afterBrace;
console.log('Inserted loop start correctly: {#list_ubah}{...');


// 2. Find End Placeholder: {dasar_perubahan_lainnya}
// We want to inject {/list_ubah} AFTER the closing }
// Regex for dasar_perubahan_lainnya
const endNameRegex = /dasar(<[^>]*>|)*_perubahan(<[^>]*>|)*_lainnya/i;
// Since we modified xml, finding index might be shifted.
const endMatch = xml.match(endNameRegex);

if (!endMatch) {
    console.error('Could not find end placeholder dasar_perubahan_lainnya');
    process.exit(1);
}

const endIdx = endMatch.index;
const endLen = endMatch[0].length;
// Find closing brace AFTER this match
const closeBraceIdx = xml.indexOf('}', endIdx + endLen);

if (closeBraceIdx === -1) {
    console.error('Could not find closing brace for end placeholder');
    process.exit(1);
}

console.log(`Found end placeholder at ${endIdx}. Brace at ${closeBraceIdx}.`);
// Insert {/list_ubah} AFTER the brace.
const beforeClose = xml.slice(0, closeBraceIdx + 1); // include }
const afterClose = xml.slice(closeBraceIdx + 1);
xml = beforeClose + '{/list_ubah}' + afterClose;
console.log('Inserted loop end correctly: ...}{/list_ubah}');

zip.file('word/document.xml', xml);
const buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(filePath, buffer);
console.log('Template fixed and patched successfully.');
