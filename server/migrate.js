require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        console.log('Migrating work_plans schema...');
        await pool.query('ALTER TABLE work_plans ALTER COLUMN target_value TYPE DECIMAL, ALTER COLUMN achieved_value TYPE DECIMAL');
        console.log('Schema updated successfully to DECIMAL.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

run();
