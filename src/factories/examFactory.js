const { randomUUID } = require("crypto");

function createExam(data) {
    return {
        id: randomUUID(),
        title: data.title.trim(),
        course: (data.course || "").trim(),
        examDate: data.examDate,
        location: (data.location || "").trim()
    };
}

module.exports = { createExam };
