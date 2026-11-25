jest.mock("dotenv", () => ({ config: jest.fn() }));

jest.mock("googleapis", () => ({
    google: {
        auth: {
            OAuth2: jest.fn()
        },
        gmail: jest.fn()
    }
}));

const { google } = require("googleapis");
const { sendEmail } = require("../src/services/emailService");

const send = jest.fn();
const setCredentials = jest.fn();

const email = {
    to: "student@example.com",
    subject: "DUE Reminder",
    text: "You have an assignment tomorrow.",
    html: "<p>You have an assignment tomorrow.</p>"
};

const originalEnv = process.env;

beforeEach(() => {
    jest.resetAllMocks();

    process.env = {
        ...originalEnv,
        GOOGLE_CLIENT_ID: "test-client",
        GOOGLE_CLIENT_SECRET: "test-secret",
        GOOGLE_REDIRECT_URI: "http://localhost:3000",
        GOOGLE_REFRESH_TOKEN: "test-token",
        EMAIL_FROM: "due@example.com",
        EMAIL_FROM_NAME: "DUE"
    };

    google.auth.OAuth2.mockImplementation(() => ({
        setCredentials
    }));

    google.gmail.mockReturnValue({
        users: {
            messages: { send }
        }
    });

    send.mockResolvedValue({
        data: { id: "email-1" }
    });

    jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
});

test("Authenticates and sends an email through Gmail", async () => {
    const result = await sendEmail(email);

    expect(setCredentials).toHaveBeenCalledWith({
        refresh_token: "test-token"
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: "email-1" });

    const request = send.mock.calls[0][0];
    const message = Buffer.from(
        request.requestBody.raw,
        "base64url"
    ).toString();

    expect(request.userId).toBe("me");
    expect(message).toContain(email.to);
    expect(message).toContain(email.subject);
    expect(message).toContain(email.text);
});

test("Reports Gmail API errors", async () => {
    send.mockRejectedValue(new Error("Gmail API error"));

    await expect(sendEmail(email))
        .rejects.toThrow("Gmail API error");
});