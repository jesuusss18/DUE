
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const User = require("../models/userModel");

function generateToken(user) {
    return jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "2h", algorithm: "HS256" }
    );
}

// Register a new user
async function register(req, res) {
    try {
        const { name, email, password } = req.body || {};

        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100 ||
            typeof email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            email.length > 255 ||
            typeof password !== "string" ||
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                error: "Please enter valid registration information."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser =
            await User.findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                error: "Email already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.createUser({
            id: randomUUID(),
            name: name.trim(),
            email: normalizedEmail,
            passwordHash
        });

        return res.status(201).json({
            message: "Account created successfully.",
            user
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Email already registered."
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            error: "Registration failed."
        });
    }
}

// Log in an existing user
async function login(req, res) {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }

        const user = await User.findUserByEmail(
            email.trim().toLowerCase()
        );

        const validPassword = user
            ? await bcrypt.compare(password, user.password_hash)
            : false;

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const token = generateToken(user);

        return res.json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "Login failed."
        });
    }
}

module.exports = {
    register,
    login
};
