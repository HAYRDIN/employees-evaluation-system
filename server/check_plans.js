require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkPlans() {
    try {
        const result = await pool.query("SELECT * FROM work_plans");
        console.log("Current Work Plans:");
        console.log(JSON.stringify(result.rows, null, 2));

        const employees = await pool.query("SELECT id, name FROM employees");
        console.log("Employees:");
        console.log(JSON.stringify(employees.rows, null, 2));
    } catch (err) {
        console.error("Error checking plans:", err);
    } finally {
        await pool.end();
    }
}

checkPlans();
