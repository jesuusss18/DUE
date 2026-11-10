
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication required."
        });
    }

    const token = authorization.slice(7);

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
