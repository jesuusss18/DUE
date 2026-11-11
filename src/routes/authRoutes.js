
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/userModel");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        res.json({ user });

    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            error: "Could not load profile."
        });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("due_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.json({ message: "Logged out successfully." });
});
module.exports = router;
