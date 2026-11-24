require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const assignmentRoutes = require("./src/routes/assignmentRoutes");
const authRoutes = require("./src/routes/authRoutes");
const examRoutes = require("./src/routes/examRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the server to receive JSON
app.use(express.json());
app.use(cookieParser());

// Serve the DUE frontend
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        application: "DUE",
        message: "Server is running"
    });
});

// Assignment routes
app.use("/api/assignments", assignmentRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// Exam routes
app.use("/api/exams", examRoutes);

// Settings routes
app.use("/api/settings", settingsRoutes);

// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `DUE is running at http://localhost:${PORT}`
        );
    });
}

module.exports = app;
