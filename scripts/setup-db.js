/**
 * Script untuk setup database PostgreSQL
 * 
 * Usage:
 * node scripts/setup-db.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL not found in .env.local');
  console.log('\n💡 Please add DATABASE_URL to .env.local\n');
  process.exit(1);
}

const config = {
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  // Connect to PostgreSQL
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if tables already exist
    const tablesCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'kelurahan'
    `);

    const tablesExist = parseInt(tablesCheck.rows[0].count) > 0;

    if (!tablesExist) {
      // Read and execute schema.sql
      console.log('\n📋 Creating tables...');
      const schemaPath = path.join(__dirname, '..', 'database', 'migrate-to-neon.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ Tables created successfully');
    } else {
      console.log('\n✓ Tables already exist, skipping schema creation');
    }

    // Check if data already exists
    const dataCheck = await client.query('SELECT COUNT(*) as count FROM kelurahan');
    const hasData = parseInt(dataCheck.rows[0].count) > 0;

    if (!hasData) {
      // Read and execute seed.sql
      console.log('\n🌱 Seeding data...');
      const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('✅ Data seeded successfully');
    } else {
      console.log('\n✓ Data already exists, skipping seed');
    }

    // Verify data
    console.log('\n📊 Verifying data...');
    const kelurahanCount = await client.query('SELECT COUNT(*) FROM kelurahan');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const documentsCount = await client.query('SELECT COUNT(*) FROM documents');

    console.log(`   - Kelurahan: ${kelurahanCount.rows[0].count} records`);
    console.log(`   - Users: ${usersCount.rows[0].count} records`);
    console.log(`   - Documents: ${documentsCount.rows[0].count} records`);

    console.log('\n✨ Database setup completed successfully!\n');
    console.log('📝 Default login credentials:');
    console.log('   Email: admin@cibodas.go.id');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run setup
setupDatabase();
