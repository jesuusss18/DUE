const pool = require("../config/database");

const fields = `
    id,
    title,
    course,
    to_char(due_date, 'YYYY-MM-DD') AS "dueDate",
    priority,
    completed,
    created_at AS "createdAt"
`;

async function getAllAssignments() {
    const result = await pool.query(
        `SELECT ${fields}
         FROM assignments
         ORDER BY due_date ASC`
    );

    return result.rows;
}

async function getAssignmentById(id) {
    const result = await pool.query(
        `SELECT ${fields}
         FROM assignments
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function addAssignment(assignment) {
    const result = await pool.query(
        `INSERT INTO assignments
         (id, title, course, due_date, priority, completed)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${fields}`,
        [
            assignment.id,
            assignment.title,
            assignment.course,
            assignment.dueDate,
            assignment.priority,
            assignment.completed
        ]
    );

    return result.rows[0];
}

async function updateAssignment(id, updates) {
    const existing = await getAssignmentById(id);

    if (!existing) return null;

    const updated = { ...existing, ...updates };

    const result = await pool.query(
        `UPDATE assignments
         SET title = $1,
             course = $2,
             due_date = $3,
             priority = $4,
             completed = $5
         WHERE id = $6
         RETURNING ${fields}`,
        [
            updated.title,
            updated.course,
            updated.dueDate,
            updated.priority,
            updated.completed,
            id
        ]
    );

    return result.rows[0] || null;
}

async function deleteAssignment(id) {
    const result = await pool.query(
        "DELETE FROM assignments WHERE id = $1",
        [id]
    );

    return result.rowCount > 0;
}

module.exports = {
    getAllAssignments,
    getAssignmentById,
    addAssignment,
    updateAssignment,
    deleteAssignment
};
