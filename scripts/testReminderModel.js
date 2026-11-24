
require("dotenv").config();

const pool = require("../src/config/database");

const Reminder = require("../src/models/reminderModel");

function getLocalDate(timezone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const year = parts.find(p => p.type === "year").value;
    const month = parts.find(p => p.type === "month").value;
    const day = parts.find(p => p.type === "day").value;

    return `${year}-${month}-${day}`;
}

async function testReminderModel() {
    try {
        const users = await Reminder.getUsersWithReminders();

        console.log("\nDUE Reminder Model Test");
        console.log("========================");
        console.log("Users with reminders enabled:", users.length);

        for (const user of users) {
            const today = getLocalDate(user.timezone);

            console.log("\nUser:", user.name);
            console.log("Reminder time:", user.reminderTime);
            console.log("Timezone:", user.timezone);
            console.log("Local date:", today);

            const assignments =
                await Reminder.getUpcomingAssignments(
                    user.id,
                    today
                );

            const exams =
                await Reminder.getUpcomingExams(
                    user.id,
                    today
                );

            const lastReminder =
                await Reminder.getLastReminder(user.id);

            const alreadySent =
                await Reminder.hasReminderToday(
                    user.id,
                    today
                );

            console.log("\nUpcoming assignments:");
            console.table(assignments);

            console.log("\nUpcoming exams:");
            console.table(exams);

            console.log("\nLast reminder:", lastReminder);
            console.log("Reminder sent today:", alreadySent);
        }

        console.log("\nReminder model test completed successfully.");

    } catch (error) {
        console.error("Test failed:", error.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

testReminderModel();
