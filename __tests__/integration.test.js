jest.mock("../src/config/database", () => require("../tests/testDatabase"));

process.env.JWT_SECRET = "due-integration-test-secret";

const request = require("supertest");
const app = require("../server");
const pool = require("../src/config/database");

const student = {
    name: "Test Student",
    email: "student@example.com",
    password: "Password123"
};

const agent = request.agent(app);
const other = request.agent(app);

beforeAll(async () => {
    await agent.post("/api/auth/register").send(student).expect(201);
    await agent.post("/api/auth/login").send(student).expect(200);

    const secondStudent = {
        ...student,
        email: "other@example.com"
    };

    await other.post("/api/auth/register").send(secondStudent).expect(201);
    await other.post("/api/auth/login").send(secondStudent).expect(200);
});

afterAll(async () => {
    await pool.end();
});

test("Health endpoint returns OK", async () => {
    const res = await request(app).get("/health").expect(200);

    expect(res.body.status).toBe("OK");
});

test("Authenticated user can access their profile", async () => {
    const res = await agent.get("/api/auth/me").expect(200);

    expect(res.body.user.email).toBe(student.email);
    expect(res.body.user.password_hash).toBeUndefined();
});

test("Rejects duplicate registration", async () => {
    await request(app).post("/api/auth/register")
        .send(student).expect(409);
});

test("Rejects incorrect password", async () => {
    await request(app).post("/api/auth/login")
        .send({ ...student, password: "wrong-password" })
        .expect(401);
});

test.each(["assignments", "exams", "settings"])(
    "Protects the %s endpoint", async route => {
        await request(app).get(`/api/${route}`).expect(401);
    }
);

test("Assignment lifecycle and user isolation", async () => {
    const created = await agent.post("/api/assignments")
        .send({
            title: "Math Homework",
            course: "Mathematics",
            dueDate: "2026-12-15",
            priority: "High"
        }).expect(201);

    const id = created.body.id;
    const url = `/api/assignments/${id}`;

    const list = await agent.get("/api/assignments").expect(200);
    expect(list.body).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ id, title: "Math Homework" })
        ])
    );

    const otherList = await other.get("/api/assignments").expect(200);
    expect(otherList.body).toEqual([]);

    await other.put(url).send({ title: "Unauthorized" }).expect(404);
    await other.delete(url).expect(404);

    const updated = await agent.put(url)
        .send({ title: "Updated Homework", completed: true })
        .expect(200);

    expect(updated.body.title).toBe("Updated Homework");
    expect(updated.body.completed).toBe(true);

    await agent.delete(url).expect(204);

    const remaining = await agent.get("/api/assignments").expect(200);
    expect(remaining.body).toEqual([]);
});

test("Exam lifecycle and user isolation", async () => {
    const created = await agent.post("/api/exams")
        .send({
            title: "Math Exam",
            course: "Mathematics",
            examDate: "2026-12-18",
            location: "Room 101"
        }).expect(201);

    const id = created.body.id;
    const url = `/api/exams/${id}`;

    const list = await agent.get("/api/exams").expect(200);
    expect(list.body).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ id, title: "Math Exam" })
        ])
    );

    const otherList = await other.get("/api/exams").expect(200);
    expect(otherList.body).toEqual([]);

    await other.put(url).send({ location: "Unauthorized" }).expect(404);
    await other.delete(url).expect(404);

    const updated = await agent.put(url)
        .send({ location: "Room 202" }).expect(200);

    expect(updated.body.location).toBe("Room 202");

    await agent.delete(url).expect(204);

    const remaining = await agent.get("/api/exams").expect(200);
    expect(remaining.body).toEqual([]);
});

test("Saves and retrieves reminder preferences", async () => {
    const settings = {
        emailReminders: true,
        reminderTime: "18:30",
        timezone: "Europe/Madrid"
    };

    await agent.put("/api/settings").send(settings).expect(200);

    const res = await agent.get("/api/settings").expect(200);
    expect(res.body).toMatchObject(settings);

    const otherSettings = await other.get("/api/settings").expect(200);
    expect(otherSettings.body.emailReminders).toBe(false);
});

test.each([
    ["assignments", { title: "" }],
    ["exams", { examDate: "invalid" }]
])("Rejects invalid %s information", async (route, body) => {
    await agent.post(`/api/${route}`).send(body).expect(400);
});

test("Rejects invalid reminder preferences", async () => {
    await agent.put("/api/settings").send({
        emailReminders: true,
        reminderTime: "25:00",
        timezone: "Europe/Madrid"
    }).expect(400);
});

test("Logout removes the session", async () => {
    await agent.post("/api/auth/logout").expect(200);
    await agent.get("/api/auth/me").expect(401);
});