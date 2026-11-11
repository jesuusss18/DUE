const calendarGrid = document.getElementById("calendarGrid");
const dayActivities = document.getElementById("dayActivities");
const calendarMessage = document.getElementById("calendarMessage");

const now = new Date();
let currentYear = now.getFullYear();
let currentMonth = now.getMonth();
let selectedDate = dateKey(now);
let activities = [];

function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function showError(message) {
    calendarMessage.textContent = message;
    calendarMessage.className = "calendar-message error";
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
        throw new Error("Authentication required.");
    }

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

    return data;
}

async function loadCalendarData() {
    try {
        const profile = await apiRequest("/api/auth/me");
        const user = profile.user;

        document.getElementById("sidebarName").textContent = user.name;
        document.getElementById("userAvatar").textContent =
            user.name.charAt(0).toUpperCase();

        const [tasks, exams] = await Promise.all([
            apiRequest("/api/assignments"),
            apiRequest("/api/exams")
        ]);

        if (!Array.isArray(tasks) || !Array.isArray(exams)) {
            throw new Error("Invalid calendar data.");
        }

        activities = [
            ...tasks.map(task => ({
                id: task.id,
                title: task.title,
                course: task.course || "",
                date: task.dueDate,
                type: "task",
                completed: task.completed
            })),
            ...exams.map(exam => ({
                id: exam.id,
                title: exam.title,
                course: exam.course || "",
                date: exam.examDate,
                type: "exam",
                location: exam.location || ""
            }))
        ];

        calendarMessage.textContent = "";
        renderCalendar();
    } catch (error) {
        showError(error.message);
    }
}

function renderCalendar() {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const firstWeekday = monthStart.getDay();
    const daysInMonth =
        new Date(currentYear, currentMonth + 1, 0).getDate();

    const monthName = monthStart.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    document.getElementById("monthTitle").textContent = monthName;
    calendarGrid.replaceChildren();

    const totalCells = Math.ceil(
        (firstWeekday + daysInMonth) / 7
    ) * 7;

    for (let index = 0; index < totalCells; index++) {
        const day = new Date(
            currentYear,
            currentMonth,
            index - firstWeekday + 1
        );

        const key = dateKey(day);
        const dayEvents = activities.filter(item => item.date === key);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.setAttribute(
            "aria-label",
            `${key}, ${dayEvents.length} activities`
        );
        button.setAttribute(
            "aria-pressed",
            String(key === selectedDate)
        );

        if (day.getMonth() !== currentMonth) {
            button.classList.add("other-month");
        }

        if (key === dateKey(new Date())) {
            button.classList.add("today");
        }

        if (key === selectedDate) {
            button.classList.add("selected");
        }

        const number = document.createElement("span");
        number.className = "day-number";
        number.textContent = day.getDate();

        const indicators = document.createElement("div");
        indicators.className = "day-indicators";

        dayEvents.slice(0, 2).forEach(item => {
            const indicator = document.createElement("span");
            indicator.className = `day-indicator ${item.type}`;
            indicator.textContent = item.title;
            indicators.appendChild(indicator);
        });

        if (dayEvents.length > 2) {
            const more = document.createElement("span");
            more.className = "more-indicator";
            more.textContent = `+${dayEvents.length - 2} more`;
            indicators.appendChild(more);
        }

        button.append(number, indicators);

        button.addEventListener("click", () => {
            selectedDate = key;
            currentYear = day.getFullYear();
            currentMonth = day.getMonth();
            renderCalendar();
        });

        calendarGrid.appendChild(button);
    }

    renderSelectedDay();
}

function renderSelectedDay() {
    const date = new Date(`${selectedDate}T12:00:00`);

    document.getElementById("selectedDateTitle").textContent =
        date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

    const events = activities.filter(item => item.date === selectedDate);

    document.getElementById("activityCount").textContent =
        `${events.length} activities`;

    dayActivities.replaceChildren();

    if (events.length === 0) {
        const empty = document.createElement("p");
        empty.className = "calendar-empty";
        empty.textContent = "Nothing scheduled for this day.";
        dayActivities.appendChild(empty);
        return;
    }

    events.forEach(event => {
        const item = document.createElement("article");
        item.className = "activity-item";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = event.title;

        const description = document.createElement("p");
        const extra = event.type === "task"
            ? (event.completed ? "Completed" : "Pending")
            : (event.location || "Location not specified");

        description.textContent =
            `${event.course || "No course"} · ${extra}`;

        details.append(title, description);

        const type = document.createElement("span");
        type.className = `activity-type ${event.type}`;
        type.textContent = event.type === "task" ? "Task" : "Exam";

        item.append(details, type);
        dayActivities.appendChild(item);
    });
}

function changeMonth(amount) {
    const next = new Date(currentYear, currentMonth + amount, 1);
    currentYear = next.getFullYear();
    currentMonth = next.getMonth();
    selectedDate = dateKey(next);
    renderCalendar();
}

document.getElementById("previousMonth").addEventListener(
    "click",
    () => changeMonth(-1)
);

document.getElementById("nextMonth").addEventListener(
    "click",
    () => changeMonth(1)
);

document.getElementById("todayButton").addEventListener(
    "click",
    () => {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();
        selectedDate = dateKey(today);
        renderCalendar();
    }
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
            showError("Could not log out. Please try again.");
        }
    }
);

loadCalendarData();
