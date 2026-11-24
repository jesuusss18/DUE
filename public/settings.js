
const API_URL = "/api/settings";

const settingsForm = document.getElementById("settingsForm");
const emailReminders = document.getElementById("emailReminders");
const reminderTime = document.getElementById("reminderTime");
const timezone = document.getElementById("timezone");
const accountEmail = document.getElementById("accountEmail");
const reminderStatus = document.getElementById("reminderStatus");
const settingsMessage = document.getElementById("settingsMessage");
const saveButton = document.getElementById("saveSettingsButton");

let settingsLoaded = false;
let saving = false;

// Display a success or error message
function showMessage(text, isError = false) {
    settingsMessage.textContent = text;

    settingsMessage.className = isError
        ? "settings-message error"
        : "settings-message";
}

// Send requests to the backend
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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error || "Something went wrong."
        );
    }

    return data;
}

// Load user profile
async function loadProfile() {
    const result = await apiRequest("/api/auth/me");
    const user = result.user;

    document.getElementById("sidebarName").textContent =
        user.name;

    document.getElementById("userAvatar").textContent =
        user.name.charAt(0).toUpperCase();
}

// Populate available timezones
function populateTimezones(savedTimezone) {
    const defaultTimezones = [
        "America/Chicago",
        "America/New_York",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/Madrid",
        "Europe/Lisbon",
        "Europe/London",
        "Europe/Paris",
        "America/Sao_Paulo",
        "UTC"
    ];

    const supportedTimezones =
        typeof Intl.supportedValuesOf === "function"
            ? Intl.supportedValuesOf("timeZone")
            : [];

    const localTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    const availableTimezones = [
        ...new Set([
            ...defaultTimezones,
            ...supportedTimezones,
            localTimezone,
            savedTimezone
        ].filter(Boolean))
    ].sort();

    timezone.replaceChildren();

    availableTimezones.forEach(zone => {
        const option = document.createElement("option");

        option.value = zone;
        option.textContent = zone.replace(/_/g, " ");

        timezone.appendChild(option);
    });
}

// Update interface controls
function updateReminderStatus() {
    const enabled = emailReminders.checked;

    emailReminders.disabled = !settingsLoaded || saving;
    reminderTime.disabled = !settingsLoaded || saving || !enabled;
    timezone.disabled = !settingsLoaded || saving || !enabled;
    saveButton.disabled = !settingsLoaded || saving;

    if (!settingsLoaded) {
        reminderStatus.textContent =
            "Preferences are unavailable.";

        reminderStatus.className = "reminder-status";
        return;
    }

    reminderStatus.textContent = enabled
        ? "Email reminders are enabled."
        : "Email reminders are disabled.";

    reminderStatus.className = enabled
        ? "reminder-status enabled"
        : "reminder-status";
}

// Display saved preferences
function displaySettings(settings) {
    populateTimezones(settings.timezone);

    emailReminders.checked = settings.emailReminders;
    reminderTime.value = settings.reminderTime;
    timezone.value = settings.timezone;
    accountEmail.value = settings.email;

    settingsLoaded = true;

    updateReminderStatus();
}

// Load preferences from PostgreSQL
async function loadSettings() {
    const settings = await apiRequest(API_URL);

    displaySettings(settings);
}

// Update the interface when preferences change
emailReminders.addEventListener("change", () => {
    updateReminderStatus();
    showMessage("");
});

reminderTime.addEventListener("input", () => {
    showMessage("");
});

timezone.addEventListener("change", () => {
    showMessage("");
});

// Save preferences
settingsForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!settingsLoaded || saving) return;

    const preferences = {
        emailReminders: emailReminders.checked,
        reminderTime: reminderTime.value,
        timezone: timezone.value
    };

    saving = true;
    updateReminderStatus();

    saveButton.textContent = "Saving...";
    showMessage("");

    try {
        const result = await apiRequest(API_URL, {
            method: "PUT",
            body: JSON.stringify(preferences)
        });

        displaySettings(result.settings);

        showMessage("Preferences saved successfully.");

    } catch (error) {
        showMessage(error.message, true);

    } finally {
        saving = false;
        saveButton.textContent = "Save preferences";

        updateReminderStatus();
    }
});

// Logout
document.getElementById("logoutButton").addEventListener(
    "click",
    async () => {
        try {
            await apiRequest("/api/auth/logout", {
                method: "POST"
            });

            window.location.replace("/login.html");

        } catch (error) {
            showMessage(
                "Could not log out. Please try again.",
                true
            );
        }
    }
);

// Initialize page
async function initialize() {
    try {
        await loadProfile();
        await loadSettings();

    } catch (error) {
        updateReminderStatus();
        showMessage(error.message, true);
    }
}

initialize();
