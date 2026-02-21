require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Database Setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
});

// Initialize Database Tables
const initDb = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            department VARCHAR(255),
            manager VARCHAR(255),
            join_date DATE,
            avatar_url TEXT,
            role VARCHAR(50) DEFAULT 'employee',
            password VARCHAR(255) DEFAULT 'password123'
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS criteria (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            max_score INTEGER DEFAULT 5,
            weight INTEGER DEFAULT 1
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS evaluations (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id),
            date TIMESTAMP,
            total_score DECIMAL,
            notes TEXT,
            scores_json TEXT
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS work_plans (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id),
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50),
            target_value DECIMAL,
            metric VARCHAR(50),
            achieved_value DECIMAL DEFAULT 0,
            start_date DATE,
            due_date DATE,
            status VARCHAR(50) DEFAULT 'Pending'
        )`);

        console.log('Database tables initialized.');
    } catch (err) {
        console.error('Error initializing database tables:', err);
    }
};

initDb();

// Login Endpoint
app.post('/api/login', async (req, res) => {
    console.log('Login attempt for:', req.body);
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ "error": "Name is required" });
    }
    try {
        const result = await pool.query("SELECT * FROM employees WHERE name = $1", [name]);
        if (result.rows.length > 0) {
            console.log('Login success:', name);
            res.json({
                "message": "success",
                "data": result.rows[0]
            });
        } else {
            console.log('Login fail: Name not found', name);
            res.status(401).json({ "error": "LOGIN_FAIL_UID_999" });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ "error": "LOGIN_ERROR_SERVER_EXCEPTION" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// API Endpoints

// Get all employees
app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM employees");
        res.json({
            "message": "success",
            "data": result.rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get single employee
app.get('/api/employees/:id', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM employees WHERE id = $1", [req.params.id]);
        res.json({
            "message": "success",
            "data": result.rows[0]
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get all criteria
app.get('/api/criteria', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM criteria");
        res.json({
            "message": "success",
            "data": result.rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get all evaluations (global)
app.get('/api/evaluations', async (req, res) => {
    try {
        const result = await pool.query("SELECT e.*, emp.name as employee_name, emp.department FROM evaluations e JOIN employees emp ON e.employee_id = emp.id ORDER BY e.date DESC");
        res.json({
            "message": "success",
            "data": result.rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get evaluations for an employee
app.get('/api/evaluations/:employeeId', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM evaluations WHERE employee_id = $1 ORDER BY date DESC", [req.params.employeeId]);
        res.json({
            "message": "success",
            "data": result.rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Create a new evaluation
app.post('/api/evaluations', async (req, res) => {
    const { employee_id, date, total_score, notes, scores_json } = req.body;
    const sql = 'INSERT INTO evaluations (employee_id, date, total_score, notes, scores_json) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const params = [employee_id, date, total_score, notes, JSON.stringify(scores_json)];

    try {
        const result = await pool.query(sql, params);
        res.json({
            "message": "success",
            "data": req.body,
            "id": result.rows[0].id
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// --- WORK PLANNING & AUTO-EVALUATION APIs ---

// Create a Plan
app.post('/api/plans', async (req, res) => {
    const { employee_id, title, type, target_value, metric, start_date, due_date } = req.body;
    const sql = `INSERT INTO work_plans (employee_id, title, type, target_value, metric, achieved_value, start_date, due_date, status) 
                 VALUES ($1, $2, $3, $4, $5, 0, $6, $7, 'Pending') RETURNING *`;

    try {
        const result = await pool.query(sql, [employee_id, title, type, target_value, metric, start_date, due_date]);
        res.json({ "message": "success", "data": result.rows[0] });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get Plans (Optional filter by employee_id)
app.get('/api/plans', async (req, res) => {
    const { employee_id } = req.query;
    let sql = "SELECT * FROM work_plans ORDER BY due_date ASC";
    let params = [];

    if (employee_id) {
        sql = "SELECT * FROM work_plans WHERE employee_id = $1 ORDER BY due_date ASC";
        params = [employee_id];
    }

    try {
        const result = await pool.query(sql, params);
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update Plan Progress
app.put('/api/plans/:id', async (req, res) => {
    const { achieved_value, status } = req.body;
    const sql = "UPDATE work_plans SET achieved_value = $1, status = $2 WHERE id = $3 RETURNING *";

    try {
        const result = await pool.query(sql, [achieved_value, status, req.params.id]);
        res.json({ "message": "success", "data": result.rows[0] });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Auto-Evaluate based on Plans
app.post('/api/auto-evaluate', async (req, res) => {
    const { employee_id } = req.body;

    try {
        // 1. Fetch all completed/in-progress plans for employee
        const planRes = await pool.query("SELECT * FROM work_plans WHERE employee_id = $1", [employee_id]);
        const plans = planRes.rows;

        if (plans.length === 0) {
            return res.status(400).json({ "error": "No plans found for this employee to evaluate." });
        }

        // 2. Calculate average completion rate
        let totalEfficiency = 0;
        plans.forEach(plan => {
            let efficiency = (plan.achieved_value / plan.target_value) * 100;
            // For the sheet logic, we don't cap at 100 for the status, 
            // but for evaluation scoring we should cap to avoid extreme outliers
            let scoringEfficiency = efficiency > 120 ? 120 : efficiency;
            totalEfficiency += scoringEfficiency;
        });

        const avgScore = totalEfficiency / plans.length;

        // 3. Create Evaluation Record
        // We map this score to specific criteria (Productivity/Quality) and keep others average or manual.
        // For simplicity, we'll apply this score to "Productivity" and "Quality of Work" and "Reliability".

        // Fetch criteria to build the JSON
        const critRes = await pool.query("SELECT * FROM criteria");
        const criteriaList = critRes.rows;

        let scores = {};
        let weightedSum = 0;
        let totalWeight = 0;

        criteriaList.forEach(crit => {
            let itemScore = 3; // Default 'Average' for soft skills

            if (['Productivity', 'Quality of Work', 'Reliability'].includes(crit.name)) {
                // Map 0-100% to 1-5 Scale
                // 100% = 5, 80% = 4, 60% = 3, 40% = 2, <40% = 1
                if (avgScore >= 90) itemScore = 5;
                else if (avgScore >= 75) itemScore = 4;
                else if (avgScore >= 50) itemScore = 3;
                else if (avgScore >= 30) itemScore = 2;
                else itemScore = 1;
            }

            scores[crit.id] = itemScore;
            weightedSum += itemScore * crit.weight;
            totalWeight += crit.weight;
        });

        // Calculate final total score out of 100
        // (weightedSum / (totalWeight * 5)) * 100
        const finalTotalScore = (weightedSum / (totalWeight * 5)) * 100;

        // Insert into Evaluations
        const insertSql = 'INSERT INTO evaluations (employee_id, date, total_score, notes, scores_json) VALUES ($1, NOW(), $2, $3, $4) RETURNING id';
        const notes = `Auto-Generated based on ${plans.length} work plans. Avg Plan Completion: ${avgScore.toFixed(1)}%`;

        const insertResult = await pool.query(insertSql, [employee_id, finalTotalScore, notes, JSON.stringify(scores)]);

        res.json({
            "message": "success",
            "data": {
                id: insertResult.rows[0].id,
                total_score: finalTotalScore,
                avg_plan_completion: avgScore
            }
        });

    } catch (err) {
        console.error("Auto Check Error:", err);
        res.status(500).json({ "error": err.message });
    }
});

// All other GET requests not handled before will return the React app
app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
