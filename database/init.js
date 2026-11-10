
require("dotenv").config();

const pool = require("../src/config/database");

async function initializeDatabase() {
    try {
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

        console.log("DUE database initialized successfully!");
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

initializeDatabase();
