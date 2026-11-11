require("dotenv").config();

const pool = require("../src/config/database");

async function initializeDatabase() {
    try {
        // Create assignments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                id UUID PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                course VARCHAR(255) NOT NULL DEFAULT '',
                due_date DATE NOT NULL,
                priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
                completed BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        console.log("DUE database initialized successfully!");

    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exitCode = 1;

    await pool.query(`
        CREATE TABLE IF NOT EXISTS exams (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            course VARCHAR(255) NOT NULL DEFAULT '',
            exam_date DATE NOT NULL,
            location VARCHAR(255) NOT NULL DEFAULT '',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    console.log("Exams table ready.");

    } finally {
        await pool.end();
    }
}

initializeDatabase();
