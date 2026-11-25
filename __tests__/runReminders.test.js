jest.mock("dotenv", () => ({ config: jest.fn() }));

jest.mock("../src/config/database", () => ({
    end: jest.fn()
}));

jest.mock("../src/models/reminderModel", () => ({
    getUsersWithReminders: jest.fn()
}));

jest.mock("../src/services/reminderService", () => ({
    processReminder: jest.fn()
}));

const pool = require("../src/config/database");
const Reminder = require("../src/models/reminderModel");
const { processReminder } = require("../src/services/reminderService");
const { runReminders } = require("../scripts/runReminders");

const user = {
    id: "1",
    timezone: "America/Chicago",
    reminderTime: "17:00"
};

beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-24T23:00:00Z"));

    Reminder.getUsersWithReminders.mockResolvedValue([user]);

    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    process.exitCode = undefined;
});

test("Processes reminders at the selected time", async () => {
    await runReminders();

    expect(processReminder).toHaveBeenCalledWith(user);
    expect(pool.end).toHaveBeenCalled();
});

test("Waits until the selected reminder time", async () => {
    Reminder.getUsersWithReminders.mockResolvedValue([{
        ...user,
        reminderTime: "19:00"
    }]);

    await runReminders();

    expect(processReminder).not.toHaveBeenCalled();
    expect(pool.end).toHaveBeenCalled();
});

test("Continues processing users after an email failure", async () => {
    const otherUser = { ...user, id: "2" };

    Reminder.getUsersWithReminders.mockResolvedValue([
        user, otherUser
    ]);

    processReminder.mockRejectedValueOnce(
        new Error("Email failed")
    );

    await runReminders();

    expect(processReminder).toHaveBeenCalledTimes(2);
    expect(processReminder).toHaveBeenCalledWith(otherUser);
    expect(process.exitCode).toBe(1);
    expect(pool.end).toHaveBeenCalled();
});

test("Handles database errors and closes the connection", async () => {
    Reminder.getUsersWithReminders.mockRejectedValue(
        new Error("Database error")
    );

    await runReminders();

    expect(processReminder).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(pool.end).toHaveBeenCalled();
});