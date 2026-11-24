const pool = require("../config/database");

// Create a new user
async function createUser(user) {
    const result = await pool.query(
        `INSERT INTO users (id, name, email, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, created_at`,
        [
            user.id,
            user.name,
            user.email,
            user.passwordHash
        ]
    );

    return result.rows[0];
}

// Find a user by email
async function findUserByEmail(email) {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0] || null;
}

// Find a user by ID
async function findUserById(id) {
    const result = await pool.query(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

// Get reminder preferences
async function getReminderPreferences(userId) {
    const result = await pool.query(
        `SELECT
            email,
            email_reminders AS "emailReminders",
            TO_CHAR(reminder_time, 'HH24:MI') AS "reminderTime",
            timezone
         FROM users
         WHERE id = $1`,
        [userId]
    );

    return result.rows[0] || null;
}

// Update reminder preferences
async function updateReminderPreferences(userId, preferences) {
    const result = await pool.query(
        `UPDATE users
         SET email_reminders = $1,
             reminder_time = $2,
             timezone = $3
         WHERE id = $4
         RETURNING
             email,
             email_reminders AS "emailReminders",
             TO_CHAR(reminder_time, 'HH24:MI') AS "reminderTime",
             timezone`,
        [
            preferences.emailReminders,
            preferences.reminderTime,
            preferences.timezone,
            userId
        ]
    );

    return result.rows[0] || null;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getReminderPreferences,
    updateReminderPreferences
};
