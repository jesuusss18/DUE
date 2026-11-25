jest.mock("dotenv", () => ({ config: jest.fn() }));

jest.mock("../src/config/database", () =>
    require("../tests/testDatabase")
);

const { randomUUID } = require("crypto");
const pool = require("../src/config/database");
const Reminder = require("../src/models/reminderModel");

const userId = randomUUID();
const otherId = randomUUID();
const today = "2026-11-24";

beforeAll(async () => {
    await pool.query(`
        INSERT INTO users
        (id, name, email, password_hash, email_reminders)
        VALUES
        ($1, 'Student', 'student@example.com', 'test', TRUE),
        ($2, 'Other', 'other@example.com', 'test', FALSE)
    `, [userId, otherId]);

    const assignments = [
        [userId, "Upcoming task", "2026-11-25", false],
        [userId, "Completed task", "2026-11-25", true],
        [userId, "Overdue task", "2026-11-20", false],
        [otherId, "Other user's task", "2026-11-25", false]
    ];

    for (const [owner, title, date, completed] of assignments) {
        await pool.query(`
            INSERT INTO assignments
            (id, user_id, title, due_date, completed)
            VALUES ($1, $2, $3, $4, $5)
        `, [randomUUID(), owner, title, date, completed]);
    }

    const exams = [
        [userId, "Upcoming exam", "2026-11-25"],
        [userId, "Past exam", "2026-11-20"],
        [otherId, "Other user's exam", "2026-11-25"]
    ];

    for (const [owner, title, date] of exams) {
        await pool.query(`
            INSERT INTO exams
            (id, user_id, title, exam_date)
            VALUES ($1, $2, $3, $4)
        `, [randomUUID(), owner, title, date]);
    }
});

afterAll(async () => {
    await pool.end();
});

test("Only selects users with reminders enabled", async () => {
    const users = await Reminder.getUsersWithReminders();

    expect(users.map(user => user.id)).toEqual([userId]);
});

test("Only selects upcoming incomplete assignments for the user", async () => {
    const assignments = await Reminder.getUpcomingAssignments(
        userId, today
    );

    expect(assignments.map(task => task.title))
        .toEqual(["Upcoming task"]);
});

test("Only selects upcoming exams for the user", async () => {
    const exams = await Reminder.getUpcomingExams(userId, today);

    expect(exams.map(exam => exam.title))
        .toEqual(["Upcoming exam"]);
});

test("Saves reminder history and prevents duplicate records", async () => {
    const reminder = {
        userId,
        reminderType: "daily",
        notificationDate: today,
        nextActivityDate: "2026-11-25"
    };

    expect(await Reminder.hasReminderToday(userId, today))
        .toBe(false);

    await Reminder.saveReminder(reminder);

    expect(await Reminder.hasReminderToday(userId, today))
        .toBe(true);

    expect(await Reminder.getLastReminder(userId))
        .toEqual(expect.objectContaining({
            reminderType: "daily",
            notificationDate: today,
            nextActivityDate: "2026-11-25"
        }));

    await Reminder.saveReminder(reminder);

    const result = await pool.query(`
        SELECT id
        FROM reminder_history
        WHERE user_id = $1
            AND notification_date = $2::date
    `, [userId, today]);

    expect(result.rows).toHaveLength(1);

    expect(await Reminder.hasReminderToday(otherId, today))
        .toBe(false);
});