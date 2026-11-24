
const User = require("../models/userModel");

const {
    validateReminderPreferences
} = require("../utils/reminderValidation");

// Get user settings
async function getSettings(req, res) {
    try {
        const settings = await User.getReminderPreferences(
            req.user.id
        );

        if (!settings) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        return res.status(200).json(settings);

    } catch (error) {
        console.error("Get settings error:", error);

        return res.status(500).json({
            error: "Could not load settings."
        });
    }
}

// Update user settings
async function updateSettings(req, res) {
    try {
        const preferences = req.body || {};

        const validationError =
            validateReminderPreferences(preferences);

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const settings = await User.updateReminderPreferences(
            req.user.id,
            preferences
        );

        if (!settings) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        return res.status(200).json({
            message: "Preferences saved successfully.",
            settings
        });

    } catch (error) {
        console.error("Update settings error:", error);

        return res.status(500).json({
            error: "Could not save settings."
        });
    }
}

module.exports = {
    getSettings,
    updateSettings
};
