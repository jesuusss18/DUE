
const {
    filterAssignments
} = require("../public/assignmentSearch");

const assignments = [
    {
        id: 1,
        title: "Final Project",
        course: "Software Development",
        priority: "High",
        completed: false
    },
    {
        id: 2,
        title: "Calculus Homework",
        course: "Mathematics",
        priority: "Medium",
        completed: true
    },
    {
        id: 3,
        title: "Research Paper",
        course: "English",
        priority: "Low",
        completed: false
    }
];

describe("Assignment Search and Filters", () => {

    test("should search assignments by title", () => {
        const result = filterAssignments(
            assignments, "Final"
        );

        expect(result).toEqual([assignments[0]]);
    });

    test("should search assignments by course", () => {
        const result = filterAssignments(
            assignments, "Mathematics"
        );

        expect(result).toEqual([assignments[1]]);
    });

    test("should ignore uppercase and lowercase", () => {
        const result = filterAssignments(
            assignments, "FINAL PROJECT"
        );

        expect(result).toEqual([assignments[0]]);
    });

    test("should ignore extra spaces", () => {
        const result = filterAssignments(
            assignments, "  Final  "
        );

        expect(result).toEqual([assignments[0]]);
    });

    test("should return all assignments for an empty search", () => {
        const result = filterAssignments(
            assignments, ""
        );

        expect(result).toEqual(assignments);
    });

    test("should return no results for an unknown search", () => {
        const result = filterAssignments(
            assignments, "Physics"
        );

        expect(result).toEqual([]);
    });

    test("should combine search with status filter", () => {
        const result = filterAssignments(
            assignments, "Calculus", "Completed"
        );

        expect(result).toEqual([assignments[1]]);
    });

    test("should combine search with priority filter", () => {
        const result = filterAssignments(
            assignments, "Final", "All", "High"
        );

        expect(result).toEqual([assignments[0]]);
    });

    test("should combine all three filters", () => {
        const result = filterAssignments(
            assignments, "Final", "Pending", "High"
        );

        expect(result).toEqual([assignments[0]]);
    });

    test("should exclude assignments that fail a filter", () => {
        const result = filterAssignments(
            assignments, "Final", "Completed", "High"
        );

        expect(result).toEqual([]);
    });

    test("should handle an empty assignment list", () => {
        expect(filterAssignments([], "Final")).toEqual([]);
    });

});
