const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database for seeding.');
});

const employees = [
    { name: 'Alice Smith', department: 'Engineering', manager: 'Bob Jones', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=alice' },
    { name: 'Bob Jones', department: 'Engineering', manager: 'Charlie Brown', join_date: '2022-05-20', avatar_url: 'https://i.pravatar.cc/150?u=bob' },
    { name: 'Charlie Brown', department: 'HR', manager: 'David White', join_date: '2021-11-01', avatar_url: 'https://i.pravatar.cc/150?u=charlie' },
    { name: 'David White', department: 'Marketing', manager: 'Eve Black', join_date: '2020-03-10', avatar_url: 'https://i.pravatar.cc/150?u=david' },
    { name: 'Eve Black', department: 'Sales', manager: 'Frank Green', join_date: '2019-07-25', avatar_url: 'https://i.pravatar.cc/150?u=eve' }
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

db.serialize(() => {
    // Clear existing data (optional, but good for seeding)
    // db.run("DELETE FROM employees");
    // db.run("DELETE FROM criteria");

    const stmtEmployee = db.prepare("INSERT INTO employees (name, department, manager, join_date, avatar_url) VALUES (?, ?, ?, ?, ?)");
    employees.forEach(emp => {
        stmtEmployee.run(emp.name, emp.department, emp.manager, emp.join_date, emp.avatar_url);
    });
    stmtEmployee.finalize();

    const stmtCriteria = db.prepare("INSERT INTO criteria (name, max_score, weight) VALUES (?, ?, ?)");
    criteria.forEach(crit => {
        stmtCriteria.run(crit.name, crit.max_score, crit.weight);
    });
    stmtCriteria.finalize();

    console.log('Database seeded successfully.');
});

db.close();
