const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getSettings,
    updateSettings
} = require("../controllers/settingsController");

const router = express.Router();

// Protect all settings routes
router.use(authMiddleware);

// Get current preferences
router.get("/", getSettings);

// Update preferences
router.put("/", updateSettings);

module.exports = router;
