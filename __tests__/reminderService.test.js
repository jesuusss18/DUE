jest.mock("../src/models/reminderModel", () => ({
    getUpcomingAssignments: jest.fn(),
    getUpcomingExams: jest.fn(),
    getLastReminder: jest.fn(),
    hasReminderToday: jest.fn(),
    saveReminder: jest.fn()
}));

jest.mock("../src/services/emailService", () => ({
    sendEmail: jest.fn()
}));

const Reminder = require("../src/models/reminderModel");
const { sendEmail } = require("../src/services/emailService");
const { processReminder } = require("../src/services/reminderService");

const user = {
    id: "user-1",
    name: "Test Student",
    email: "student@example.com",
    timezone: "America/Chicago"
};

const assignment = {
    title: "Math Homework",
    course: "Mathematics",
    dueDate: "2026-11-25",
    priority: "High",
    completed: false
};

beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-24T23:00:00Z"));

    jest.spyOn(console, "log").mockImplementation(() => {});

    Reminder.getUpcomingAssignments.mockResolvedValue([assignment]);
    Reminder.getUpcomingExams.mockResolvedValue([]);
    Reminder.getLastReminder.mockResolvedValue(null);
    Reminder.hasReminderToday.mockResolvedValue(false);
    Reminder.saveReminder.mockResolvedValue({ id: "reminder-1" });
    sendEmail.mockResolvedValue({ id: "email-1" });
});

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
});

test("Sends a daily reminder and saves its history", async () => {
    await processReminder(user);

    expect(sendEmail).toHaveBeenCalledTimes(1);

    expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
            to: user.email,
            subject: "Your deadlines for tomorrow | DUE",
            text: expect.stringContaining("Math Homework")
        })
    );

    expect(Reminder.saveReminder).toHaveBeenCalledWith({
        userId: user.id,
        reminderType: "daily",
        notificationDate: "2026-11-24",
        nextActivityDate: "2026-11-25"
    });
});

test("Combines assignments and exams in one email", async () => {
    Reminder.getUpcomingExams.mockResolvedValue([{
        title: "Physics Exam",
        course: "Physics",
        examDate: "2026-11-25",
        location: "Room 101"
    }]);

    await processReminder(user);

    expect(sendEmail).toHaveBeenCalledTimes(1);

    const email = sendEmail.mock.calls[0][0];

    expect(email.text).toContain("Math Homework");
    expect(email.text).toContain("Physics Exam");
});

test("Sends a gap reminder for a future deadline", async () => {
    Reminder.getUpcomingAssignments.mockResolvedValue([{
        ...assignment,
        dueDate: "2026-11-30"
    }]);

    await processReminder(user);

    expect(sendEmail.mock.calls[0][0].subject)
        .toBe("Your next deadline | DUE");

    expect(Reminder.saveReminder).toHaveBeenCalledWith(
        expect.objectContaining({
            reminderType: "gap",
            nextActivityDate: "2026-11-30"
        })
    );
});

test("Sends an all caught up reminder", async () => {
    Reminder.getUpcomingAssignments.mockResolvedValue([]);

    await processReminder(user);

    expect(sendEmail.mock.calls[0][0].subject)
        .toBe("You're all caught up! | DUE");

    expect(Reminder.saveReminder).toHaveBeenCalledWith(
        expect.objectContaining({
            reminderType: "all_caught_up",
            nextActivityDate: null
        })
    );
});

test("Does not send a duplicate reminder", async () => {
    Reminder.hasReminderToday.mockResolvedValue(true);

    await processReminder(user);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(Reminder.saveReminder).not.toHaveBeenCalled();
});

test("Does not save history when email delivery fails", async () => {
    sendEmail.mockRejectedValue(new Error("Email failed"));

    await expect(processReminder(user))
        .rejects.toThrow("Email failed");

    expect(Reminder.saveReminder).not.toHaveBeenCalled();
});

test("Does not send an email when the database fails", async () => {
    Reminder.getUpcomingAssignments.mockRejectedValue(
        new Error("Database error")
    );

    await expect(processReminder(user))
        .rejects.toThrow("Database error");

    expect(sendEmail).not.toHaveBeenCalled();
    expect(Reminder.saveReminder).not.toHaveBeenCalled();
});