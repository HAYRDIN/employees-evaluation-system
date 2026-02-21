require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
});

const checkEmployees = async () => {
    try {
        console.log("Checking employees table...");
        const res = await pool.query("SELECT id, name, role FROM employees");
        console.log("Total Employees found:", res.rowCount);
        console.log(res.rows);

        if (res.rowCount === 0) {
            console.log("DATABASE IS EMPTY! Need to run seed.");
        } else {
            // Check specific user
            const name = 'YIBELTAL';
            const user = res.rows.find(e => e.name === name);
            if (user) {
                console.log(`User '${name}' FOUND with ID:`, user.id);
            } else {
                console.log(`User '${name}' NOT FOUND.`);
                // Check for close matches
                res.rows.forEach(r => {
                    console.log(`Existing: '${r.name}' (Length: ${r.name.length})`);
                });
            }
        }

    } catch (err) {
        console.error("DB Check Error:", err);
    } finally {
        pool.end();
    }
};

checkEmployees();
