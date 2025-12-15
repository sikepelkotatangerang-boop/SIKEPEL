
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('public/template/F-106.docx'), 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Remove XML tags to see text
const text = xml.replace(/<[^>]+>/g, '');
// console.log("Extracted Text Content:\n", text); // Too long

// Regex for keys
// We look for anything between `{` and `}`
const matches = text.match(/\{[^}]+\}/g);
console.log("Found Placeholders:", matches);

// Check if there is a loop tag
const loopMatches = text.match(/\{#[^}]+\}/g);
console.log("Found Loop Start Tags:", loopMatches);
