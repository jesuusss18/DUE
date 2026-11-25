jest.mock("../src/models/assignmentModel", () => ({
    getAllAssignments: jest.fn(),
    addAssignment: jest.fn(),
    updateAssignment: jest.fn(),
    deleteAssignment: jest.fn()
}));

const Assignment = require("../src/models/assignmentModel");
const controller = require("../src/controllers/assignmentController");

const assignment = {
    title: "Math Homework",
    course: "Mathematics",
    dueDate: "2026-12-15",
    priority: "High",
    completed: false
};

let req, res;

beforeEach(() => {
    jest.resetAllMocks();

    req = {
        user: { id: "user-123" },
        params: { id: "assignment-123" },
        body: { ...assignment }
    };

    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe("Assignment controller", () => {
    test.each([
        ["existing assignments", [assignment]],
        ["no assignments", []]
    ])("Returns %s", async (name, assignments) => {
        Assignment.getAllAssignments.mockResolvedValue(assignments);

        await controller.getAssignments(req, res);

        expect(Assignment.getAllAssignments).toHaveBeenCalledWith("user-123");
        expect(res.json).toHaveBeenCalledWith(assignments);
    });

    test.each([
        assignment,
        { title: assignment.title, dueDate: assignment.dueDate }
    ])("Creates valid assignment: %j", async body => {
        req.body = body;
        Assignment.addAssignment.mockResolvedValue(body);

        await controller.addAssignment(req, res);

        expect(Assignment.addAssignment).toHaveBeenCalledWith(
            expect.objectContaining(body), "user-123"
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(body);
    });

    test.each([
        ["missing body", undefined],
        ["null body", null],
        ["array body", []],
        ["invalid body type", "Homework"],
        ["missing title", { dueDate: assignment.dueDate }],
        ["missing date", { title: assignment.title }],
        ["empty title", { ...assignment, title: "" }],
        ["blank title", { ...assignment, title: "   " }],
        ["invalid title type", { ...assignment, title: 123 }],
        ["invalid course", { ...assignment, course: 123 }],
        ["invalid date type", { ...assignment, dueDate: 123 }],
        ["invalid date format", { ...assignment, dueDate: "12/15/2026" }],
        ["impossible date", { ...assignment, dueDate: "2026-02-30" }],
        ["invalid month", { ...assignment, dueDate: "2026-13-01" }],
        ["invalid priority", { ...assignment, priority: "Urgent" }],
        ["invalid completed value", { ...assignment, completed: "yes" }],
        ["unknown field", { ...assignment, userId: "another-user" }]
    ])("Rejects %s", async (name, body) => {
        req.body = body;

        await controller.addAssignment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid assignment information"
        });
        expect(Assignment.addAssignment).not.toHaveBeenCalled();
    });

    test.each([
        { title: "Updated Homework" },
        { completed: true },
        { completed: false }
    ])("Updates assignment: %j", async body => {
        req.body = body;
        const updated = { ...assignment, ...body };

        Assignment.updateAssignment.mockResolvedValue(updated);

        await controller.updateAssignment(req, res);

        expect(Assignment.updateAssignment).toHaveBeenCalledWith(
            "assignment-123", body, "user-123"
        );
        expect(res.json).toHaveBeenCalledWith(updated);
    });

    test.each([
        {}, { title: "" }, { dueDate: "invalid-date" },
        { priority: "Unknown" }, { completed: 1 },
        { userId: "another-user" }
    ])("Rejects invalid update: %j", async body => {
        req.body = body;

        await controller.updateAssignment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid update information"
        });
        expect(Assignment.updateAssignment).not.toHaveBeenCalled();
    });

    test("Deletes an existing assignment", async () => {
        Assignment.deleteAssignment.mockResolvedValue(true);

        await controller.deleteAssignment(req, res);

        expect(Assignment.deleteAssignment).toHaveBeenCalledWith(
            "assignment-123", "user-123"
        );
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    test.each(["updateAssignment", "deleteAssignment"])(
        "Returns 404 for missing assignment: %s", async method => {
            Assignment[method].mockResolvedValue(null);

            await controller[method](req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "Assignment not found"
            });
        }
    );

    test.each([
        ["getAssignments", "getAllAssignments"],
        ["addAssignment", "addAssignment"],
        ["updateAssignment", "updateAssignment"],
        ["deleteAssignment", "deleteAssignment"]
    ])("Handles database error: %s", async (action, method) => {
        Assignment[method].mockRejectedValue(new Error("Database error"));

        await controller[action](req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Database error"
        });
        expect(console.error).toHaveBeenCalled();
    });
});