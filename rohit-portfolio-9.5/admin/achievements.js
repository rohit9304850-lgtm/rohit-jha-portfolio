const API_BASE = (window.PORTFOLIO_API_BASE_URL || (["localhost", "127.0.0.1"].includes(window.location.hostname) ? "http://localhost:5000/api" : "https://rohit-jha-portfolio.onrender.com/api"));

const token = sessionStorage.getItem("adminToken");

if (!token) {
    window.location.href = "login.html";
}

const achievementForm = document.getElementById("achievementForm");
const achievementId = document.getElementById("achievementId");
const achievementsList = document.getElementById("achievementsList");
const achievementCount = document.getElementById("achievementCount");

const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const messageBox = document.getElementById("messageBox");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Safely display user-provided text
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Display status messages
function showMessage(element, message, type = "success") {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = "block";

    setTimeout(() => {
        element.style.display = "none";
    }, 3500);
}

// Load achievements
async function loadAchievements() {
    try {
        const response = await fetch(`${API_BASE}/achievements`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load achievements.");
        }

        const achievements = result.data || [];

        achievementCount.textContent = achievements.length;

        if (achievements.length === 0) {
            achievementsList.innerHTML = `
                <div class="empty-state">
                    <h3>No achievements added yet.</h3>
                    <p>Add your first achievement using the form.</p>
                </div>
            `;
            return;
        }

        achievementsList.innerHTML = achievements.map((item) => `
            <div class="achievement-card">
                <div class="achievement-details">
                    <h3>${escapeHTML(item.title)}</h3>

                    <p class="achievement-organization">
                        ${escapeHTML(item.organization)}
                    </p>

                    <p class="achievement-date">
                        ${escapeHTML(item.date)}
                    </p>

                    <p class="achievement-description">
                        ${escapeHTML(item.description || "No description provided.")}
                    </p>

                    ${item.credentialUrl ? `
                        <a
                            class="achievement-credential"
                            href="${escapeHTML(item.credentialUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Credential
                        </a>
                    ` : ""}
                </div>

                <div class="achievement-actions">
                    <button
                        class="edit-button"
                        data-action="edit"
                        data-id="${escapeHTML(item._id)}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        data-action="delete"
                        data-id="${escapeHTML(item._id)}"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Achievement loading error:", error);
        showMessage(messageBox, error.message, "error");
    }
}

// Reset form
function resetForm() {
    achievementForm.reset();
    achievementId.value = "";
    formTitle.textContent = "Add New Achievement";
    saveBtn.textContent = "Save Achievement";
    formMessage.style.display = "none";
}

// Add or update achievement
achievementForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = achievementId.value;

    const achievementData = {
        title: document.getElementById("title").value.trim(),
        organization: document.getElementById("organization").value.trim(),
        date: document.getElementById("date").value,
        credentialUrl: document.getElementById("credentialUrl").value.trim(),
        description: document.getElementById("description").value.trim()
    };

    if (
        !achievementData.title ||
        !achievementData.organization ||
        !achievementData.date
    ) {
        showMessage(formMessage, "Please fill in all required fields.", "error");
        return;
    }

    const url = id
        ? `${API_BASE}/achievements/${id}`
        : `${API_BASE}/achievements`;

    const method = id ? "PUT" : "POST";

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(achievementData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to save achievement.");
        }

        showMessage(
            messageBox,
            id ? "Achievement updated successfully!" : "Achievement added successfully!"
        );

        resetForm();
        await loadAchievements();

    } catch (error) {
        showMessage(formMessage, error.message, "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = achievementId.value
            ? "Update Achievement"
            : "Save Achievement";
    }
});

// Edit or delete using event delegation
achievementsList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        try {
            const response = await fetch(`${API_BASE}/achievements`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error("Unable to fetch achievement details.");
            }

            const item = (result.data || []).find(
                (achievement) => achievement._id === id
            );

            if (!item) {
                throw new Error("Achievement not found.");
            }

            achievementId.value = item._id;
            document.getElementById("title").value = item.title;
            document.getElementById("organization").value = item.organization;
            document.getElementById("date").value = item.date;
            document.getElementById("credentialUrl").value = item.credentialUrl || "";
            document.getElementById("description").value = item.description || "";

            formTitle.textContent = "Edit Achievement";
            saveBtn.textContent = "Update Achievement";

            achievementForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            showMessage(messageBox, error.message, "error");
        }
    }

    if (action === "delete") {
        const confirmed = confirm(
            "Are you sure you want to delete this achievement?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/achievements/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete achievement.");
            }

            showMessage(messageBox, "Achievement deleted successfully!");
            await loadAchievements();

            if (achievementId.value === id) {
                resetForm();
            }

        } catch (error) {
            showMessage(messageBox, error.message, "error");
        }
    }
});

// Cancel editing
cancelBtn.addEventListener("click", resetForm);

// Logout
logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "login.html";
});

// Initial load
loadAchievements();