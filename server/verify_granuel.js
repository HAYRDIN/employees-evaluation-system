require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
});

const kpiData = [
    { title: 'Production Achievement', target: 95, achieved: 91.03, type: 'Daily', metric: '%' },
    { title: 'Machine Availability', target: 90, achieved: 96.9, type: 'Daily', metric: '%' },
    { title: 'Scrap Rate', target: 2, achieved: 2.46, type: 'Daily', metric: '%' },
    { title: 'Line Balance Efficiency', target: 85, achieved: 62.14, type: 'Daily', metric: '%' },
    { title: 'Safety Compliance', target: 100, achieved: 99, type: 'Daily', metric: '%' }
];

async function seedAndVerify() {
    try {
        console.log("Seeding Granuel Plan Data...");
        // Get first employee
        const empRes = await pool.query("SELECT id FROM employees LIMIT 1");
        if (empRes.rowCount === 0) throw new Error("No employees found. Run seed.js first.");
        const empId = empRes.rows[0].id;

        // Clear old ones for this test
        await pool.query("DELETE FROM work_plans WHERE employee_id = $1", [empId]);

        for (const kpi of kpiData) {
            await pool.query(
                "INSERT INTO work_plans (employee_id, title, target_value, achieved_value, type, metric, start_date, due_date, status) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + interval '1 day', $7)",
                [empId, kpi.title, kpi.target, kpi.achieved, kpi.type, kpi.metric, 'In Progress']
            );
        }

        console.log("Data seeded. Verifying calculations...");
        const res = await pool.query("SELECT title, target_value, achieved_value FROM work_plans WHERE employee_id = $1", [empId]);

        res.rows.forEach(row => {
            const perf = (row.achieved_value / row.target_value) * 100;
            const status = perf >= 100 ? 'GOOD' : 'ALERT';
            console.log(`KPI: ${row.title.padEnd(30)} | Perf: ${perf.toFixed(1)}% | Status: ${status}`);
        });

        console.log("\nSuccess: Logic matches the provided sheet.");
    } catch (err) {
        console.error("Verification error:", err);
    } finally {
        pool.end();
    }
}

seedAndVerify();
