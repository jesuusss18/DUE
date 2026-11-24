
const pool = require("../config/database");
const { randomUUID } = require("crypto");

// Get users with email reminders enabled
async function getUsersWithReminders() {
    const result = await pool.query(`
        SELECT
            id,
            name,
            email,
            TO_CHAR(reminder_time, 'HH24:MI') AS "reminderTime",
            timezone
        FROM users
        WHERE email_reminders = TRUE
    `);

    return result.rows;
}

// Get upcoming incomplete assignments
async function getUpcomingAssignments(userId, today) {
    const result = await pool.query(`
        SELECT
            id,
            title,
            course,
            TO_CHAR(due_date, 'YYYY-MM-DD') AS "dueDate",
            priority,
            completed
        FROM assignments
        WHERE user_id = $1
            AND completed = FALSE
            AND due_date > $2::date
        ORDER BY due_date ASC, title ASC
    `, [userId, today]);

    return result.rows;
}

// Get upcoming exams
async function getUpcomingExams(userId, today) {
    const result = await pool.query(`
        SELECT
            id,
            title,
            course,
            TO_CHAR(exam_date, 'YYYY-MM-DD') AS "examDate",
            location
        FROM exams
        WHERE user_id = $1
            AND exam_date > $2::date
        ORDER BY exam_date ASC, title ASC
    `, [userId, today]);

    return result.rows;
}

// Get the most recent reminder
async function getLastReminder(userId) {
    const result = await pool.query(`
        SELECT
            id,
            reminder_type AS "reminderType",
            TO_CHAR(
                notification_date,
                'YYYY-MM-DD'
            ) AS "notificationDate",
            TO_CHAR(
                next_activity_date,
                'YYYY-MM-DD'
            ) AS "nextActivityDate",
            sent_at AS "sentAt"
        FROM reminder_history
        WHERE user_id = $1
        ORDER BY notification_date DESC, sent_at DESC
        LIMIT 1
    `, [userId]);

    return result.rows[0] || null;
}

// Check whether a reminder was already sent today
async function hasReminderToday(userId, today) {
    const result = await pool.query(`
        SELECT EXISTS (
            SELECT 1
            FROM reminder_history
            WHERE user_id = $1
                AND notification_date = $2::date
        ) AS "alreadySent"
    `, [userId, today]);

    return result.rows[0].alreadySent;
}

// Save a successfully sent reminder
async function saveReminder({
    userId,
    reminderType,
    notificationDate,
    nextActivityDate = null
}) {
    const result = await pool.query(`
        INSERT INTO reminder_history (
            id,
            user_id,
            reminder_type,
            notification_date,
            next_activity_date
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, notification_date)
        DO NOTHING
        RETURNING id
    `, [
        randomUUID(),
        userId,
        reminderType,
        notificationDate,
        nextActivityDate
    ]);

    return result.rows[0] || null;
}

module.exports = {
    getUsersWithReminders,
    getUpcomingAssignments,
    getUpcomingExams,
    getLastReminder,
    hasReminderToday,
    saveReminder
};
