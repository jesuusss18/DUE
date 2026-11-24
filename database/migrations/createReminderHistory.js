
require("dotenv").config();

const pool = require("../../src/config/database");

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reminder_history (
                id UUID PRIMARY KEY,

                user_id UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                reminder_type VARCHAR(30) NOT NULL
                    CHECK (
                        reminder_type IN (
                            'daily',
                            'gap',
                            'all_caught_up'
                        )
                    ),

                notification_date DATE NOT NULL,

                next_activity_date DATE,

                sent_at TIMESTAMPTZ NOT NULL
                    DEFAULT NOW(),

                UNIQUE (user_id, notification_date)
            );

            CREATE INDEX IF NOT EXISTS
                idx_reminder_history_user
            ON reminder_history (
                user_id,
                notification_date DESC
            );
        `);

        console.log(
            "Reminder history table created successfully."
        );

    } catch (error) {
        console.error(
            "Migration failed:",
            error.message
        );

        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

migrate();

