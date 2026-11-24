const {
    validateReminderPreferences,
    isValidTimeZone
} = require("../src/utils/reminderValidation");

const validPreferences = {
    emailReminders: true,
    reminderTime: "19:00",
    timezone: "America/Chicago"
};

describe("Reminder Preferences Validation", () => {

    test("should accept valid preferences", () => {
        expect(
            validateReminderPreferences(validPreferences)
        ).toBeNull();
    });

    test("should allow disabling email reminders", () => {
        expect(
            validateReminderPreferences({
                ...validPreferences,
                emailReminders: false
            })
        ).toBeNull();
    });

    test("should reject missing preferences", () => {
        expect(
            validateReminderPreferences(null)
        ).not.toBeNull();
    });

    test("should reject invalid reminder status", () => {
        expect(
            validateReminderPreferences({
                ...validPreferences,
                emailReminders: "true"
            })
        ).not.toBeNull();
    });

    test("should reject invalid hours", () => {
        expect(
            validateReminderPreferences({
                ...validPreferences,
                reminderTime: "25:00"
            })
        ).not.toBeNull();
    });

    test("should reject invalid minutes", () => {
        expect(
            validateReminderPreferences({
                ...validPreferences,
                reminderTime: "19:75"
            })
        ).not.toBeNull();
    });

    test("should reject invalid time format", () => {
        expect(
            validateReminderPreferences({
                ...validPreferences,
                reminderTime: "7 PM"
            })
        ).not.toBeNull();
    });

    test("should accept midnight", () => {
        expect(
            validateReminderPreferences({
                ...validPreferences,
                reminderTime: "00:00"
            })
        ).toBeNull();
    });

    test("should accept Madrid timezone", () => {
        expect(
            isValidTimeZone("Europe/Madrid")
        ).toBe(true);
    });

    test("should accept Chicago timezone", () => {
        expect(
            isValidTimeZone("America/Chicago")
        ).toBe(true);
    });

    test("should reject an invalid timezone", () => {
        expect(
            isValidTimeZone("Invalid/Timezone")
        ).toBe(false);
    });

    test("should reject missing timezone", () => {
        expect(
            validateReminderPreferences({
                ...validPreferences,
                timezone: undefined
            })
        ).not.toBeNull();
    });

});
