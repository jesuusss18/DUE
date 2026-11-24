function isValidTimeZone(timezone) {
    if (
        typeof timezone !== "string" ||
        timezone.length > 100
    ) {
        return false;
    }

    try {
        new Intl.DateTimeFormat("en-US", {
            timeZone: timezone
        });

        return true;

    } catch {
        return false;
    }
}

function validateReminderPreferences(preferences) {
    if (!preferences) {
        return "Reminder preferences are required.";
    }

    if (typeof preferences.emailReminders !== "boolean") {
        return "Email reminders must be true or false.";
    }

    if (
        typeof preferences.reminderTime !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(
            preferences.reminderTime
        )
    ) {
        return "Please enter a valid reminder time.";
    }

    if (!isValidTimeZone(preferences.timezone)) {
        return "Please select a valid timezone.";
    }

    return null;
}

module.exports = {
    isValidTimeZone,
    validateReminderPreferences
};
