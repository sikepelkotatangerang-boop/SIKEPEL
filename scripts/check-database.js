/**
 * Script untuk mengecek data di database
 * Run: node scripts/check-database.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkDatabase() {
    try {
        console.log('🔍 Checking database connection...\n');

        // Test connection
        const testResult = await pool.query('SELECT NOW()');
        console.log('✅ Database connected:', testResult.rows[0].now);
        console.log('');

        // Check document_archives table
        console.log('📊 Checking document_archives table...');
        const countResult = await pool.query('SELECT COUNT(*) as total FROM document_archives');
        console.log(`Total documents: ${countResult.rows[0].total}`);
        console.log('');

        // Check by status
        const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM document_archives 
      GROUP BY status
    `);
        console.log('Documents by status:');
        statusResult.rows.forEach(row => {
            console.log(`  - ${row.status}: ${row.count}`);
        });
        console.log('');

        // Check by jenis_dokumen
        const jenisResult = await pool.query(`
      SELECT jenis_dokumen, COUNT(*) as count 
      FROM document_archives 
      GROUP BY jenis_dokumen
      ORDER BY count DESC
    `);
        console.log('Documents by type:');
        jenisResult.rows.forEach(row => {
            console.log(`  - ${row.jenis_dokumen}: ${row.count}`);
        });
        console.log('');

        // Get recent documents
        const recentResult = await pool.query(`
      SELECT 
        id, nomor_surat, jenis_dokumen, nama_subjek, 
        status, created_at, file_name
      FROM document_archives 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
        console.log('Recent documents:');
        if (recentResult.rows.length === 0) {
            console.log('  ⚠️  No documents found!');
        } else {
            recentResult.rows.forEach(doc => {
                console.log(`  - [${doc.id}] ${doc.nomor_surat} - ${doc.nama_subjek} (${doc.jenis_dokumen})`);
                console.log(`    Status: ${doc.status}, Created: ${doc.created_at}`);
                console.log(`    File: ${doc.file_name || 'No file'}`);
            });
        }
        console.log('');

        // Check sktm_documents table
        console.log('📊 Checking sktm_documents table...');
        const sktmCountResult = await pool.query('SELECT COUNT(*) as total FROM sktm_documents');
        console.log(`Total SKTM documents: ${sktmCountResult.rows[0].total}`);
        console.log('');

        // Check if tables exist
        console.log('📋 Checking table structure...');
        const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('document_archives', 'sktm_documents', 'users', 'kelurahan', 'pejabat')
      ORDER BY table_name
    `);
        console.log('Existing tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        console.log('');

        // Check columns in document_archives
        console.log('📋 Columns in document_archives:');
        const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'document_archives'
      ORDER BY ordinal_position
    `);
        columnsResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkDatabase();
