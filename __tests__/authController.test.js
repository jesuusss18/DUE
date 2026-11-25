jest.mock("../src/models/userModel", () => ({
    findUserByEmail: jest.fn(),
    createUser: jest.fn()
}));

jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

const User = require("../src/models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { register, login } = require("../src/controllers/authController");

const credentials = {
    name: "Test Student",
    email: "student@example.com",
    password: "Password123"
};

const user = {
    id: "user-123",
    name: credentials.name,
    email: credentials.email
};

let req, res;
const originalSecret = process.env.JWT_SECRET;

beforeAll(() => {
    process.env.JWT_SECRET = "due-test-secret";
});

afterAll(() => {
    if (originalSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalSecret;
    }
});

beforeEach(() => {
    jest.resetAllMocks();
    req = { body: { ...credentials } };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe("User registration", () => {
    test("Registers a valid user", async () => {
        req.body.name = " Test Student ";
        req.body.email = "STUDENT@example.com";

        User.findUserByEmail.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashed-password");
        User.createUser.mockResolvedValue(user);

        await register(req, res);

        expect(User.findUserByEmail).toHaveBeenCalledWith(user.email);
        expect(bcrypt.hash).toHaveBeenCalledWith(credentials.password, 12);
        expect(User.createUser).toHaveBeenCalledWith({
            ...user,
            id: expect.any(String),
            passwordHash: "hashed-password"
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Account created successfully.",
            user
        });
    });

    test.each([
        ["missing body", undefined],
        ["missing name", { ...credentials, name: undefined }],
        ["empty name", { ...credentials, name: " " }],
        ["long name", { ...credentials, name: "a".repeat(101) }],
        ["missing email", { ...credentials, email: undefined }],
        ["invalid email", { ...credentials, email: "invalid" }],
        ["long email", { ...credentials, email: "a".repeat(256) + "@example.com" }],
        ["missing password", { ...credentials, password: undefined }],
        ["short password", { ...credentials, password: "123" }],
        ["long password", { ...credentials, password: "a".repeat(73) }],
        ["password over 72 bytes", { ...credentials, password: "á".repeat(37) }]
    ])("Rejects registration with %s", async (name, body) => {
        req.body = body;

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(User.createUser).not.toHaveBeenCalled();
    });

    test("Rejects an existing email", async () => {
        User.findUserByEmail.mockResolvedValue(user);

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(User.createUser).not.toHaveBeenCalled();
    });

    test("Handles duplicate email database errors", async () => {
        User.findUserByEmail.mockResolvedValue(null);
        User.createUser.mockRejectedValue({ code: "23505" });

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    test("Handles registration database errors", async () => {
        User.findUserByEmail.mockRejectedValue(new Error("Database error"));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(console.error).toHaveBeenCalled();
    });
});

describe("User login", () => {
    test("Logs in and creates a valid session cookie", async () => {
        User.findUserByEmail.mockResolvedValue({
            ...user,
            password_hash: "hashed-password"
        });
        bcrypt.compare.mockResolvedValue(true);

        await login(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith(
            credentials.password, "hashed-password"
        );

        expect(res.cookie).toHaveBeenCalledWith(
            "due_session",
            expect.any(String),
            expect.objectContaining({
                httpOnly: true,
                sameSite: "lax",
                maxAge: 7200000,
                path: "/"
            })
        );

        const token = res.cookie.mock.calls[0][1];
        expect(jwt.verify(token, process.env.JWT_SECRET).userId)
            .toBe(user.id);

        expect(res.json).toHaveBeenCalledWith({
            message: "Login successful.",
            user
        });
    });

    test.each([
        ["missing body", undefined],
        ["missing email", { password: credentials.password }],
        ["missing password", { email: credentials.email }]
    ])("Rejects login with %s", async (name, body) => {
        req.body = body;

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.cookie).not.toHaveBeenCalled();
    });

    test.each([
        ["unknown user", null],
        ["incorrect password", { ...user, password_hash: "hash" }]
    ])("Rejects login with %s", async (name, account) => {
        User.findUserByEmail.mockResolvedValue(account);
        bcrypt.compare.mockResolvedValue(false);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.cookie).not.toHaveBeenCalled();
    });

    test("Handles login database errors", async () => {
        User.findUserByEmail.mockRejectedValue(new Error("Database error"));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(console.error).toHaveBeenCalled();
    });
});