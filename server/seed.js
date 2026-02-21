require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
});

const employees = [
    { name: 'YIBELTAL', department: 'MANAGEMENT', manager: 'Company', join_date: '2022-01-01', avatar_url: 'https://i.pravatar.cc/150?u=yibeltal', role: 'manager', password: '' },
    { name: 'ABEEB KEBEDE', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=abeeb', role: 'employee', password: '' },
    { name: 'FANUAEL GIZAW', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=fanuael', role: 'employee', password: '' },
    { name: 'BEREKET CHALE', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2022-01-15', avatar_url: 'https://i.pravatar.cc/150?u=bereket', role: 'employee', password: '' },
    { name: 'ISMAEL KASIM', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=ismael', role: 'employee', password: '' },
    { name: 'HABTAMU ENDASHAW', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=habtamu', role: 'employee', password: '' },
    { name: 'SEWENET AYALEW', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=sewenet', role: 'employee', password: '' },
    { name: 'ABREHAM AMARE', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=abreham', role: 'employee', password: '' },
    { name: 'SIRAJ KHELIL', department: 'OPERATOR', manager: 'YIBELTAL', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=siraj', role: 'employee', password: '' }
];

const criteria = [
    { name: 'Quality of Work', max_score: 5, weight: 1 },
    { name: 'Productivity', max_score: 5, weight: 1 },
    { name: 'Communication', max_score: 5, weight: 1 },
    { name: 'Teamwork', max_score: 5, weight: 1 },
    { name: 'Problem Solving', max_score: 5, weight: 1 },
    { name: 'Initiative', max_score: 5, weight: 1 },
    { name: 'Reliability', max_score: 5, weight: 1 },
    { name: 'Adaptability', max_score: 5, weight: 1 },
    { name: 'Technical Skills', max_score: 5, weight: 1 },
    { name: 'Leadership', max_score: 5, weight: 1 }
];

const seed = async () => {
    try {
        console.log('Initializing tables for seeding...');
        // Drop and Recreate for schema sync
        await pool.query("DROP TABLE IF EXISTS work_plans CASCADE");
        await pool.query("DROP TABLE IF EXISTS evaluations CASCADE");
        await pool.query("DROP TABLE IF EXISTS employees CASCADE");
        await pool.query("DROP TABLE IF EXISTS criteria CASCADE");

        await pool.query(`CREATE TABLE employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            department VARCHAR(255),
            manager VARCHAR(255),
            join_date DATE,
            avatar_url TEXT,
            role VARCHAR(50) DEFAULT 'employee',
            password VARCHAR(255) DEFAULT 'password123'
        )`);

        await pool.query(`CREATE TABLE criteria (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            max_score INTEGER DEFAULT 5,
            weight INTEGER DEFAULT 1
        )`);

        await pool.query(`CREATE TABLE evaluations (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id),
            date TIMESTAMP,
            total_score DECIMAL,
            notes TEXT,
            scores_json TEXT
        )`);

        await pool.query(`CREATE TABLE work_plans (
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

        // Seed Employees
        for (const emp of employees) {
            await pool.query(
                "INSERT INTO employees (name, department, manager, join_date, avatar_url, role, password) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [emp.name, emp.department, emp.manager, emp.join_date, emp.avatar_url, emp.role, emp.password]
            );
        }

        // Seed Criteria
        for (const crit of criteria) {
            await pool.query(
                "INSERT INTO criteria (name, max_score, weight) VALUES ($1, $2, $3)",
                [crit.name, crit.max_score, crit.weight]
            );
        }

        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        pool.end();
    }
};

seed();
