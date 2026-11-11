const pool = require("../config/database");

const fields = `
    id,
    title,
    course,
    to_char(exam_date, 'YYYY-MM-DD') AS "examDate",
    location,
    created_at AS "createdAt"
`;

async function getAllExams(userId) {
    const result = await pool.query(
        `SELECT ${fields}
         FROM exams
         WHERE user_id = $1
         ORDER BY exam_date ASC`,
        [userId]
    );

    return result.rows;
}

async function addExam(exam, userId) {
    const result = await pool.query(
        `INSERT INTO exams
         (id, user_id, title, course, exam_date, location)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${fields}`,
        [
            exam.id,
            userId,
            exam.title,
            exam.course,
            exam.examDate,
            exam.location
        ]
    );

    return result.rows[0];
}

async function updateExam(id, updates, userId) {
    const existing = await pool.query(
        `SELECT ${fields} FROM exams
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    if (!existing.rows[0]) return null;

    const exam = { ...existing.rows[0], ...updates };

    const result = await pool.query(
        `UPDATE exams
         SET title = $1,
             course = $2,
             exam_date = $3,
             location = $4
         WHERE id = $5 AND user_id = $6
         RETURNING ${fields}`,
        [
            exam.title,
            exam.course,
            exam.examDate,
            exam.location,
            id,
            userId
        ]
    );

    return result.rows[0] || null;
}

async function deleteExam(id, userId) {
    const result = await pool.query(
        `DELETE FROM exams
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
    );

    return result.rows[0] || null;
}

module.exports = {
    getAllExams,
    addExam,
    updateExam,
    deleteExam
};
