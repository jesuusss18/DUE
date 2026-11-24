function getLocalDateTime(timezone, now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(now);

    const get = type =>
        parts.find(part => part.type === type).value;

    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        time: `${get("hour")}:${get("minute")}`
    };
}

function getTomorrow(today) {
    const date = new Date(`${today}T00:00:00Z`);

    date.setUTCDate(date.getUTCDate() + 1);

    return date.toISOString().slice(0, 10);
}

function getReminderDecision({
    today,
    assignments = [],
    exams = [],
    lastReminder = null,
    alreadySent = false,
    emailReminders = true
}) {
    const tomorrow = getTomorrow(today);

    // Do not send reminders when disabled
    if (!emailReminders) {
        return {
            shouldSend: false,
            reason: "Reminders are disabled."
        };
    }

    // Prevent repeated reminders on the same day
    if (
        alreadySent ||
        lastReminder?.notificationDate === today
    ) {
        return {
            shouldSend: false,
            reason: "A reminder was already sent today."
        };
    }

    // Exclude completed and past assignments
    const pendingAssignments = assignments.filter(
        assignment =>
            !assignment.completed &&
            assignment.dueDate > today
    );

    // Exclude past exams
    const upcomingExams = exams.filter(
        exam => exam.examDate > today
    );

    // Find assignments and exams scheduled for tomorrow
    const tomorrowAssignments = pendingAssignments.filter(
        assignment => assignment.dueDate === tomorrow
    );

    const tomorrowExams = upcomingExams.filter(
        exam => exam.examDate === tomorrow
    );

    // Send one combined daily reminder
    if (
        tomorrowAssignments.length > 0 ||
        tomorrowExams.length > 0
    ) {
        return {
            shouldSend: true,
            reminderType: "daily",
            notificationDate: today,
            nextActivityDate: tomorrow,
            assignments: tomorrowAssignments,
            exams: tomorrowExams
        };
    }

    // Find the next upcoming activity
    const upcomingDates = [
        ...pendingAssignments.map(
            assignment => assignment.dueDate
        ),
        ...upcomingExams.map(
            exam => exam.examDate
        )
    ].sort();

    const nextActivityDate = upcomingDates[0] || null;

    // No future activities
    if (!nextActivityDate) {
        if (lastReminder?.reminderType === "all_caught_up") {
            return {
                shouldSend: false,
                reason: "User already knows there are no deadlines."
            };
        }

        return {
            shouldSend: true,
            reminderType: "all_caught_up",
            notificationDate: today,
            nextActivityDate: null,
            assignments: [],
            exams: []
        };
    }

    // Avoid repeating the same gap notification
    if (
        lastReminder?.reminderType === "gap" &&
        lastReminder.nextActivityDate === nextActivityDate
    ) {
        return {
            shouldSend: false,
            reason: "User already knows the next deadline."
        };
    }

    // Send a one-time notice about the next deadline
    return {
        shouldSend: true,
        reminderType: "gap",
        notificationDate: today,
        nextActivityDate,

        assignments: pendingAssignments.filter(
            assignment =>
                assignment.dueDate === nextActivityDate
        ),

        exams: upcomingExams.filter(
            exam =>
                exam.examDate === nextActivityDate
        )
    };
}

module.exports = {
    getLocalDateTime,
    getTomorrow,
    getReminderDecision
};
