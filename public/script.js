
const form = document.getElementById("assignmentForm");
const assignmentList = document.getElementById("assignmentList");

let assignments = JSON.parse(
    localStorage.getItem("dueAssignments") || "[]"
);

function saveAssignments() {
    localStorage.setItem(
        "dueAssignments",
        JSON.stringify(assignments)
    );
}

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

        const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "Edit";

            editBtn.addEventListener("click", () => {
                editAssignment(assignment.id);
        });

        const completeBtn = document.createElement("button");
        completeBtn.className = "complete-btn";
        completeBtn.textContent = assignment.completed
            ? "Undo"
            : "Complete";

        completeBtn.addEventListener("click", () => {
            assignment.completed = !assignment.completed;
            saveAssignments();
            displayAssignments();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {
            const confirmed = confirm(
                "Are you sure you want to delete this assignment?"
            );

            if (!confirmed) return;

            assignments = assignments.filter(
                task => task.id !== assignment.id
            );

            saveAssignments();
            displayAssignments();
        });

        actions.append(editBtn,completeBtn, deleteBtn);
        card.append(details, actions);
        assignmentList.appendChild(card);
    });

    updateStats();
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const course = document.getElementById("course").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;

    if (!title || !dueDate) {
        alert("Please enter a title and due date.");
        return;
    }

    const assignment = {
        id: crypto.randomUUID(),
        title,
        course,
        dueDate,
        priority,
        completed: false
    };

    assignments.push(assignment);
    saveAssignments();
    displayAssignments();
    form.reset();
});

displayAssignments();


function editAssignment(id) {
    const assignment = assignments.find(
        task => task.id === id
    );

    if (!assignment) return;

    const newTitle = prompt(
        "Edit assignment title:",
        assignment.title
    );

    if (newTitle === null) return;

    if (!newTitle.trim()) {
        alert("Assignment title cannot be empty.");
        return;
    }

    const newCourse = prompt(
        "Edit course:",
        assignment.course
    );

    if (newCourse === null) return;

    const newDueDate = prompt(
        "Edit due date (YYYY-MM-DD):",
        assignment.dueDate
    );

    if (newDueDate === null) return;

    const dateIsValid =
        /^\d{4}-\d{2}-\d{2}$/.test(newDueDate) &&
        !Number.isNaN(Date.parse(newDueDate)) &&
        new Date(newDueDate + "T00:00:00")
            .toISOString()
            .slice(0, 10) === newDueDate;

    if (!dateIsValid) {
        alert("Please enter a valid date in YYYY-MM-DD format.");
        return;
    }

    const newPriority = prompt(
        "Edit priority (Low, Medium, High):",
        assignment.priority
    );

    if (newPriority === null) return;

    const priority = ["Low", "Medium", "High"].find(
        value => value.toLowerCase() === newPriority.trim().toLowerCase()
    );

    if (!priority) {
        alert("Priority must be Low, Medium, or High.");
        return;
    }

    assignment.title = newTitle.trim();
    assignment.course = newCourse.trim();
    assignment.dueDate = newDueDate;
    assignment.priority = priority;

    saveAssignments();
    displayAssignments();

    alert("Assignment updated successfully!");
}
