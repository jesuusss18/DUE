
require("dotenv").config();

const { sendEmail } = require("../src/services/emailService");

async function testEmail() {
    try {
        if (!process.env.TEST_EMAIL) {
            throw new Error("TEST_EMAIL is missing.");
        }

        await sendEmail({
            to: process.env.TEST_EMAIL,

            subject: "Welcome to DUE Notifications!",

            text: "DUE email notifications are working correctly.",

            html: `
                <div style="
                    background: #F8F9F6;
                    padding: 30px;
                    font-family: Arial, sans-serif;
                    color: #263D49;
                ">
                    <div style="
                        max-width: 500px;
                        margin: auto;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                    ">
                        <div style="
                            background: #263D49;
                            padding: 30px;
                            color: white;
                        ">
                            <h1 style="margin: 0;">
                                due<span style="color: #D9C6A5;">.</span>
                            </h1>

                            <p>Your deadlines, under control.</p>
                        </div>

                        <div style="padding: 30px;">
                            <h2>You're connected!</h2>

                            <p>Welcome to DUE Notifications.</p>

                            <p>
                                Our email service is working
                                successfully.
                            </p>

                            <p>
                                Soon, you will receive personalized
                                reminders about your upcoming
                                assignments and exams.
                            </p>

                            <p>
                                Stay organized. Stay ahead.
                            </p>

                            <strong>The DUE Team</strong>
                        </div>

                        <div style="
                            background: #F0F1ED;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                        ">
                            DUE | Student Planner
                        </div>
                    </div>
                </div>
            `
        });

        console.log("Test completed successfully.");

    } catch (error) {
        console.error("Email test failed:", error.message);
        process.exitCode = 1;
    }
}

testEmail();
