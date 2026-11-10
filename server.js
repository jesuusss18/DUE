
require("dotenv").config();

const express = require("express");
const path = require("path");
const assignmentRoutes = require("./src/routes/assignmentRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

// Allow the server to receive JSON
app.use(express.json());

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

// Start the server
app.listen(PORT, () => {
    console.log(`DUE is running at http://localhost:${PORT}`);
});
