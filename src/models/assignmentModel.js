
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

// Get assignments belonging to the logged-in user
async function getAllAssignments(userId) {
    const result = await pool.query(
        `SELECT ${fields}
         FROM assignments
         WHERE user_id = $1
         ORDER BY due_date ASC`,
        [userId]
    );

    return result.rows;
}

// Find an assignment owned by the user
async function getAssignmentById(id, userId) {
    const result = await pool.query(
        `SELECT ${fields}
         FROM assignments
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    return result.rows[0] || null;
}

// Create an assignment for the logged-in user
async function addAssignment(assignment, userId) {
    const result = await pool.query(
        `INSERT INTO assignments
         (id, user_id, title, course, due_date, priority, completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${fields}`,
        [
            assignment.id,
            userId,
            assignment.title,
            assignment.course,
            assignment.dueDate,
            assignment.priority,
            assignment.completed
        ]
    );

    return result.rows[0];
}

// Update only an assignment owned by the user
async function updateAssignment(id, updates, userId) {
    const existing = await getAssignmentById(id, userId);

    if (!existing) {
        return null;
    }

    const updated = { ...existing, ...updates };

    const result = await pool.query(
        `UPDATE assignments
         SET title = $1,
             course = $2,
             due_date = $3,
             priority = $4,
             completed = $5
         WHERE id = $6 AND user_id = $7
         RETURNING ${fields}`,
        [
            updated.title,
            updated.course,
            updated.dueDate,
            updated.priority,
            updated.completed,
            id,
            userId
        ]
    );

    return result.rows[0] || null;
}

// Delete only an assignment owned by the user
async function deleteAssignment(id, userId) {
    const result = await pool.query(
        `DELETE FROM assignments
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
    );

    return result.rows[0] || null;
}

module.exports = {
    getAllAssignments,
    getAssignmentById,
    addAssignment,
    updateAssignment,
    deleteAssignment
};
