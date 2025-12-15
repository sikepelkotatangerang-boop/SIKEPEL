/**
 * Script untuk menjalankan migrasi tabel document_archives (universal documents)
 * 
 * Usage:
 *   node scripts/migrate-universal-documents.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migration_universal_documents.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    console.log('🚀 Running migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully!');

    // Verify table created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'document_archives'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Table "document_archives" verified');
      
      // Show table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'document_archives'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📊 Table Structure:');
      console.log('─'.repeat(70));
      console.log('Column Name'.padEnd(30), 'Data Type'.padEnd(20), 'Nullable');
      console.log('─'.repeat(70));
      columns.rows.forEach(col => {
        console.log(
          col.column_name.padEnd(30),
          col.data_type.padEnd(20),
          col.is_nullable
        );
      });
      console.log('─'.repeat(70));

      // Check migrated data
      const countResult = await client.query('SELECT COUNT(*) as count FROM document_archives');
      console.log(`\n📈 Total documents in archive: ${countResult.rows[0].count}`);
    } else {
      console.log('⚠️  Warning: Table "document_archives" not found after migration');
    }

    client.release();
    await pool.end();
    
    console.log('\n✨ Migration process completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error);
    console.error('Error details:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Run migration
console.log('═'.repeat(70));
console.log('  Universal Documents Table Migration');
console.log('═'.repeat(70));
console.log('');

runMigration();
