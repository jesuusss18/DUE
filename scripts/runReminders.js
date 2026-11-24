require("dotenv").config();

const pool = require("../src/config/database");
const Reminder = require("../src/models/reminderModel");
const { processReminder } = require("../src/services/reminderService");
const { getLocalDateTime } = require("../src/utils/reminderLogic");

async function runReminders() {
    try {
        const users = await Reminder.getUsersWithReminders();

        for (const user of users) {
            try {
                const local = getLocalDateTime(user.timezone);

                if (local.time >= user.reminderTime) {
                    await processReminder(user);
                }
            } catch (error) {
                console.error("Reminder failed:", error.message);
                process.exitCode = 1;
            }
        }
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

runReminders();