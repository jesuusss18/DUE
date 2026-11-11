
const {
    calculateTaskStats
} = require("../src/utils/taskStats");

describe("DUE Task Statistics", () => {

    test("should calculate total assignments", () => {
        const assignments = [
            { completed: false },
            { completed: true },
            { completed: false }
        ];

        const result = calculateTaskStats(assignments);

        expect(result.total).toBe(3);
    });

    test("should count completed assignments", () => {
        const assignments = [
            { completed: true },
            { completed: true },
            { completed: false }
        ];

        const result = calculateTaskStats(assignments);

        expect(result.completed).toBe(2);
    });

    test("should count pending assignments", () => {
        const assignments = [
            { completed: false },
            { completed: false },
            { completed: true }
        ];

        const result = calculateTaskStats(assignments);

        expect(result.pending).toBe(2);
    });

    test("should handle an empty assignment list", () => {
        const result = calculateTaskStats([]);

        expect(result).toEqual({
            total: 0,
            completed: 0,
            pending: 0
        });
    });

});
