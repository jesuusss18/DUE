const { createAssignment } = require("../src/factories/assignmentFactory");
const { createExam } = require("../src/factories/examFactory");

describe("Assignment Factory", () => {
    test("Creates an assignment with the correct information", () => {
        const assignment = createAssignment({
            title: " Math Homework ",
            course: " Mathematics ",
            dueDate: "2026-12-15",
            priority: "High"
        });

        expect(assignment).toMatchObject({
            title: "Math Homework",
            course: "Mathematics",
            dueDate: "2026-12-15",
            priority: "High",
            completed: false
        });

        expect(assignment.id).toBeTruthy();
        expect(new Date(assignment.createdAt).toISOString())
            .toBe(assignment.createdAt);
    });

    test("Uses default assignment values", () => {
        const assignment = createAssignment({
            title: "Homework",
            dueDate: "2026-12-15"
        });

        expect(assignment.course).toBe("");
        expect(assignment.priority).toBe("Medium");
        expect(assignment.completed).toBe(false);
    });

    test("Generates unique assignment IDs", () => {
        const data = {
            title: "Homework",
            dueDate: "2026-12-15"
        };

        expect(createAssignment(data).id)
            .not.toBe(createAssignment(data).id);
    });
});

describe("Exam Factory", () => {
    test("Creates an exam with the correct information", () => {
        const exam = createExam({
            title: " Math Exam ",
            course: " Mathematics ",
            examDate: "2026-12-18",
            location: " Room 101 "
        });

        expect(exam).toMatchObject({
            title: "Math Exam",
            course: "Mathematics",
            examDate: "2026-12-18",
            location: "Room 101"
        });

        expect(exam.id).toBeTruthy();
    });

    test("Uses default exam values", () => {
        const exam = createExam({
            title: "Final Exam",
            examDate: "2026-12-18"
        });

        expect(exam.course).toBe("");
        expect(exam.location).toBe("");
    });

    test("Generates unique exam IDs", () => {
        const data = {
            title: "Final Exam",
            examDate: "2026-12-18"
        };

        expect(createExam(data).id)
            .not.toBe(createExam(data).id);
    });
});