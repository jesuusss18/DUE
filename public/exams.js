const EXAMS_API = "/api/exams";

const examForm = document.getElementById("examForm");
const examFormPanel = document.getElementById("examFormPanel");
const examList = document.getElementById("examList");
const examMessage = document.getElementById("examMessage");

let exams = [];
let editingExamId = null;

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (response.status === 401) {
        window.location.replace("/login.html");
        throw new Error("Please log in again.");
    }

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
    }

    return data;
}

function showMessage(message, error = false) {
    examMessage.textContent = message;
    examMessage.className = error
        ? "exam-message error"
        : "exam-message";
}

function openExamForm(exam = null) {
    editingExamId = exam ? exam.id : null;
    examForm.reset();

    document.getElementById("examFormHeading").textContent =
        exam ? "Edit exam" : "Create a new exam";

    if (exam) {
        document.getElementById("examTitle").value = exam.title;
        document.getElementById("examCourse").value = exam.course || "";
        document.getElementById("examDate").value = exam.examDate;
        document.getElementById("examLocation").value =
            exam.location || "";
    }

    examFormPanel.hidden = false;
    examFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
    document.getElementById("examTitle").focus();
}

function closeExamForm() {
    examFormPanel.hidden = true;
    editingExamId = null;
    examForm.reset();
}

function updateExamStats() {
    const today = new Date().toLocaleDateString("en-CA");
    const todayLocal = [
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0")
    ].join("-");

    const upcoming = exams
        .filter(exam => exam.examDate >= todayLocal)
        .sort((a, b) => a.examDate.localeCompare(b.examDate));

    document.getElementById("totalExams").textContent =
        exams.length;
    document.getElementById("upcomingExams").textContent =
        upcoming.length;
    document.getElementById("nextExam").textContent =
        upcoming.length
            ? upcoming[0].examDate
            : "—";
}

function makeButton(text, className, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = className;
    button.addEventListener("click", callback);
    return button;
}

function displayExams() {
    examList.replaceChildren();

    document.getElementById("examCount").textContent =
        `${exams.length} exams`;

    if (exams.length === 0) {
        const empty = document.createElement("p");
        empty.className = "exam-empty";
        empty.textContent =
            "No exams scheduled yet. Add your first exam!";
        examList.appendChild(empty);
        updateExamStats();
        return;
    }

    exams.forEach(exam => {
        const item = document.createElement("article");
        item.className = "exam-item";

        const date = new Date(`${exam.examDate}T12:00:00`);

        const dateBox = document.createElement("div");
        dateBox.className = "exam-date-box";

        const day = document.createElement("strong");
        day.textContent = date.getDate();

        const month = document.createElement("span");
        month.textContent = date.toLocaleDateString("en-US", {
            month: "short"
        });

        dateBox.append(day, month);

        const details = document.createElement("div");
        details.className = "exam-details";

        const title = document.createElement("h3");
        title.textContent = exam.title;

        const course = document.createElement("p");
        course.textContent =
            `Course: ${exam.course || "Not specified"}`;

        const location = document.createElement("p");
        location.textContent =
            `Location: ${exam.location || "Not specified"}`;

        const fullDate = document.createElement("p");
        fullDate.textContent = `Date: ${exam.examDate}`;

        details.append(title, course, location, fullDate);

        const actions = document.createElement("div");
        actions.className = "exam-actions";

        const editButton = makeButton("Edit", "", () => {
            openExamForm(exam);
        });

        const deleteButton = makeButton(
            "Delete",
            "exam-delete",
            async () => {
                if (!confirm("Delete this exam?")) return;

                try {
                    await apiRequest(`${EXAMS_API}/${exam.id}`, {
                        method: "DELETE"
                    });

                    if (editingExamId === exam.id) {
                        closeExamForm();
                    }

                    await loadExams();
                    showMessage("Exam deleted.");
                } catch (error) {
                    showMessage(error.message, true);
                }
            }
        );

        actions.append(editButton, deleteButton);
        item.append(dateBox, details, actions);
        examList.appendChild(item);
    });

    updateExamStats();
}

async function loadExams() {
    try {
        const result = await apiRequest(EXAMS_API);

        if (!Array.isArray(result)) {
            throw new Error("Invalid exams response.");
        }

        exams = result;
        displayExams();
    } catch (error) {
        showMessage(error.message, true);
        examList.replaceChildren();
    }
}

examForm.addEventListener("submit", async event => {
    event.preventDefault();

    const data = {
        title: document.getElementById("examTitle").value.trim(),
        course: document.getElementById("examCourse").value.trim(),
        examDate: document.getElementById("examDate").value,
        location: document.getElementById("examLocation").value.trim()
    };

    if (!data.title || !data.examDate) {
        showMessage("Title and exam date are required.", true);
        return;
    }

    const saveButton = document.getElementById("saveExamButton");
    saveButton.disabled = true;

    try {
        await apiRequest(
            editingExamId
                ? `${EXAMS_API}/${editingExamId}`
                : EXAMS_API,
            {
                method: editingExamId ? "PUT" : "POST",
                body: JSON.stringify(data)
            }
        );

        closeExamForm();
        await loadExams();
        showMessage("Exam saved successfully.");
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        saveButton.disabled = false;
    }
});

document.getElementById("newExamButton").addEventListener(
    "click",
    () => openExamForm()
);

document.getElementById("cancelExamButton").addEventListener(
    "click",
    closeExamForm
);

document.getElementById("logoutButton").addEventListener(
    "click",
    async () => {
        try {
            await apiRequest("/api/auth/logout", {
                method: "POST"
            });
            window.location.replace("/login.html");
        } catch (error) {
            showMessage(error.message, true);
        }
    }
);

async function initialize() {
    try {
        const result = await apiRequest("/api/auth/me");
        const user = result.user;

        document.getElementById("sidebarName").textContent =
            user.name;
        document.getElementById("userAvatar").textContent =
            user.name.charAt(0).toUpperCase();

        await loadExams();
    } catch (error) {
        showMessage(error.message, true);
    }
}

initialize();
