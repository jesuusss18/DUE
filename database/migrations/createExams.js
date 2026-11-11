require("dotenv").config();

const pool = require("../../src/config/database");

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id)
                    ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                course VARCHAR(255) NOT NULL DEFAULT '',
                exam_date DATE NOT NULL,
                location VARCHAR(255) NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_exams_user_date
            ON exams(user_id, exam_date);
        `);

        console.log("Exams migration completed successfully.");
    } catch (error) {
        console.error("Exams migration failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
