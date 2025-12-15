
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve('public/template/F-106.docx'), 'binary');

const zip = new PizZip(content);
const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
});

const text = doc.getFullText();
// Simple regex to find content between curly braces
const matches = text.match(/\{[^}]+\}/g);
console.log("Placeholders found:", matches);

// Also try to inspect the raw XML for tags if getFullText doesn't show them (docxtemplater sometimes hides them if not well formed)
// But getFullText is usually enough for simple inspection.
