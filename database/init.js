
require("dotenv").config();

const pool = require("../src/config/database");

async function initializeDatabase() {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email_reminders BOOLEAN NOT NULL DEFAULT FALSE,
                reminder_time TIME NOT NULL DEFAULT '19:00:00',
                timezone VARCHAR(100) NOT NULL DEFAULT 'America/Chicago',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create assignments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                course VARCHAR(255) NOT NULL DEFAULT '',
                due_date DATE NOT NULL,
                priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
                completed BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reminder_history (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                reminder_type VARCHAR(30) NOT NULL CHECK (
                    reminder_type IN ('daily', 'gap', 'all_caught_up')
                ),
                notification_date DATE NOT NULL,
                next_activity_date DATE,
                sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (user_id, notification_date)
            );
        `);

        // Create exams table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                course VARCHAR(255) NOT NULL DEFAULT '',
                exam_date DATE NOT NULL,
                location VARCHAR(255) NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_assignments_user_id
            ON assignments(user_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_exams_user_date
            ON exams(user_id, exam_date);
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
