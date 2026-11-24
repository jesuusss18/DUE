
require("dotenv").config();

const { google } = require("googleapis");
const http = require("http");
const crypto = require("crypto");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const state = crypto.randomBytes(32).toString("hex");

const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
        "https://www.googleapis.com/auth/gmail.send"
    ],
    login_hint: process.env.EMAIL_FROM,
    state
});

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost:3000");

    if (url.pathname !== "/oauth2callback") {
        res.writeHead(404);
        return res.end("Not found");
    }

    if (url.searchParams.get("state") !== state) {
        res.writeHead(400);
        return res.end("Invalid authorization state.");
    }

    const code = url.searchParams.get("code");

    if (!code) {
        res.writeHead(400);
        return res.end("Authorization failed.");
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
            throw new Error("No refresh token received.");
        }

        console.log("\nAuthorization successful!");
        console.log("\nCopy this value into your .env file:\n");
        console.log(
            "GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token
        );

        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end(
            "DUE authorization successful! You can close this window."
        );

    } catch (error) {
        console.error("Authorization failed:", error.message);

        res.writeHead(500);
        res.end("Authorization failed. Check your terminal.");

    } finally {
        server.close();
    }
});

server.listen(3000, "localhost", () => {
    console.log("\nOpen this URL in your browser:\n");
    console.log(authorizationUrl);
});
