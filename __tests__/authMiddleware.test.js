const jwt = require("jsonwebtoken");
const authMiddleware = require("../src/middleware/authMiddleware");

const secret = "due-test-secret";
const originalSecret = process.env.JWT_SECRET;

let req, res, next;

beforeAll(() => {
    process.env.JWT_SECRET = secret;
});

afterAll(() => {
    if (originalSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalSecret;
    }
});

beforeEach(() => {
    req = { headers: {}, cookies: {} };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    next = jest.fn();
});

function createToken(data = { userId: "user-123" }, options = {}, key = secret) {
    return jwt.sign(data, key, options);
}

describe("Authentication middleware", () => {
    test.each(["Bearer", "Cookie"])(
        "Accepts valid %s token", method => {
            const token = createToken();

            if (method === "Bearer") {
                req.headers.authorization = `Bearer ${token}`;
            } else {
                req.cookies.due_session = token;
            }

            authMiddleware(req, res, next);

            expect(req.user).toEqual({ id: "user-123" });
            expect(next).toHaveBeenCalledTimes(1);
        }
    );

    test.each([
        ["missing token", undefined, "Authentication required."],
        ["invalid token", "Bearer invalid-token", "Invalid or expired token."],
        ["expired token", `Bearer ${createToken(undefined, { expiresIn: -1 })}`, "Invalid or expired token."],
        ["missing user ID", `Bearer ${createToken({})}`, "Invalid authentication token."],
        ["unsupported header", "Basic invalid-token", "Authentication required."],
        ["wrong secret", `Bearer ${createToken(undefined, {}, "wrong-secret")}`, "Invalid or expired token."],
        ["unsupported algorithm", `Bearer ${createToken(undefined, { algorithm: "HS384" })}`, "Invalid or expired token."]
    ])("Rejects %s", (name, header, error) => {
        req.headers.authorization = header;

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error });
        expect(next).not.toHaveBeenCalled();
    });

    test("Handles requests without cookies", () => {
        delete req.cookies;

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});