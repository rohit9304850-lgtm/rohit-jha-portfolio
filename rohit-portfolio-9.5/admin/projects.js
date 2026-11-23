const API_BASE_URL = (window.PORTFOLIO_API_BASE_URL || (["localhost", "127.0.0.1"].includes(window.location.hostname) ? "http://localhost:5000/api" : "https://rohit-jha-portfolio.onrender.com/api"));

const token = sessionStorage.getItem("adminToken");

if (!token) {
    window.location.replace("login.html");
}


// ======================================
// ELEMENTS
// ======================================

const projectForm = document.getElementById("projectForm");
const projectFormSection = document.getElementById("projectFormSection");
const projectList = document.getElementById("projectList");

const addProjectBtn = document.getElementById("addProjectBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const logoutBtn = document.getElementById("logoutBtn");

const projectImage = document.getElementById("projectImage");
const imagePreview = document.getElementById("imagePreview");

const formStatus = document.getElementById("formStatus");
const imageStatus = document.getElementById("imageStatus");
const saveProjectBtn = document.getElementById("saveProjectBtn");

let uploadedImageUrl = "";


// ======================================
// LOGOUT
// ======================================

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.replace("login.html");
});


// ======================================
// HELPERS
// ======================================

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getProjectsArray(result) {
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result.projects)) return result.projects;
    return [];
}

function resetForm() {
    projectForm.reset();
    document.getElementById("projectId").value = "";
    uploadedImageUrl = "";
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    imageStatus.textContent = "";
    formStatus.textContent = "";
    document.getElementById("formTitle").textContent = "Add New Project";
    saveProjectBtn.textContent = "Save Project";
}


// ======================================
// OPEN AND CLOSE FORM
// ======================================

addProjectBtn.addEventListener("click", () => {
    resetForm();
    projectFormSection.classList.remove("hidden");
    projectFormSection.scrollIntoView({ behavior: "smooth" });
});

closeFormBtn.addEventListener("click", () => {
    projectFormSection.classList.add("hidden");
    resetForm();
});


// ======================================
// IMAGE PREVIEW
// ======================================

projectImage.addEventListener("change", () => {

    const file = projectImage.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        imageStatus.textContent = "Please select a valid image.";
        imageStatus.className = "status error";
        projectImage.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        imageStatus.textContent = "Image must be smaller than 5 MB.";
        imageStatus.className = "status error";
        projectImage.value = "";
        return;
    }

    imagePreview.src = URL.createObjectURL(file);
    imagePreview.classList.remove("hidden");

    imageStatus.textContent = "Image selected.";
    imageStatus.className = "status success";
});


// ======================================
// IMAGEKIT UPLOAD
// ======================================

async function uploadProjectImage() {

    const file = projectImage.files[0];

    if (!file) return uploadedImageUrl;

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.data?.url) {
        throw new Error(result.message || "Image upload failed.");
    }

    return result.data.url;
}


// ======================================
// LOAD PROJECTS
// ======================================

