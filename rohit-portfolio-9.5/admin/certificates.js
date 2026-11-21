const API_BASE_URL = "http://localhost:5000/api";

const token = sessionStorage.getItem("adminToken");

if (!token) {
    window.location.href = "login.html";
}

// DOM Elements
const certificatesList = document.getElementById("certificatesList");
const certificateCount = document.getElementById("certificateCount");

const modal = document.getElementById("certificateModal");
const form = document.getElementById("certificateForm");

const addCertificateBtn = document.getElementById("addCertificateBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

const saveBtn = document.getElementById("saveBtn");
const formTitle = document.getElementById("formTitle");

const imageInput = document.getElementById("certificateImage");
const imagePreview = document.getElementById("imagePreview");
const imageStatus = document.getElementById("imageStatus");

const messageBox = document.getElementById("messageBox");
const formMessage = document.getElementById("formMessage");

let editingCertificateId = null;
let currentImageUrl = "";

// Common request headers
function getHeaders() {
    return {
        "Authorization": `Bearer ${token}`
    };
}

// Show message
function showMessage(message, type = "success") {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}-message`;

    setTimeout(() => {
        messageBox.textContent = "";
    }, 4000);
}

// Form message
function showFormMessage(message, type = "error") {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}-message`;
}

// Load certificates
async function loadCertificates() {
    try {
        certificatesList.innerHTML =
            '<p class="loading-text">Loading certificates...</p>';

        const response = await fetch(
            `${API_BASE_URL}/certificates`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load certificates.");
        }

        const certificates = result.data || [];

        certificateCount.textContent =
            `${certificates.length} certificate(s)`;

        if (certificates.length === 0) {
            certificatesList.innerHTML = `
                <p class="empty-text">
                    No certificates found. Add your first certificate!
                </p>
            `;
            return;
        }

        certificatesList.innerHTML = certificates.map(certificate => `
            <article class="certificate-card">

                <img
                    src="${escapeHTML(certificate.image)}"
                    alt="${escapeHTML(certificate.title)}"
                    onerror="this.style.display='none'"
                >

                <div class="card-content">

                    <h3>${escapeHTML(certificate.title)}</h3>

                    <p class="card-issuer">
                        ${escapeHTML(certificate.issuer)}
                    </p>

                    <p class="card-date">
                        ${escapeHTML(certificate.issueDate)}
                    </p>

                    <p class="card-description">
                        ${escapeHTML(certificate.description || "No description added.")}
                    </p>

                    ${
                        certificate.credentialUrl
                            ? `<a
                                class="credential-link"
                                href="${escapeHTML(certificate.credentialUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >View Credential ↗</a>`
                            : ""
                    }

                    <div class="card-actions">

                        <button
                            class="edit-btn"
                            data-action="edit"
                            data-id="${escapeHTML(certificate._id)}"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            data-action="delete"
                            data-id="${escapeHTML(certificate._id)}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </article>
        `).join("");

    } catch (error) {
        certificatesList.innerHTML = `
            <p class="empty-text">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}

// Prevent HTML injection in displayed data
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Open modal
function openModal() {
    modal.classList.remove("hidden");
}

// Close modal
function closeModal() {
    modal.classList.add("hidden");
    resetForm();
}

// Reset form
function resetForm() {
    form.reset();

    editingCertificateId = null;
    currentImageUrl = "";

    formTitle.textContent = "Add New Certificate";
    saveBtn.textContent = "Save Certificate";

    imagePreview.src = "";
    imagePreview.classList.add("hidden");

    imageStatus.textContent = "No image selected.";
    formMessage.textContent = "";
}

// Add certificate
addCertificateBtn.addEventListener("click", () => {
    resetForm();
    openModal();
});

// Close modal events
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});

// Image preview
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showFormMessage("Please select a valid image.");
        imageInput.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showFormMessage("Image size must be less than 5 MB.");
        imageInput.value = "";
        return;
    }

    const previewUrl = URL.createObjectURL(file);

    imagePreview.src = previewUrl;
    imagePreview.classList.remove("hidden");

    imageStatus.textContent = file.name;
});

// Upload image to ImageKit
async function uploadCertificateImage(file) {
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(
        `${API_BASE_URL}/upload`,
        {
            method: "POST",
            headers: getHeaders(),
            body: formData
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed.");
    }

    if (!result.data || !result.data.url) {
        throw new Error("ImageKit did not return an image URL.");
    }

    return result.data.url;
}

// Save certificate
form.addEventListener("submit", async event => {
    event.preventDefault();

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
        showFormMessage("");

        const title = document.getElementById("title").value.trim();
        const issuer = document.getElementById("issuer").value.trim();
        const issueDate = document.getElementById("issueDate").value.trim();
        const credentialUrl = document.getElementById("credentialUrl").value.trim();
        const description = document.getElementById("description").value.trim();

        const imageFile = imageInput.files[0];

        if (!title || !issuer || !issueDate) {
            throw new Error("Please fill all required fields.");
        }

        let imageUrl = currentImageUrl;

        // Upload new image if selected
        if (imageFile) {
            saveBtn.textContent = "Uploading Image...";
            imageUrl = await uploadCertificateImage(imageFile);
        }

        if (!imageUrl) {
            throw new Error("Please select a certificate image.");
        }

        const certificateData = {
            title,
            issuer,
            issueDate,
            image: imageUrl,
            credentialUrl,
            description
        };

        const isEditing = Boolean(editingCertificateId);

        const url = isEditing
            ? `${API_BASE_URL}/certificates/${editingCertificateId}`
            : `${API_BASE_URL}/certificates`;

        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                ...getHeaders(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(certificateData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to save certificate.");
        }

        closeModal();

        showMessage(
            isEditing
                ? "Certificate updated successfully!"
                : "Certificate added successfully!"
        );

        await loadCertificates();

    } catch (error) {
        showFormMessage(error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = editingCertificateId
            ? "Update Certificate"
            : "Save Certificate";
    }
});

// Edit and Delete buttons
certificatesList.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const certificateId = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        await editCertificate(certificateId);
    }

    if (action === "delete") {
        await deleteCertificate(certificateId);
    }
});

// Edit certificate
async function editCertificate(id) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/certificates`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to fetch certificate.");
        }

        const certificate = (result.data || []).find(item => item._id === id);

        if (!certificate) {
            throw new Error("Certificate not found.");
        }

        resetForm();

        editingCertificateId = certificate._id;
        currentImageUrl = certificate.image;

        document.getElementById("title").value = certificate.title;
        document.getElementById("issuer").value = certificate.issuer;
        document.getElementById("issueDate").value = certificate.issueDate;
        document.getElementById("credentialUrl").value =
            certificate.credentialUrl || "";
        document.getElementById("description").value =
            certificate.description || "";

        if (certificate.image) {
            imagePreview.src = certificate.image;
            imagePreview.classList.remove("hidden");
            imageStatus.textContent = "Current certificate image";
        }

        formTitle.textContent = "Edit Certificate";
        saveBtn.textContent = "Update Certificate";

        openModal();

    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Delete certificate
async function deleteCertificate(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this certificate?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/certificates/${id}`,
            {
                method: "DELETE",
                headers: getHeaders()
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to delete certificate.");
        }

        showMessage("Certificate deleted successfully!");

        await loadCertificates();

    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Logout
logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "login.html";
});

// Initial load
loadCertificates();