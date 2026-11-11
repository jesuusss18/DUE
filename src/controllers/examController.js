const Exam = require("../models/examModel");
const { createExam } = require("../factories/examFactory");

function validDate(value) {
    if (typeof value !== "string") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
}

function validateExam(data, partial = false) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return false;
    }

    const allowed = ["title", "course", "examDate", "location"];
    const keys = Object.keys(data);

    if (keys.some(key => !allowed.includes(key))) return false;
    if (partial && keys.length === 0) return false;

    if (!partial && (!("title" in data) || !("examDate" in data))) {
        return false;
    }

    if ("title" in data &&
        (typeof data.title !== "string" ||
         !data.title.trim() ||
         data.title.length > 255)) return false;

    if ("course" in data &&
        (typeof data.course !== "string" ||
         data.course.length > 255)) return false;

    if ("location" in data &&
        (typeof data.location !== "string" ||
         data.location.length > 255)) return false;

    if ("examDate" in data && !validDate(data.examDate)) {
        return false;
    }

    return true;
}

async function getExams(req, res) {
    try {
        const exams = await Exam.getAllExams(req.user.id);
        res.json(exams);
    } catch (error) {
        console.error("Get exams error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

async function addExam(req, res) {
    if (!validateExam(req.body)) {
        return res.status(400).json({
            error: "Invalid exam information"
        });
    }

    try {
        const exam = createExam(req.body);
        const saved = await Exam.addExam(exam, req.user.id);
        res.status(201).json(saved);
    } catch (error) {
        console.error("Add exam error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

async function updateExam(req, res) {
    if (!validateExam(req.body, true)) {
        return res.status(400).json({
            error: "Invalid update information"
        });
    }

    try {
        const updated = await Exam.updateExam(
            req.params.id,
            req.body,
            req.user.id
        );

        if (!updated) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        res.json(updated);
    } catch (error) {
        console.error("Update exam error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

async function deleteExam(req, res) {
    try {
        const deleted = await Exam.deleteExam(
            req.params.id,
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Delete exam error:", error);
        res.status(500).json({ error: "Database error" });
    }
}

module.exports = {
    getExams,
    addExam,
    updateExam,
    deleteExam
};
