const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("formMessage");

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `form-message ${type}`;
}

async function sendAuthRequest(endpoint, data) {
    const response = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
    }

    return result;
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = loginForm.querySelector("button");
        button.disabled = true;
        showMessage("");

        try {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            await sendAuthRequest("login", {
                email,
                password
            });

            showMessage("Login successful. Redirecting...", "success");

            window.location.assign("/dashboard.html");

        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
        }
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = registerForm.querySelector("button");
        button.disabled = true;
        showMessage("");

        try {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            await sendAuthRequest("register", {
                name,
                email,
                password
            });

            showMessage(
                "Account created successfully. Redirecting to login...",
                "success"
            );

            window.location.assign("/login.html");

        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
        }
    });
}
