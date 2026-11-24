
require("dotenv").config();

const { google } = require("googleapis");
const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, text, html }) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const gmail = google.gmail({
        version: "v1",
        auth: oauth2Client
    });

    const transporter = nodemailer.createTransport({
        streamTransport: true,
        buffer: true,
        newline: "windows"
    });

    const message = await transporter.sendMail({
        from: {
            name: process.env.EMAIL_FROM_NAME,
            address: process.env.EMAIL_FROM
        },
        to,
        subject,
        text,
        html
    });

    const raw = message.message.toString("base64url");

    const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw
        }
    });

    console.log("Email sent successfully.");

    return response.data;
}

module.exports = {
    sendEmail
};
