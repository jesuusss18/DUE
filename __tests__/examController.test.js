jest.mock("../src/models/examModel", () => ({
    getAllExams: jest.fn(),
    addExam: jest.fn(),
    updateExam: jest.fn(),
    deleteExam: jest.fn()
}));

const Exam = require("../src/models/examModel");
const controller = require("../src/controllers/examController");

const exam = {
    title: "Computer Science Final",
    course: "Computer Science",
    examDate: "2026-12-15",
    location: "Room 101"
};

let req, res;

beforeEach(() => {
    jest.resetAllMocks();

    req = {
        user: { id: "user-123" },
        params: { id: "exam-123" },
        body: { ...exam }
    };

    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe("Exam controller", () => {
    test.each([[[exam]], [[]]])(
        "Returns user exams: %j", async exams => {
            Exam.getAllExams.mockResolvedValue(exams);

            await controller.getExams(req, res);

            expect(Exam.getAllExams).toHaveBeenCalledWith("user-123");
            expect(res.json).toHaveBeenCalledWith(exams);
        }
    );

    test.each([exam, { title: exam.title, examDate: exam.examDate }])(
        "Creates a valid exam: %j", async body => {
            req.body = body;
            Exam.addExam.mockResolvedValue(body);

            await controller.addExam(req, res);

            expect(Exam.addExam).toHaveBeenCalledWith(
                expect.objectContaining(body), "user-123"
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(body);
        }
    );

    test.each([
        undefined, null, "Exam",
        { examDate: exam.examDate },
        { title: exam.title },
        { ...exam, title: "" },
        { ...exam, title: "   " },
        { ...exam, title: 123 },
        { ...exam, title: "a".repeat(256) },
        { ...exam, course: 123 },
        { ...exam, course: "a".repeat(256) },
        { ...exam, location: 123 },
        { ...exam, location: "a".repeat(256) },
        { ...exam, examDate: 123 },
        { ...exam, examDate: "12/15/2026" },
        { ...exam, examDate: "2026-02-30" },
        { ...exam, examDate: "2026-13-01" },
        { ...exam, userId: "another-user" }
    ])("Rejects invalid exam: %j", async body => {
        req.body = body;

        await controller.addExam(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid exam information"
        });
        expect(Exam.addExam).not.toHaveBeenCalled();
    });

    test.each([
        { title: "Updated Final" },
        { examDate: "2026-12-20" },
        { location: "Room 202" }
    ])("Updates exam: %j", async body => {
        req.body = body;
        const updated = { ...exam, ...body };
        Exam.updateExam.mockResolvedValue(updated);

        await controller.updateExam(req, res);

        expect(Exam.updateExam).toHaveBeenCalledWith(
            "exam-123", body, "user-123"
        );
        expect(res.json).toHaveBeenCalledWith(updated);
    });

    test.each([
        {}, { title: "" }, { examDate: "invalid-date" },
        { course: 123 }, { location: 123 },
        { userId: "another-user" }
    ])("Rejects invalid update: %j", async body => {
        req.body = body;

        await controller.updateExam(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid update information"
        });
        expect(Exam.updateExam).not.toHaveBeenCalled();
    });

    test("Deletes an existing exam", async () => {
        Exam.deleteExam.mockResolvedValue(true);

        await controller.deleteExam(req, res);

        expect(Exam.deleteExam).toHaveBeenCalledWith(
            "exam-123", "user-123"
        );
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    test.each(["updateExam", "deleteExam"])(
        "Returns 404 for missing exam: %s", async method => {
            Exam[method].mockResolvedValue(null);

            await controller[method](req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "Exam not found"
            });
        }
    );

    test.each([
        ["getExams", "getAllExams"],
        ["addExam", "addExam"],
        ["updateExam", "updateExam"],
        ["deleteExam", "deleteExam"]
    ])("Handles database error: %s", async (action, method) => {
        Exam[method].mockRejectedValue(new Error("Database error"));

        await controller[action](req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Database error"
        });
        expect(console.error).toHaveBeenCalled();
    });
    test("Rejects an array as exam information", async () => {
        req.body = [];

        await controller.addExam(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid exam information"
        });
        expect(Exam.addExam).not.toHaveBeenCalled();
    });
});