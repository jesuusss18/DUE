const welcomeTitle = document.getElementById("welcomeTitle");
const sidebarName = document.getElementById("sidebarName");
const userAvatar = document.getElementById("userAvatar");
const upcomingList = document.getElementById("upcomingList");

function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

function getTodayString() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "same-origin"
    });

    if (response.status === 401) {
        window.location.replace("/login.html");
        throw new Error("Authentication required.");
    }

    if (!response.ok) {
        throw new Error("Could not load your information.");
    }

    return response.json();
}

async function loadDashboard() {
    try {
        const profile = await apiRequest("/api/auth/me");

        const user = profile.user;
        const firstName = user.name.split(" ")[0];

        welcomeTitle.textContent = `Good to see you, ${firstName}.`;
        sidebarName.textContent = user.name;
        userAvatar.textContent = firstName.charAt(0).toUpperCase();

        document.getElementById("todayDate").textContent =
            new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            });

        const assignments = await apiRequest("/api/assignments");

        const today = getTodayString();
        const nextWeek = addDays(today, 7);

        const completed = assignments.filter(
            assignment => assignment.completed
        );

        const upcoming = assignments.filter(
            assignment =>
                !assignment.completed &&
                assignment.dueDate >= today &&
                assignment.dueDate <= nextWeek
        );

        const active = assignments
            .filter(assignment => !assignment.completed)
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

        const completionRate = assignments.length
            ? Math.round((completed.length / assignments.length) * 100)
            : 0;

        document.getElementById("totalTasks").textContent =
            assignments.length;

        document.getElementById("upcomingTasks").textContent =
            upcoming.length;

        document.getElementById("completedTasks").textContent =
            completed.length;

        document.getElementById("completionRate").textContent =
            `${completionRate}%`;

        renderUpcoming(active.slice(0, 5));

    } catch (error) {
        console.error("Dashboard error:", error);

        upcomingList.replaceChildren();

        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent = "Could not load your dashboard. Please try again.";

        upcomingList.appendChild(message);
    }
}

function renderUpcoming(assignments) {
    upcomingList.replaceChildren();

    if (assignments.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent =
            "No upcoming assignments. You're all caught up!";

        upcomingList.appendChild(message);
        return;
    }

    assignments.forEach(assignment => {
        const item = document.createElement("div");
        item.className = "deadline-item";

        const marker = document.createElement("div");
        marker.className =
            `priority-marker ${assignment.priority.toLowerCase()}`;

        const info = document.createElement("div");
        info.className = "deadline-info";

        const title = document.createElement("strong");
        title.textContent = assignment.title;

        const course = document.createElement("span");
        course.textContent = assignment.course || "General";

        const date = document.createElement("span");
        date.className = "deadline-date";
        date.textContent = formatDate(assignment.dueDate);

        info.append(title, course);
        item.append(marker, info, date);
        upcomingList.appendChild(item);
    });
}

document.getElementById("logoutButton").addEventListener(
    "click",
    async () => {
        try {
            await apiRequest("/api/auth/logout", {
                method: "POST"
            });

            window.location.replace("/login.html");
        } catch (error) {
            console.error("Logout error:", error);
            alert("Could not log out. Please try again.");
        }
    }
);

loadDashboard();
