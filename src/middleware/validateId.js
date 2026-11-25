function validateId(req, res, next) {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuid.test(req.params.id)) {
        return res.status(400).json({
            error: "Invalid resource ID."
        });
    }

    next();
}

module.exports = validateId;