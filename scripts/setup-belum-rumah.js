/**
 * Script untuk setup tabel dan seed data Surat Keterangan Belum Memiliki Rumah
 * Usage: node scripts/setup-belum-rumah.js
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL not found in .env.local');
  process.exit(1);
}

const config = {
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function setupBelumRumah() {
  console.log('🚀 Setting up Surat Keterangan Belum Memiliki Rumah...\n');

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Run migration (create table)
    console.log('📋 Creating table belum_rumah_documents...');
    const migrationPath = path.join(__dirname, '..', 'database', 'migration_belum_rumah_documents.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);
    console.log('✅ Table created successfully\n');

    // 2. Check if data already exists
    const checkResult = await client.query('SELECT COUNT(*) as count FROM belum_rumah_documents');
    const existingCount = parseInt(checkResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing records`);
      console.log('Skipping seed data insertion...\n');
    } else {
      // 3. Run seed data
      console.log('🌱 Inserting mock data...');
      const seedPath = path.join(__dirname, '..', 'database', 'seed_belum_rumah.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('✅ Mock data inserted successfully\n');
    }

    // 4. Verify and show summary
    console.log('📊 Database Summary:\n');
    console.log('='.repeat(80));

    // Total records
    const totalResult = await client.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT kelurahan) as total_kelurahan,
        MIN(tanggal_surat) as tanggal_awal,
        MAX(tanggal_surat) as tanggal_akhir
      FROM belum_rumah_documents
    `);

    const summary = totalResult.rows[0];
    console.log(`📄 Total Surat: ${summary.total_records}`);
    console.log(`🏢 Total Kelurahan: ${summary.total_kelurahan}`);
    console.log(`📅 Periode: ${new Date(summary.tanggal_awal).toLocaleDateString('id-ID')} - ${new Date(summary.tanggal_akhir).toLocaleDateString('id-ID')}`);
    console.log('='.repeat(80));

    // By kelurahan
    console.log('\n📍 Breakdown per Kelurahan:\n');
    const kelurahanResult = await client.query(`
      SELECT 
        kelurahan,
        COUNT(*) as jumlah_surat
      FROM belum_rumah_documents
      GROUP BY kelurahan
      ORDER BY kelurahan
    `);

    kelurahanResult.rows.forEach((row) => {
      console.log(`   • ${row.kelurahan.padEnd(25)} : ${row.jumlah_surat} surat`);
    });

    // By purpose
    console.log('\n🎯 Breakdown per Keperluan:\n');
    const purposeResult = await client.query(`
      SELECT 
        peruntukan,
        COUNT(*) as jumlah
      FROM belum_rumah_documents
      GROUP BY peruntukan
      ORDER BY jumlah DESC
      LIMIT 5
    `);

    purposeResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.peruntukan}`);
      console.log(`      (${row.jumlah} surat)\n`);
    });

    // Sample data
    console.log('📋 Sample Data (5 records):\n');
    console.log('='.repeat(80));
    const sampleResult = await client.query(`
      SELECT 
        nomor_surat,
        nama_pemohon,
        kelurahan,
        peruntukan,
        TO_CHAR(tanggal_surat, 'DD/MM/YYYY') as tanggal
      FROM belum_rumah_documents
      ORDER BY tanggal_surat DESC
      LIMIT 5
    `);

    sampleResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.nomor_surat}`);
      console.log(`   Nama      : ${row.nama_pemohon}`);
      console.log(`   Kelurahan : ${row.kelurahan}`);
      console.log(`   Tanggal   : ${row.tanggal}`);
      console.log(`   Keperluan : ${row.peruntukan}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n✨ Setup completed successfully!\n');

    console.log('💡 Next Steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Access form: http://localhost:3000/form-surat/belum-rumah');
    console.log('   3. View documents: http://localhost:3000/daftar-surat\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupBelumRumah();