async function loadProjects() {

    projectList.innerHTML = '<p class="loading-text">Loading projects...</p>';

    try {

        const response = await fetch(`${API_BASE_URL}/projects`);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load projects.");
        }

        const projects = getProjectsArray(result);

        document.getElementById("projectTotal").textContent =
            `${projects.length} project(s)`;

        if (!projects.length) {
            projectList.innerHTML =
                '<p class="empty-text">No projects found. Add your first project!</p>';
            return;
        }

        projectList.innerHTML = projects.map(project => {

            const image = project.image || "https://placehold.co/600x350/171b25/f5c451?text=Project";

            return `
                <article class="project-card">

                    <img
                        class="project-image"
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(project.title)}"
                    >

                    <div class="project-info">

                        <span class="project-category">
                            ${escapeHTML(project.category || "Web Development")}
                        </span>

                        <h3>${escapeHTML(project.title)}</h3>

                        <p class="project-description">
                            ${escapeHTML(project.description)}
                        </p>

                        <p class="project-tech">
                            ${escapeHTML((project.technologies || []).join(" · "))}
                        </p>

                        ${project.featured
                            ? '<span class="featured-tag">Featured Project</span>'
                            : ''
                        }

                        <div class="project-actions">

                            <button
                                type="button"
                                class="edit-btn"
                                data-id="${escapeHTML(project._id)}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="delete-btn"
                                data-id="${escapeHTML(project._id)}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");

    } catch (error) {

        console.error("Load projects error:", error);

        projectList.innerHTML =
            '<p class="empty-text">Unable to load projects. Please try again.</p>';

    }
}


// ======================================
// EDIT PROJECT
// ======================================

projectList.addEventListener("click", async (event) => {

    const editButton = event.target.closest(".edit-btn");
    const deleteButton = event.target.closest(".delete-btn");

    if (editButton) {

        const id = editButton.dataset.id;

        try {

            const response = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(id)}`);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to fetch project.");
            }

            const project = result.data;

            document.getElementById("projectId").value = project._id;
            document.getElementById("title").value = project.title || "";
            document.getElementById("category").value = project.category || "";
            document.getElementById("description").value = project.description || "";
            document.getElementById("technologies").value =
                (project.technologies || []).join(", ");

            document.getElementById("githubUrl").value = project.githubUrl || "";
            document.getElementById("liveUrl").value = project.liveUrl || "";
            document.getElementById("featured").checked = Boolean(project.featured);

            uploadedImageUrl = project.image || "";

            if (uploadedImageUrl) {
                imagePreview.src = uploadedImageUrl;
                imagePreview.classList.remove("hidden");
            }

            document.getElementById("formTitle").textContent = "Edit Project";
            saveProjectBtn.textContent = "Update Project";

            formStatus.textContent = "";
            imageStatus.textContent = "";

            projectFormSection.classList.remove("hidden");
            projectFormSection.scrollIntoView({ behavior: "smooth" });

        } catch (error) {

            alert(error.message);

        }

        return;
    }


    // DELETE PROJECT
    if (deleteButton) {

        const id = deleteButton.dataset.id;

        if (!confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/projects/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Project deletion failed.");
            }

            await loadProjects();

        } catch (error) {

            alert(error.message);

        }

    }

});


// ======================================
// ADD / UPDATE PROJECT
// ======================================

projectForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    saveProjectBtn.disabled = true;
    saveProjectBtn.textContent = "Saving...";

    formStatus.textContent = "";

    try {

        // Upload selected image
        if (projectImage.files.length > 0) {

            imageStatus.textContent = "Uploading image...";

            uploadedImageUrl = await uploadProjectImage();

            imageStatus.textContent = "Image uploaded successfully.";
            imageStatus.className = "status success";

        }


        const projectData = {

            title: document.getElementById("title").value.trim(),

            category: document.getElementById("category").value.trim()
                || "Web Development",

            description: document.getElementById("description").value.trim(),

            technologies: document.getElementById("technologies").value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),

            image: uploadedImageUrl,

            githubUrl: document.getElementById("githubUrl").value.trim(),

            liveUrl: document.getElementById("liveUrl").value.trim(),

            featured: document.getElementById("featured").checked

        };


        const projectId = document.getElementById("projectId").value;

        const isEditing = Boolean(projectId);

        const endpoint = isEditing
            ? `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}`
            : `${API_BASE_URL}/projects`;


        const response = await fetch(endpoint, {

            method: isEditing ? "PUT" : "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(projectData)

        });


        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to save project.");
        }


        formStatus.textContent = isEditing
            ? "Project updated successfully!"
            : "Project added successfully!";

        formStatus.className = "status success";

        resetForm();

        projectFormSection.classList.add("hidden");

        await loadProjects();

    } catch (error) {

        console.error("Save project error:", error);

        formStatus.textContent = error.message;

        formStatus.className = "status error";

    } finally {

        saveProjectBtn.disabled = false;

        saveProjectBtn.textContent = "Save Project";

    }

});


// ======================================
// INITIALIZE
// ======================================

if (token) {
    loadProjects();
}