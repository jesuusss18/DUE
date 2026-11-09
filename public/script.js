
const API_URL = "/api/assignments";

const form = document.getElementById("assignmentForm");
const assignmentList = document.getElementById("assignmentList");

let assignments = [];

// Send requests to the backend
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        let message = "Something went wrong.";

        try {
            const data = await response.json();
            message = data.error || message;
        } catch {
            // Some errors do not return JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Load assignments from the server
async function loadAssignments() {
    try {
        assignments = await apiRequest(API_URL);
        displayAssignments();
    } catch (error) {
        console.error(error);
        assignmentList.textContent =
            "Could not load assignments. Please try again.";
    }
}

// Update dashboard statistics
function updateStats() {
    const completed = assignments.filter(
        task => task.completed
    ).length;

    document.getElementById("totalTasks").textContent =
        assignments.length;

    document.getElementById("pendingTasks").textContent =
        assignments.length - completed;

    document.getElementById("completedTasks").textContent =
        completed;
}

// Display assignments on the page
function displayAssignments() {
    assignmentList.innerHTML = "";

    if (assignments.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent =
            "No assignments yet. Add your first task!";

        assignmentList.appendChild(empty);
        updateStats();
        return;
    }

    assignments.forEach(assignment => {
        const card = document.createElement("div");

        card.className = assignment.completed
            ? "assignment completed"
            : "assignment";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = assignment.title;

        const course = document.createElement("p");
        course.textContent =
            `Course: ${assignment.course || "Not specified"}`;

        const due = document.createElement("p");
        due.textContent = `Due: ${assignment.dueDate}`;

        const priority = document.createElement("p");
        priority.textContent =
            `Priority: ${assignment.priority}`;

        details.append(title, course, due, priority);

        const actions = document.createElement("div");
        actions.className = "actions";

        // Edit assignment
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => {
            editAssignment(assignment.id);
        });

        // Complete or undo
        const completeBtn = document.createElement("button");
        completeBtn.className = "complete-btn";
        completeBtn.textContent = assignment.completed
            ? "Undo"
            : "Complete";

        completeBtn.addEventListener("click", async () => {
            try {
                await apiRequest(
                    `${API_URL}/${assignment.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            completed: !assignment.completed
                        })
                    }
                );

                await loadAssignments();
            } catch (error) {
                alert(error.message);
            }
        });

        // Delete assignment
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", async () => {
            if (!confirm("Delete this assignment?")) {
                return;
            }

            try {
                await apiRequest(
                    `${API_URL}/${assignment.id}`,
                    { method: "DELETE" }
                );

                await loadAssignments();
            } catch (error) {
                alert(error.message);
            }
        });

        actions.append(editBtn, completeBtn, deleteBtn);
        card.append(details, actions);
        assignmentList.appendChild(card);
    });

    updateStats();
}

// Create assignment
form.addEventListener("submit", async event => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const course = document.getElementById("course").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;

    if (!title || !dueDate) {
        alert("Please enter a title and due date.");
        return;
    }

    try {
        await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify({
                title,
                course,
                dueDate,
                priority
            })
        });

        form.reset();
        await loadAssignments();
    } catch (error) {
        alert(error.message);
    }
});

// Edit assignment through the API
async function editAssignment(id) {
    const assignment = assignments.find(
        task => task.id === id
    );

    if (!assignment) return;

    const title = prompt(
        "Edit assignment title:",
        assignment.title
    );

    if (title === null) return;

    if (!title.trim()) {
        alert("Assignment title cannot be empty.");
        return;
    }

    const course = prompt(
        "Edit course:",
        assignment.course
    );

    if (course === null) return;

    const dueDate = prompt(
        "Edit due date (YYYY-MM-DD):",
        assignment.dueDate
    );

    if (dueDate === null) return;

    const priority = prompt(
        "Edit priority (Low, Medium, High):",
        assignment.priority
    );

    if (priority === null) return;

    const validPriority = ["Low", "Medium", "High"].find(
        value =>
            value.toLowerCase() === priority.trim().toLowerCase()
    );

    if (!validPriority) {
        alert("Priority must be Low, Medium, or High.");
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                title: title.trim(),
                course: course.trim(),
                dueDate,
                priority: validPriority
            })
        });

        await loadAssignments();
        alert("Assignment updated successfully!");
    } catch (error) {
        alert(error.message);
    }
}

// Load assignments when the page opens
loadAssignments();
