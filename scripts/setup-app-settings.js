
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function setupAppSettings() {
    const client = await pool.connect();
    try {
        console.log('🚀 Setting up app_settings table...');

        const sqlPath = path.join(__dirname, '..', 'database', 'create_app_settings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('✅ app_settings table created/verified.');

        // Now verify we can insert
        const insertSqlPath = path.join(__dirname, '..', 'database', 'add_app_settings.sql');
        if (fs.existsSync(insertSqlPath)) {
            console.log('📝 Inserting initial settings...');
            const insertSql = fs.readFileSync(insertSqlPath, 'utf8');
            await client.query(insertSql);
            console.log('✅ Initial settings inserted.');
        }

    } catch (err) {
        console.error('❌ Failed to setup app_settings:', err);
    } finally {
        client.release();
        pool.end();
    }
}

setupAppSettings();
