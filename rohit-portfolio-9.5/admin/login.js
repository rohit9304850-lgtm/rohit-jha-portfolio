const API_BASE_URL = "http://localhost:5000/api";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const buttonText = document.getElementById("buttonText");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    errorMessage.textContent = "";
    loginBtn.disabled = true;
    buttonText.textContent = "Signing in...";

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Invalid email or password.");
        }

        if (!data.token) {
            throw new Error("Authentication token was not received.");
        }

        sessionStorage.setItem("adminToken", data.token);

        window.location.href = "dashboard.html";

    } catch (error) {
        errorMessage.textContent =
            error.message === "Failed to fetch"
                ? "Cannot connect to server. Please start the backend."
                : error.message;

    } finally {
        loginBtn.disabled = false;
        buttonText.textContent = "Sign In to Dashboard";
    }
});