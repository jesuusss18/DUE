
const pool = require("../config/database");

// Create a new user
async function createUser(user) {
    const result = await pool.query(
        `INSERT INTO users (id, name, email, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, created_at`,
        [
            user.id,
            user.name,
            user.email,
            user.passwordHash
        ]
    );

    return result.rows[0];
}

// Find a user by email
async function findUserByEmail(email) {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0] || null;
}

// Find a user by ID
async function findUserById(id) {
    const result = await pool.query(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};
