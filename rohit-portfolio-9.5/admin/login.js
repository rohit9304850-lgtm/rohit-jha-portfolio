
/* =========================================
   ROHIT JHA — ADMIN LOGIN
========================================= */

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const buttonText = document.getElementById("buttonText");
const errorMessage = document.getElementById("errorMessage");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        errorMessage.textContent = "";
        loginBtn.disabled = true;
        buttonText.textContent = "Signing in...";

        try {

            // Use centralized API configuration
            if (!window.API) {
                throw new Error("API configuration is not loaded.");
            }

            const data = await window.API.post("auth/login", {
                email,
                password
            });

            if (!data.token) {
                throw new Error(
                    "Authentication token was not received."
                );
            }

            sessionStorage.setItem("adminToken", data.token);

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("Admin Login Error:", error);

            errorMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : error.message;

        } finally {

            loginBtn.disabled = false;
            buttonText.textContent = "Sign In to Dashboard";

        }
    });
}
