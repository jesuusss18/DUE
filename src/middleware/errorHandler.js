function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "Invalid JSON format."
        });
    }

    const status = error.status || 500;

    if (status >= 400 && status < 500) {
        return res.status(status).json({
            error: "Invalid request."
        });
    }

    console.error("Server error:", error.message);

    res.status(500).json({
        error: "Internal server error."
    });
}

module.exports = errorHandler;