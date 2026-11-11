
require("dotenv").config();

const express = require("express");
const path = require("path");
const assignmentRoutes = require("./src/routes/assignmentRoutes");
const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require("./src/routes/authRoutes");
const cookieParser = require("cookie-parser");
const examRoutes = require("./src/routes/examRoutes");

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

// Start the server
app.listen(PORT, () => {
    console.log(`DUE is running at http://localhost:${PORT}`);
});
