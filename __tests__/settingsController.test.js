jest.mock("../src/models/userModel", () => ({
    getReminderPreferences: jest.fn(),
    updateReminderPreferences: jest.fn()
}));

const User = require("../src/models/userModel");
const { getSettings, updateSettings } = require("../src/controllers/settingsController");

const settings = {
    emailReminders: true,
    reminderTime: "19:00",
    timezone: "America/Chicago"
};

let req, res;

beforeEach(() => {
    jest.resetAllMocks();

    req = {
        user: { id: "user-123" },
        body: { ...settings }
    };

    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test("Returns user settings", async () => {
    User.getReminderPreferences.mockResolvedValue(settings);

    await getSettings(req, res);

    expect(User.getReminderPreferences).toHaveBeenCalledWith("user-123");
    expect(res.json).toHaveBeenCalledWith(settings);
});

test.each([true, false])("Updates reminders to %s", async enabled => {
    req.body.emailReminders = enabled;
    User.updateReminderPreferences.mockResolvedValue(req.body);

    await updateSettings(req, res);

    expect(User.updateReminderPreferences)
        .toHaveBeenCalledWith("user-123", req.body);

    expect(res.json).toHaveBeenCalledWith({
        message: "Preferences saved successfully.",
        settings: req.body
    });
});

test.each([
    ["missing body", undefined],
    ["invalid reminder status", { ...settings, emailReminders: "yes" }],
    ["invalid time", { ...settings, reminderTime: "25:00" }],
    ["invalid timezone", { ...settings, timezone: "Invalid/Zone" }]
])("Rejects %s", async (name, body) => {
    req.body = body;

    await updateSettings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(User.updateReminderPreferences).not.toHaveBeenCalled();
});

test.each([
    [getSettings, "getReminderPreferences"],
    [updateSettings, "updateReminderPreferences"]
])("Returns 404 for missing user: %p", async (action, method) => {
    User[method].mockResolvedValue(null);

    await action(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found." });
});

test.each([
    [getSettings, "getReminderPreferences", "Could not load settings."],
    [updateSettings, "updateReminderPreferences", "Could not save settings."]
])("Handles database error: %p", async (action, method, error) => {
    User[method].mockRejectedValue(new Error("Database error"));

    await action(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error });
});