/**
 * Script untuk mengekstrak placeholder dari template DOCX
 * 
 * Cara menggunakan:
 * 1. Install dependencies: npm install
 * 2. Jalankan: node scripts/extract-placeholders.js
 * 
 * Script ini akan membaca SKTM.docx dan menampilkan semua placeholder
 */

const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const templatePath = path.join(__dirname, '..', 'public', 'template', 'SKTM.docx');

try {
  // Baca file template
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  // Extract document.xml yang berisi konten dokumen
  const documentXml = zip.file('word/document.xml').asText();
  
  // Regex untuk mencari placeholder {namaPlaceholder}
  const placeholderRegex = /\{([^}]+)\}/g;
  const placeholders = new Set();
  
  let match;
  while ((match = placeholderRegex.exec(documentXml)) !== null) {
    placeholders.add(match[1]);
  }
  
  console.log('\n=== PLACEHOLDER YANG DITEMUKAN DI TEMPLATE SKTM.docx ===\n');
  
  if (placeholders.size === 0) {
    console.log('❌ Tidak ada placeholder ditemukan!');
    console.log('\nPastikan template menggunakan format: {namaPlaceholder}');
    console.log('BUKAN format: ${namaPlaceholder}');
  } else {
    console.log(`✅ Ditemukan ${placeholders.size} placeholder:\n`);
    
    const sortedPlaceholders = Array.from(placeholders).sort();
    
    sortedPlaceholders.forEach((placeholder, index) => {
      console.log(`${index + 1}. {${placeholder}}`);
    });
    
    console.log('\n=== FIELD YANG PERLU ADA DI FORM ===\n');
    console.log('Tambahkan field berikut ke formData jika belum ada:\n');
    
    sortedPlaceholders.forEach(placeholder => {
      console.log(`  ${placeholder}: '',`);
    });
    
    console.log('\n=== TEMPLATE DATA UNTUK API ===\n');
    console.log('Tambahkan ke templateData di API route:\n');
    
    sortedPlaceholders.forEach(placeholder => {
      console.log(`  ${placeholder}: formData.${placeholder} || '',`);
    });
  }
  
  console.log('\n=== SELESAI ===\n');
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.log('\nPastikan file SKTM.docx ada di: public/template/SKTM.docx');
}
