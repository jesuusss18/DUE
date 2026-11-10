
const { randomUUID } = require("crypto");

function createAssignment(data) {
    return {
        id: randomUUID(),
        title: data.title.trim(),
        course: (data.course || "").trim(),
        dueDate: data.dueDate,
        priority: data.priority || "Medium",
        completed: false,
        createdAt: new Date().toISOString()
    };
}

module.exports = { createAssignment };
