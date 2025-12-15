/**
 * Script untuk test koneksi ke Neon Database
 * Usage: node scripts/test-neon-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

console.log('🔍 Testing Neon Database Connection...\n');

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL not found in .env.local');
  console.log('\n💡 Please add your Neon connection string to .env.local:');
  console.log('DATABASE_URL=postgresql://user:password@endpoint.aws.neon.tech/dbname?sslmode=require\n');
  process.exit(1);
}

// Mask password in connection string for display
const maskedConnectionString = connectionString.replace(
  /:([^@]+)@/,
  ':****@'
);
console.log('📡 Connection String:', maskedConnectionString);
console.log('');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  let client;
  
  try {
    console.log('⏳ Connecting to database...');
    client = await pool.connect();
    console.log('✅ Connection successful!\n');

    // Test query: Get PostgreSQL version
    console.log('📊 Running test queries...\n');
    
    const versionResult = await client.query('SELECT version()');
    console.log('🗄️  PostgreSQL Version:');
    console.log('   ', versionResult.rows[0].version.split(',')[0]);
    console.log('');

    // Test query: Get current database
    const dbResult = await client.query('SELECT current_database()');
    console.log('📁 Current Database:', dbResult.rows[0].current_database);
    console.log('');

    // Test query: List all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  No tables found. Run migration script first!');
      console.log('   💡 Import: database/migrate-to-neon.sql');
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    console.log('');

    // Test query: Count records in each table
    if (tablesResult.rows.length > 0) {
      console.log('📊 Record counts:');
      for (const row of tablesResult.rows) {
        const countResult = await client.query(
          `SELECT COUNT(*) FROM ${row.table_name}`
        );
        console.log(`   ${row.table_name}: ${countResult.rows[0].count} records`);
      }
      console.log('');
    }

    console.log('✅ All tests passed!');
    console.log('🎉 Your Neon database is ready to use!\n');

  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:', error.message);
    console.log('\n🔧 Troubleshooting:');
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('   • Check your internet connection');
      console.log('   • Verify the database hostname in DATABASE_URL');
    } else if (error.message.includes('password authentication failed')) {
      console.log('   • Check your database password in DATABASE_URL');
      console.log('   • Make sure there are no special characters that need encoding');
    } else if (error.message.includes('SSL')) {
      console.log('   • Make sure your connection string includes ?sslmode=require');
    } else if (error.message.includes('timeout')) {
      console.log('   • Your Neon database might be paused (free tier auto-pauses)');
      console.log('   • Try again in a few seconds to wake it up');
    }
    
    console.log('\n');
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection();
