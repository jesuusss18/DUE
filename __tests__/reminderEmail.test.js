const {
    createReminderEmail,
    escapeHtml,
    formatDate
} = require("../src/templates/reminderEmail");

const user = {
    name: "Test Student"
};

const decision = {
    shouldSend: true,
    reminderType: "daily",
    nextActivityDate: "2026-11-25",
    assignments: [{
        title: "Math Homework",
        course: "Mathematics",
        priority: "High"
    }],
    exams: [{
        title: "Physics Exam",
        course: "Physics",
        location: "Room 101"
    }]
};

const originalUrl = process.env.APP_URL;

beforeEach(() => {
    process.env.APP_URL = "https://due.example.com";
});

afterEach(() => {
    if (originalUrl === undefined) {
        delete process.env.APP_URL;
    } else {
        process.env.APP_URL = originalUrl;
    }
});

test("Creates the correct email content", () => {
    const email = createReminderEmail(user, decision);

    expect(email.subject).toBe("Your deadlines for tomorrow | DUE");
    expect(email.text).toContain("Test Student");
    expect(email.text).toContain("Math Homework");
    expect(email.text).toContain("Physics Exam");
    expect(email.text).toContain("Room 101");
    expect(email.text).toContain("November 25, 2026");
    expect(email.html).toContain("Math Homework");
});

test("Includes dashboard and settings links", () => {
    const email = createReminderEmail(user, decision);

    expect(email.html).toContain(
        "https://due.example.com/dashboard.html"
    );

    expect(email.html).toContain(
        "https://due.example.com/settings.html"
    );
});

test("Escapes unsafe HTML characters", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("Math & Science")).toBe("Math &amp; Science");
});

test("Escapes user information in the email", () => {
    const email = createReminderEmail({
        name: "<script>alert(1)</script>"
    }, decision);

    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
});

test("Formats dates correctly", () => {
    expect(formatDate("2026-11-25")).toBe("November 25, 2026");
    expect(formatDate(null)).toBe("");
});

test("Rejects reminders that should not be sent", () => {
    expect(() => createReminderEmail(user, {
        shouldSend: false
    })).toThrow("Reminder should not be sent.");
});

test("Rejects invalid reminder types", () => {
    expect(() => createReminderEmail(user, {
        ...decision,
        reminderType: "invalid"
    })).toThrow("Invalid reminder type.");
});

test("Rejects unsafe application URLs", () => {
    process.env.APP_URL = "javascript:alert(1)";

    expect(() => createReminderEmail(user, decision))
        .toThrow("Invalid APP_URL.");
});