const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function migrateSecret() {
    const secret = process.env.CONVERTAPI_SECRET;

    if (!secret) {
        console.log('❌ No CONVERTAPI_SECRET found in .env.local');
        return;
    }

    console.log('Found secret in .env.local, migrating to database...');

    await client.connect();
    try {
        const query = `
      INSERT INTO app_settings (setting_key, setting_value, description, updated_at)
      VALUES ($1, $2, 'Secret key for ConvertAPI', CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
    `;

        await client.query(query, ['CONVERTAPI_SECRET', secret]);
        console.log('✅ CONVERTAPI_SECRET successfully migrated to database!');

    } catch (e) {
        console.error('Error migrating secret:', e);
    } finally {
        await client.end();
    }
}

migrateSecret();
