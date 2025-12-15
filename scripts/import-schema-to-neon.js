/**
 * Script untuk import schema ke Neon Database
 * Usage: node scripts/import-schema-to-neon.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
const schemaFile = path.join(__dirname, '..', 'database', 'migrate-to-neon.sql');

console.log('🚀 Neon Database Schema Import\n');

// Validate environment
if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL not found in .env.local');
  console.log('\n💡 Please update your .env.local file with Neon connection string');
  console.log('See UPDATE_ENV.md for instructions\n');
  process.exit(1);
}

// Check if still using Supabase URL
if (connectionString.includes('supabase.co')) {
  console.error('❌ ERROR: You are still using Supabase connection string!');
  console.log('\n⚠️  Please update DATABASE_URL in .env.local to use Neon:');
  console.log('DATABASE_URL=postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  console.log('\n📖 See UPDATE_ENV.md for detailed instructions\n');
  process.exit(1);
}

// Check if schema file exists
if (!fs.existsSync(schemaFile)) {
  console.error('❌ ERROR: Schema file not found:', schemaFile);
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function importSchema() {
  let client;
  
  try {
    console.log('📡 Connecting to Neon database...');
    client = await pool.connect();
    console.log('✅ Connected!\n');

    // Read schema file
    console.log('📖 Reading schema file:', schemaFile);
    const schemaSql = fs.readFileSync(schemaFile, 'utf8');
    console.log('✅ Schema file loaded\n');

    // Execute schema
    console.log('⏳ Importing schema to Neon...');
    console.log('   This may take a few seconds...\n');
    
    await client.query(schemaSql);
    
    console.log('✅ Schema imported successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    console.log('');

    console.log('🎉 Migration completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: node scripts/test-neon-connection.js');
    console.log('   2. Run: npm run db:setup (to seed initial data)');
    console.log('   3. Run: npm run dev (to start the app)\n');

  } catch (error) {
    console.error('❌ Import failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some tables already exist.');
      console.log('💡 If you want to start fresh, drop all tables first or use a new database.\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('   • Check your internet connection');
      console.log('   • Verify DATABASE_URL in .env.local\n');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('   • Check your database password in DATABASE_URL');
      console.log('   • Make sure the connection string is correct\n');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

importSchema();
