function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatDate(date) {
    if (!date) return "";

    return new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });
}

function createReminderEmail(user, decision) {
    if (!decision.shouldSend) {
        throw new Error("Reminder should not be sent.");
    }

    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");

    if (!["http:", "https:"].includes(new URL(appUrl).protocol)) {
        throw new Error("Invalid APP_URL.");
    }

    const name = user.name || "Student";
    const date = formatDate(decision.nextActivityDate);

    let subject;
    let message;

    if (decision.reminderType === "daily") {
        subject = "Your deadlines for tomorrow | DUE";
        message = `Here is your schedule for tomorrow, ${date}.`;

    } else if (decision.reminderType === "gap") {
        subject = "Your next deadline | DUE";
        message = `You have nothing scheduled tomorrow. Your next activity is on ${date}.`;

    } else if (decision.reminderType === "all_caught_up") {
        subject = "You're all caught up! | DUE";
        message = "You have no upcoming assignments or exams.";

    } else {
        throw new Error("Invalid reminder type.");
    }

    let text = `Hi, ${name}!\n\n${message}\n`;

    for (const task of decision.assignments || []) {
        text += `\nAssignment: ${task.title} - ${task.course} (${task.priority || "Medium"} priority)`;
    }

    for (const exam of decision.exams || []) {
        text += `\nExam: ${exam.title} - ${exam.course}`;

        if (exam.location) {
            text += ` - ${exam.location}`;
        }
    }

    text += "\n\nStay organized. Stay ahead.";

    const html = `
        <div style="font-family:Arial; background:#F8F9F6; max-width:550px; margin:auto;">
            <div style="background:#263D49; color:white; padding:25px;">
                <h1>due<span style="color:#D9C6A5;">.</span></h1>
                <p>Your deadlines, under control.</p>
            </div>

            <div style="padding:25px; color:#263D49;">
                <h2>${escapeHtml(subject.split(" | ")[0])}</h2>
                <p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>

                <a href="${escapeHtml(appUrl)}/dashboard.html"
                   style="background:#263D49; color:white; padding:12px; text-decoration:none;">
                    Open my planner
                </a>

                <p style="font-size:12px; margin-top:30px;">
                    <a href="${escapeHtml(appUrl)}/settings.html">
                        Manage email preferences
                    </a>
                </p>
            </div>
        </div>
    `;

    text += `\n\nOpen DUE: ${appUrl}/dashboard.html`;
    text += `\nSettings: ${appUrl}/settings.html`;

    return { subject, text, html };
}

module.exports = {
    createReminderEmail,
    escapeHtml,
    formatDate
};