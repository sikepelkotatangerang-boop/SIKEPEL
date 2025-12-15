/**
 * Script untuk insert data pejabat ke database
 * Usage: node scripts/seed-pejabat.js
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

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

async function seedPejabat() {
  console.log('🚀 Seeding data pejabat...\n');

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if pejabat data already exists
    const checkResult = await client.query('SELECT COUNT(*) as count FROM pejabat');
    const existingCount = parseInt(checkResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing pejabat records`);
      console.log('Do you want to delete existing data and re-seed? (This will delete all pejabat data)');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      
      // Wait 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('Deleting existing pejabat data...');
      await client.query('DELETE FROM pejabat');
      console.log('✅ Existing data deleted\n');
    }

    // Insert pejabat data
    console.log('📝 Inserting pejabat data...');
    
    const insertQuery = `
      INSERT INTO pejabat (kelurahan_id, nama, nip, jabatan, is_active) VALUES
      -- Kelurahan Cibodas
      (1, 'Drs. H. Ahmad Suryadi, M.Si', '196501011990031001', 'Lurah Cibodas', TRUE),
      (1, 'Hj. Siti Aminah, S.Sos', '197203151995032002', 'Sekretaris Lurah Cibodas', FALSE),
      
      -- Kelurahan Cibodas Baru
      (2, 'H. Bambang Hermanto, S.Sos', '196702121991031002', 'Lurah Cibodas Baru', TRUE),
      (2, 'Drs. Agus Salim', '197104201994031003', 'Sekretaris Lurah Cibodas Baru', FALSE),
      
      -- Kelurahan Panunggangan Barat
      (3, 'Dra. Hj. Siti Maryam, M.M', '196803151992032001', 'Lurah Panunggangan Barat', TRUE),
      (3, 'H. Dedi Supriadi, S.IP', '197305101995031004', 'Sekretaris Lurah Panunggangan Barat', FALSE),
      
      -- Kelurahan Cibodasari
      (4, 'H. Yusuf Hidayat, S.IP', '196904201993031003', 'Lurah Cibodasari', TRUE),
      (4, 'Hj. Rina Marlina, S.Sos', '197406151996032003', 'Sekretaris Lurah Cibodasari', FALSE),
      
      -- Kelurahan Uwung Jaya
      (5, 'Drs. H. Rahmat Hidayat', '197005101994031001', 'Lurah Uwung Jaya', TRUE),
      (5, 'H. Budi Santoso, S.AP', '197507201997031005', 'Sekretaris Lurah Uwung Jaya', FALSE),
      
      -- Kelurahan Jatiuwung
      (6, 'Hj. Nurhayati, S.Sos, M.Si', '197106151995032001', 'Lurah Jatiuwung', TRUE),
      (6, 'Drs. Andi Wijaya', '197608251998031006', 'Sekretaris Lurah Jatiuwung', FALSE)
    `;

    await client.query(insertQuery);
    console.log('✅ Pejabat data inserted successfully\n');

    // Verify data
    console.log('📊 Verifying data...\n');
    
    const verifyResult = await client.query(`
      SELECT 
        k.nama as kelurahan,
        p.nama as nama_pejabat,
        p.jabatan,
        p.is_active
      FROM pejabat p
      JOIN kelurahan k ON p.kelurahan_id = k.id
      ORDER BY k.id, p.is_active DESC
    `);

    console.log('Data Pejabat yang berhasil di-insert:');
    console.log('='.repeat(80));
    
    let currentKelurahan = '';
    verifyResult.rows.forEach((row) => {
      if (row.kelurahan !== currentKelurahan) {
        currentKelurahan = row.kelurahan;
        console.log(`\n📍 ${row.kelurahan.toUpperCase()}`);
      }
      const status = row.is_active ? '✅ AKTIF' : '⏸️  Non-aktif';
      console.log(`   ${status} - ${row.nama_pejabat} (${row.jabatan})`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✨ Total: ${verifyResult.rows.length} pejabat berhasil di-insert\n`);

    // Show active pejabat summary
    const activeResult = await client.query(`
      SELECT k.nama as kelurahan, p.nama as nama_pejabat, p.jabatan
      FROM pejabat p
      JOIN kelurahan k ON p.kelurahan_id = k.id
      WHERE p.is_active = TRUE
      ORDER BY k.id
    `);

    console.log('📋 Pejabat Aktif (yang akan muncul di form):');
    console.log('='.repeat(80));
    activeResult.rows.forEach((row) => {
      console.log(`   • ${row.kelurahan}: ${row.nama_pejabat} (${row.jabatan})`);
    });
    console.log('='.repeat(80));

    console.log('\n🎉 Seeding pejabat completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error seeding pejabat:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedPejabat();
