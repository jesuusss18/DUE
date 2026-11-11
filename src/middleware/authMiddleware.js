const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    const bearerToken =
        authorization &&
        authorization.startsWith("Bearer ")
            ? authorization.slice(7)
            : null;

    const token = bearerToken || req.cookies?.due_session;

    if (!token) {
        return res.status(401).json({
            error: "Authentication required."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (!decoded.userId) {
            return res.status(401).json({
                error: "Invalid authentication token."
            });
        }

        req.user = {
            id: decoded.userId
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token."
        });
    }
}

module.exports = authMiddleware;
