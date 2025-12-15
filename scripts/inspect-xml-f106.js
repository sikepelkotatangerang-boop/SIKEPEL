
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('public/template/F-106.docx'), 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Extract potential tags (anything with { ... })
// This is a rough extraction as tags might be split across XML nodes.
// But we want to see the text content to guess the placeholders.

// Remove XML tags to see text
const text = xml.replace(/<[^>]+>/g, '');
console.log("Extracted Text Content:\n", text);

// Regex for curly braces
const matches = text.match(/\{[^}]+\}/g);
console.log("\nPotential Placeholders found in text:", matches);

// Check specifically for the problematic one
const problem = text.match(/\{nik_pemohon.{0,20}/);
console.log("\nProblematic area:", problem);
