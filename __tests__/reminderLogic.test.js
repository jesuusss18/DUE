const {
    getLocalDateTime,
    getTomorrow,
    getReminderDecision
} = require("../src/utils/reminderLogic");

describe("Smart Reminder Logic", () => {

    const today = "2026-11-24";

    const assignment = {
        id: "1",
        title: "Software Development Project",
        course: "Computer Science",
        dueDate: "2026-11-25",
        completed: false
    };

    const exam = {
        id: "2",
        title: "Physics Final Exam",
        course: "Physics",
        examDate: "2026-11-25"
    };

    test("should calculate tomorrow correctly", () => {
        expect(getTomorrow(today))
            .toBe("2026-11-25");
    });

    test("should handle the end of a month", () => {
        expect(getTomorrow("2026-11-30"))
            .toBe("2026-12-01");
    });

    test("should handle the end of a year", () => {
        expect(getTomorrow("2026-12-31"))
            .toBe("2027-01-01");
    });

    test("should send a reminder for tomorrow's assignment", () => {
        const result = getReminderDecision({
            today,
            assignments: [assignment]
        });

        expect(result.shouldSend).toBe(true);
        expect(result.reminderType).toBe("daily");
        expect(result.assignments).toHaveLength(1);
    });

    test("should send a reminder for tomorrow's exam", () => {
        const result = getReminderDecision({
            today,
            exams: [exam]
        });

        expect(result.shouldSend).toBe(true);
        expect(result.reminderType).toBe("daily");
        expect(result.exams).toHaveLength(1);
    });

    test("should combine assignments and exams", () => {
        const result = getReminderDecision({
            today,
            assignments: [assignment],
            exams: [exam]
        });

        expect(result.reminderType).toBe("daily");
        expect(result.assignments).toHaveLength(1);
        expect(result.exams).toHaveLength(1);
    });

    test("should ignore completed assignments", () => {
        const result = getReminderDecision({
            today,
            assignments: [{
                ...assignment,
                completed: true
            }]
        });

        expect(result.reminderType)
            .toBe("all_caught_up");

        expect(result.assignments).toHaveLength(0);
    });

    test("should ignore overdue assignments", () => {
        const result = getReminderDecision({
            today,
            assignments: [{
                ...assignment,
                dueDate: "2026-11-20"
            }]
        });

        expect(result.reminderType)
            .toBe("all_caught_up");
    });

    test("should send a gap notification", () => {
        const result = getReminderDecision({
            today,
            assignments: [{
                ...assignment,
                dueDate: "2026-11-30"
            }]
        });

        expect(result.shouldSend).toBe(true);
        expect(result.reminderType).toBe("gap");
        expect(result.nextActivityDate)
            .toBe("2026-11-30");
    });

    test("should not repeat a gap notification", () => {
        const result = getReminderDecision({
            today,
            assignments: [{
                ...assignment,
                dueDate: "2026-11-30"
            }],
            lastReminder: {
                reminderType: "gap",
                nextActivityDate: "2026-11-30",
                notificationDate: "2026-11-23"
            }
        });

        expect(result.shouldSend).toBe(false);
    });

    test("should send an updated gap notification", () => {
        const result = getReminderDecision({
            today,
            assignments: [{
                ...assignment,
                dueDate: "2026-11-27"
            }],
            lastReminder: {
                reminderType: "gap",
                nextActivityDate: "2026-11-30",
                notificationDate: "2026-11-23"
            }
        });

        expect(result.shouldSend).toBe(true);
        expect(result.nextActivityDate)
            .toBe("2026-11-27");
    });

    test("should send a daily reminder after a gap", () => {
        const result = getReminderDecision({
            today,
            assignments: [assignment],
            lastReminder: {
                reminderType: "gap",
                nextActivityDate: "2026-11-25",
                notificationDate: "2026-11-22"
            }
        });

        expect(result.shouldSend).toBe(true);
        expect(result.reminderType).toBe("daily");
    });

    test("should notify when there are no future activities", () => {
        const result = getReminderDecision({
            today
        });

        expect(result.shouldSend).toBe(true);
        expect(result.reminderType)
            .toBe("all_caught_up");
    });

    test("should not repeat all caught up notifications", () => {
        const result = getReminderDecision({
            today,
            lastReminder: {
                reminderType: "all_caught_up",
                notificationDate: "2026-11-23"
            }
        });

        expect(result.shouldSend).toBe(false);
    });

    test("should not send two reminders on the same day", () => {
        const result = getReminderDecision({
            today,
            assignments: [assignment],
            alreadySent: true
        });

        expect(result.shouldSend).toBe(false);
    });

    test("should respect disabled email reminders", () => {
        const result = getReminderDecision({
            today,
            assignments: [assignment],
            emailReminders: false
        });

        expect(result.shouldSend).toBe(false);
    });

    test("should respect the Madrid timezone", () => {
        const result = getLocalDateTime(
            "Europe/Madrid",
            new Date("2026-11-24T23:30:00Z")
        );

        expect(result.date).toBe("2026-11-25");
        expect(result.time).toBe("00:30");
    });

    test("should respect the Chicago timezone", () => {
        const result = getLocalDateTime(
            "America/Chicago",
            new Date("2026-11-24T23:30:00Z")
        );

        expect(result.date).toBe("2026-11-24");
        expect(result.time).toBe("17:30");
    });

    test("should find the earliest activity across tasks and exams", () => {
        const result = getReminderDecision({
            today,
            assignments: [{
                ...assignment,
                dueDate: "2026-11-30"
            }],
            exams: [{
                ...exam,
                examDate: "2026-11-27"
            }]
        });

        expect(result.reminderType).toBe("gap");
        expect(result.nextActivityDate)
            .toBe("2026-11-27");
        expect(result.exams).toHaveLength(1);
        expect(result.assignments).toHaveLength(0);
    });
});
