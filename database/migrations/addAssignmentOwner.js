
require("dotenv").config();

const pool = require("../../src/config/database");

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE assignments
            ADD COLUMN IF NOT EXISTS user_id UUID
            REFERENCES users(id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_assignments_user_id
            ON assignments(user_id);
        `);

        const result = await pool.query(`
            SELECT COUNT(*)::int AS count
            FROM assignments
            WHERE user_id IS NULL;
        `);

        console.log("Migration completed successfully.");
        console.log(
            "Assignments without an owner:",
            result.rows[0].count
        );

    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
