const Assignment = require("../models/assignmentModel");
const { createAssignment } = require("../factories/assignmentFactory");

function validDate(value) {
    if (typeof value !== "string") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(value + "T00:00:00Z");

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
}

function validateAssignment(data, partial = false) {
    if (!data || typeof data !== "object" ||
        Array.isArray(data)) return false;

    const allowed = [
        "title", "course", "dueDate", "priority", "completed"
    ];

    const keys = Object.keys(data);

    if (keys.some(key => !allowed.includes(key))) return false;
    if (partial && keys.length === 0) return false;

    if (!partial && (
        !("title" in data) || !("dueDate" in data)
    )) return false;

    if ("title" in data &&
        (typeof data.title !== "string" || !data.title.trim()))
        return false;

    if ("course" in data && typeof data.course !== "string")
        return false;

    if ("dueDate" in data && !validDate(data.dueDate))
        return false;

    if ("priority" in data &&
        !["Low", "Medium", "High"].includes(data.priority))
        return false;

    if ("completed" in data &&
        typeof data.completed !== "boolean")
        return false;

    return true;
}

async function getAssignments(req, res) {
    try {
        const assignments = await Assignment.getAllAssignments(req.user.id);
        res.json(assignments);
    } catch (error) {
        console.error("Get assignments error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

async function addAssignment(req, res) {
    if (!validateAssignment(req.body)) {
        return res.status(400).json({
            error: "Invalid assignment information"
        });
    }

    try {
        const assignment = createAssignment(req.body);
        const saved = await Assignment.addAssignment(assignment, req.user.id);

        res.status(201).json(saved);
    } catch (error) {
        console.error("Add assignment error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

async function updateAssignment(req, res) {
    if (!validateAssignment(req.body, true)) {
        return res.status(400).json({
            error: "Invalid update information"
        });
    }

    try {
        const updated = await Assignment.updateAssignment(
            req.params.id,
            req.body,
            req.user.id
        );

        if (!updated) {
            return res.status(404).json({
                error: "Assignment not found"
            });
        }

        res.json(updated);
    } catch (error) {
        console.error("Update assignment error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

async function deleteAssignment(req, res) {
    try {
        const deleted = await Assignment.deleteAssignment(
            req.params.id,
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                error: "Assignment not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Delete assignment error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

module.exports = {
    getAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment
};
