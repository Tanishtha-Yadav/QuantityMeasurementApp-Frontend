import { login as apiLogin, register as apiRegister } from "./api.js";

const tabs = document.querySelectorAll(".auth-tab");
const forms = document.querySelectorAll(".auth-form");
const authMessage = document.getElementById("authMessage");
const textSwitchButtons = document.querySelectorAll(".text-btn");
const eyeButtons = document.querySelectorAll(".eye-btn");

function showMessage(text, type) {
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
}

function activateForm(targetId) {
    forms.forEach((form) => {
        form.classList.toggle("active", form.id === targetId);
    });

    tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.target === targetId);
    });

    showMessage("", "");
}

function setCurrentUser(user) {
    localStorage.setItem("qmCurrentUser", JSON.stringify({
        name: user.name || user.email,
        email: user.email,
        id: user.id,
    }));
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateForm(tab.dataset.target));
});

textSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => activateForm(button.dataset.target));
});

eyeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.input);

        if (!input) {
            return;
        }

        const hidden = input.type === "password";
        input.type = hidden ? "text" : "password";
        button.classList.toggle("showing", hidden);

        button.setAttribute(
            "aria-label",
            hidden ? "Hide password" : "Show password"
        );
    });
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showMessage("Please fill all login fields.", "error");
        return;
    }

    try {
        showMessage("Logging in...", "info");
        const response = await apiLogin(email, password);

        if (!response || !response.token) {
            showMessage("Invalid email or password.", "error");
            return;
        }

        // Store user info
        setCurrentUser({ email });
        showMessage("Login successful.", "success");
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);
    } catch (error) {
        console.error("Login error:", error);
        showMessage(`Login failed: ${error.message}`, "error");
    }
});

document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        showMessage("Please fill all signup fields.", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    try {
        showMessage("Creating account...", "info");
        const response = await apiRegister(name, email, password);

        if (!response) {
            showMessage("Registration failed.", "error");
            return;
        }

        showMessage("Signup successful. Please login.", "success");
        activateForm("loginForm");
        document.getElementById("loginEmail").value = email;
    } catch (error) {
        console.error("Registration error:", error);
        showMessage(`Signup failed: ${error.message}`, "error");
    }
});

const authToken = localStorage.getItem("qmAuthToken");
const currentUser = localStorage.getItem("qmCurrentUser");

if (authToken && currentUser) {
    window.location.href = "index.html";
}
