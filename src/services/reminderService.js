const Reminder = require("../models/reminderModel");
const { sendEmail } = require("./emailService");
const { createReminderEmail } = require("../templates/reminderEmail");
const { getLocalDateTime, getReminderDecision } = require("../utils/reminderLogic");

async function processReminder(user) {
    const today = getLocalDateTime(user.timezone).date;

    const assignments = await Reminder.getUpcomingAssignments(user.id, today);
    const exams = await Reminder.getUpcomingExams(user.id, today);
    const lastReminder = await Reminder.getLastReminder(user.id);
    const alreadySent = await Reminder.hasReminderToday(user.id, today);

    const decision = getReminderDecision({
        today,
        assignments,
        exams,
        lastReminder,
        alreadySent
    });

    if (!decision.shouldSend) {
        console.log("Skipped:", decision.reason);
        return;
    }

    const email = createReminderEmail(user, decision);

    await sendEmail({
        to: user.email,
        ...email
    });

    await Reminder.saveReminder({
        userId: user.id,
        reminderType: decision.reminderType,
        notificationDate: today,
        nextActivityDate: decision.nextActivityDate
    });

    console.log("Reminder sent:", decision.reminderType);
}

module.exports = { processReminder };