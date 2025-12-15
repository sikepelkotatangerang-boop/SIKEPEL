
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function createAdmin() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking for existing admin user...');

        // Check if admin exists
        const checkRes = await client.query("SELECT * FROM users WHERE email = 'admin@cibodas.go.id'");

        if (checkRes.rows.length > 0) {
            console.log('✅ Admin user already exists.');
            return;
        }

        console.log('👤 Creating admin user...');

        // Hash for 'password123'
        const passwordHash = '$2b$10$NaNREkl.H2OSnz/J5vhLBuJSyEnD3klEaqFCdmz.gJvdrUO2fyncG';

        await client.query(`
      INSERT INTO users (email, password_hash, name, role, kelurahan_id)
      VALUES ($1, $2, $3, $4, $5)
    `, ['admin@cibodas.go.id', passwordHash, 'Admin Kecamatan', 'admin', null]);

        console.log('✅ Admin user created successfully!');
        console.log('   Email: admin@cibodas.go.id');
        console.log('   Password: password123');

    } catch (err) {
        console.error('❌ Failed to create admin:', err);
    } finally {
        client.release();
        pool.end();
    }
}

createAdmin();
