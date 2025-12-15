const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

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

async function runMigration() {
    console.log('🚀 Starting migration...\n');

    const client = new Client(config);

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const schemaPath = path.join(__dirname, '..', 'database', 'add_app_settings.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(schemaSql);

        console.log('✅ Migration completed successfully');

    } catch (error) {
        console.error('\n❌ Error running migration:', error.message);
        console.error('\nDetails:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
