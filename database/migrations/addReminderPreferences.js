require("dotenv").config();

const pool = require("../../src/config/database");

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS
                email_reminders BOOLEAN NOT NULL DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS
                reminder_time TIME NOT NULL DEFAULT '19:00:00',
            ADD COLUMN IF NOT EXISTS
                timezone VARCHAR(100) NOT NULL DEFAULT 'America/Chicago';
        `);

        console.log(
            "Reminder preferences migration completed successfully."
        );

    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

migrate();
