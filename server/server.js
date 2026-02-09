const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                department TEXT,
                manager TEXT,
                join_date TEXT,
                avatar_url TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS criteria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                max_score INTEGER DEFAULT 5,
                weight INTEGER DEFAULT 1
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER,
                date TEXT,
                total_score REAL,
                notes TEXT,
                scores_json TEXT,
                FOREIGN KEY(employee_id) REFERENCES employees(id)
            )`);
        });
    }
});

// API Endpoints

// Get all employees
app.get('/api/employees', (req, res) => {
    const sql = "SELECT * FROM employees";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get single employee
app.get('/api/employees/:id', (req, res) => {
    const sql = "SELECT * FROM employees WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// Get all criteria
app.get('/api/criteria', (req, res) => {
    const sql = "SELECT * FROM criteria";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get evaluations for an employee
app.get('/api/evaluations/:employeeId', (req, res) => {
    const sql = "SELECT * FROM evaluations WHERE employee_id = ? ORDER BY date DESC";
    const params = [req.params.employeeId];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create a new evaluation
app.post('/api/evaluations', (req, res) => {
    const { employee_id, date, total_score, notes, scores_json } = req.body;
    const sql = 'INSERT INTO evaluations (employee_id, date, total_score, notes, scores_json) VALUES (?,?,?,?,?)';
    const params = [employee_id, date, total_score, notes, JSON.stringify(scores_json)];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": req.body,
            "id": this.lastID
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
