
require("dotenv").config();

const express = require("express");
const path = require("path");

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

// Start the server
app.listen(PORT, () => {
    console.log(`DUE is running at http://localhost:${PORT}`);
});
