const API_BASE = "http://localhost:5000/api";

const token = sessionStorage.getItem("adminToken");

if (!token) {
    window.location.href = "login.html";
}

const skillForm = document.getElementById("skillForm");
const skillId = document.getElementById("skillId");
const skillName = document.getElementById("skillName");
const category = document.getElementById("category");
const proficiency = document.getElementById("proficiency");

const proficiencyValue = document.getElementById("proficiencyValue");
const skillsList = document.getElementById("skillsList");

const skillCount = document.getElementById("skillCount");
const categoryCount = document.getElementById("categoryCount");
const listCount = document.getElementById("listCount");

const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const messageBox = document.getElementById("messageBox");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Safely display text
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Display messages
function showMessage(element, message, type = "success") {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = "block";

    setTimeout(() => {
        element.style.display = "none";
    }, 3500);
}

// Update proficiency percentage
proficiency.addEventListener("input", () => {
    proficiencyValue.textContent = `${proficiency.value}%`;
});

// Load skills
async function loadSkills() {
    try {
        const response = await fetch(`${API_BASE}/skills`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load skills.");
        }

        const skills = result.data || [];

        skillCount.textContent = skills.length;
        listCount.textContent = `${skills.length} Skills`;

        const categories = new Set(
            skills.map(skill => skill.category)
        );

        categoryCount.textContent = categories.size;

        if (skills.length === 0) {
            skillsList.innerHTML = `
                <div class="empty-state">
                    <h3>No skills added yet.</h3>
                    <p>Add your first skill using the form.</p>
                </div>
            `;
            return;
        }

        skillsList.innerHTML = skills.map(skill => {
            const percentage = Math.min(
                100,
                Math.max(0, Number(skill.proficiency) || 0)
            );

            return `
                <div class="skill-card">

                    <div class="skill-card-top">
                        <div>
                            <h3>${escapeHTML(skill.name)}</h3>
                            <p class="skill-category">
                                ${escapeHTML(skill.category)}
                            </p>
                        </div>

                        <span class="skill-percentage">
                            ${percentage}%
                        </span>
                    </div>

                    <div class="progress-track">
                        <div
                            class="progress-fill"
                            style="width: ${percentage}%"
                        ></div>
                    </div>

                    <div class="skill-actions">
                        <button
                            class="edit-button"
                            data-action="edit"
                            data-id="${escapeHTML(skill._id)}"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            data-action="delete"
                            data-id="${escapeHTML(skill._id)}"
                        >
                            Delete
                        </button>
                    </div>

                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Skills loading error:", error);
        showMessage(messageBox, error.message, "error");
    }
}

// Reset form
function resetForm() {
    skillForm.reset();

    skillId.value = "";
    proficiency.value = 80;
    proficiencyValue.textContent = "80%";

    formTitle.textContent = "Add New Skill";
    saveBtn.textContent = "Save Skill";

    formMessage.style.display = "none";
}

// Add or update skill
skillForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = skillId.value;

    const skillData = {
        name: skillName.value.trim(),
        category: category.value,
        proficiency: Number(proficiency.value)
    };

    if (!skillData.name || !skillData.category) {
        showMessage(
            formMessage,
            "Please enter skill name and select category.",
            "error"
        );
        return;
    }

    const url = id
        ? `${API_BASE}/skills/${id}`
        : `${API_BASE}/skills`;

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
            body: JSON.stringify(skillData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to save skill.");
        }

        showMessage(
            messageBox,
            id ? "Skill updated successfully!" : "Skill added successfully!"
        );

        resetForm();
        await loadSkills();

    } catch (error) {
        showMessage(formMessage, error.message, "error");

    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = skillId.value
            ? "Update Skill"
            : "Save Skill";
    }
});

// Edit and delete skills
skillsList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        try {
            const response = await fetch(`${API_BASE}/skills`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error("Unable to fetch skill details.");
            }

            const skill = (result.data || []).find(
                item => item._id === id
            );

            if (!skill) {
                throw new Error("Skill not found.");
            }

            skillId.value = skill._id;
            skillName.value = skill.name;
            category.value = skill.category;
            proficiency.value = skill.proficiency;

            proficiencyValue.textContent = `${skill.proficiency}%`;

            formTitle.textContent = "Edit Skill";
            saveBtn.textContent = "Update Skill";

            skillForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            showMessage(messageBox, error.message, "error");
        }
    }

    if (action === "delete") {
        const confirmed = confirm(
            "Are you sure you want to delete this skill?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/skills/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete skill.");
            }

            showMessage(messageBox, "Skill deleted successfully!");

            if (skillId.value === id) {
                resetForm();
            }

            await loadSkills();

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
loadSkills();