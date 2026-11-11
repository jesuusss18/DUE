const API_URL = "/api/assignments";

const form = document.getElementById("assignmentForm");
const formPanel = document.getElementById("taskFormPanel");
const assignmentList = document.getElementById("assignmentList");
const taskMessage = document.getElementById("taskMessage");

const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

let assignments = [];
let editingId = null;

function showMessage(text, isError = false) {
    taskMessage.textContent = text;
    taskMessage.className = isError
        ? "task-message error"
        : "task-message";
}

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
        throw new Error("Your session has expired.");
    }

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
    }

    return data;
}

async function loadProfile() {
    const result = await apiRequest("/api/auth/me");
    const user = result.user;

    document.getElementById("sidebarName").textContent = user.name;
    document.getElementById("userAvatar").textContent =
        user.name.charAt(0).toUpperCase();
}

function openForm(assignment = null) {
    editingId = assignment ? assignment.id : null;

    form.reset();

    document.getElementById("formHeading").textContent =
        assignment ? "Edit task" : "Create a new task";

    if (assignment) {
        document.getElementById("title").value = assignment.title;
        document.getElementById("course").value = assignment.course || "";
        document.getElementById("dueDate").value = assignment.dueDate;
        document.getElementById("priority").value = assignment.priority;
    }

    formPanel.hidden = false;
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("title").focus();
}

function closeForm() {
    formPanel.hidden = true;
    editingId = null;
    form.reset();
}

function updateStats() {
    const completed = assignments.filter(task => task.completed).length;
    const highPriority = assignments.filter(
        task => !task.completed && task.priority === "High"
    ).length;

    document.getElementById("totalTasks").textContent =
        assignments.length;
    document.getElementById("pendingTasks").textContent =
        assignments.length - completed;
    document.getElementById("completedTasks").textContent =
        completed;
    document.getElementById("highPriorityTasks").textContent =
        highPriority;
}

function makeButton(text, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = className;
    button.addEventListener("click", onClick);
    return button;
}

function displayAssignments() {
    assignmentList.replaceChildren();

    const status = statusFilter.value;
    const priority = priorityFilter.value;

    const filtered = assignments.filter(task => {
        const matchesStatus =
            status === "All" ||
            (status === "Pending" && !task.completed) ||
            (status === "Completed" && task.completed);

        const matchesPriority =
            priority === "All" || task.priority === priority;

        return matchesStatus && matchesPriority;
    });

    document.getElementById("visibleCount").textContent =
        `${filtered.length} of ${assignments.length} tasks`;

    if (filtered.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = assignments.length === 0
            ? "No assignments yet. Create your first task!"
            : "No tasks match your filters.";
        assignmentList.appendChild(empty);
        updateStats();
        return;
    }

    filtered.forEach(assignment => {
        const card = document.createElement("article");
        card.className = assignment.completed
            ? "task-item-card is-completed"
            : "task-item-card";

        const marker = document.createElement("div");
        marker.className =
            `task-priority-line ${assignment.priority.toLowerCase()}`;

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = assignment.title;

        const course = document.createElement("p");
        course.textContent =
            `Course: ${assignment.course || "Not specified"}`;

        const due = document.createElement("p");
        due.textContent = `Due: ${assignment.dueDate}`;

        const priority = document.createElement("p");
        priority.textContent = `Priority: ${assignment.priority}`;

        details.append(title, course, due, priority);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = makeButton(
            assignment.completed ? "Undo" : "Complete",
            "complete-action",
            async () => {
                try {
                    await apiRequest(`${API_URL}/${assignment.id}`, {
                        method: "PUT",
                        body: JSON.stringify({
                            completed: !assignment.completed
                        })
                    });
                    await loadAssignments();
                    showMessage("Task status updated.");
                } catch (error) {
                    showMessage(error.message, true);
                }
            }
        );

        const editButton = makeButton("Edit", "", () => {
            openForm(assignment);
        });

        const deleteButton = makeButton(
            "Delete",
            "delete-action",
            async () => {
                if (!confirm("Delete this task?")) return;

                try {
                    await apiRequest(`${API_URL}/${assignment.id}`, {
                        method: "DELETE"
                    });
                    if (editingId === assignment.id) closeForm();
                    await loadAssignments();
                    showMessage("Task deleted.");
                } catch (error) {
                    showMessage(error.message, true);
                }
            }
        );

        actions.append(completeButton, editButton, deleteButton);
        card.append(marker, details, actions);
        assignmentList.appendChild(card);
    });

    updateStats();
}

async function loadAssignments() {
    try {
        assignments = await apiRequest(API_URL);
        displayAssignments();
    } catch (error) {
        showMessage(error.message, true);
        assignmentList.replaceChildren();
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const data = {
        title: document.getElementById("title").value.trim(),
        course: document.getElementById("course").value.trim(),
        dueDate: document.getElementById("dueDate").value,
        priority: document.getElementById("priority").value
    };

    if (!data.title || !data.dueDate) {
        showMessage("Title and due date are required.", true);
        return;
    }

    const saveButton = document.getElementById("saveTaskButton");
    saveButton.disabled = true;

    try {
        await apiRequest(
            editingId ? `${API_URL}/${editingId}` : API_URL,
            {
                method: editingId ? "PUT" : "POST",
                body: JSON.stringify(data)
            }
        );

        closeForm();
        await loadAssignments();
        showMessage("Task saved successfully.");
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        saveButton.disabled = false;
    }
});

document.getElementById("newTaskButton").addEventListener(
    "click",
    () => openForm()
);

document.getElementById("cancelTaskButton").addEventListener(
    "click",
    closeForm
);

statusFilter.addEventListener("change", displayAssignments);
priorityFilter.addEventListener("change", displayAssignments);

document.getElementById("logoutButton").addEventListener(
    "click",
    async () => {
        try {
            await apiRequest("/api/auth/logout", {
                method: "POST"
            });
            window.location.replace("/login.html");
        } catch (error) {
            showMessage("Could not log out. Please try again.", true);
        }
    }
);

async function initialize() {
    try {
        await loadProfile();
        await loadAssignments();

        const params = new URLSearchParams(window.location.search);
        if (params.get("new") === "1") {
            openForm();
        }
    } catch (error) {
        showMessage(error.message, true);
    }
}

initialize();
