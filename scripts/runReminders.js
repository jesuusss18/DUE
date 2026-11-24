require("dotenv").config();

const pool = require("../src/config/database");
const Reminder = require("../src/models/reminderModel");
const { processReminder } = require("../src/services/reminderService");
const { getLocalDateTime } = require("../src/utils/reminderLogic");

async function runReminders() {
    try {
        if (!process.env.TEST_EMAIL) {
            throw new Error("TEST_EMAIL is missing.");
        }

        const users = await Reminder.getUsersWithReminders();

        for (const user of users) {
            if (user.email !== process.env.TEST_EMAIL) continue;

            const local = getLocalDateTime(user.timezone);

            if (local.time >= user.reminderTime) {
                await processReminder(user);
            } else {
                console.log("Waiting for scheduled time.");
            }
        }

    } catch (error) {
        console.error("Reminder failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

runReminders();