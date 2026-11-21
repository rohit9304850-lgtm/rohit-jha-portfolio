const API_BASE_URL = "http://localhost:5000/api";

const token = sessionStorage.getItem("adminToken");


// ======================================
// 1. AUTHENTICATION
// ======================================

if (!token) {
    window.location.replace("login.html");
}


// ======================================
// 2. LOGOUT
// ======================================

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.replace("login.html");
});


// ======================================
// 3. API RESPONSE HELPER
// ======================================

function getArray(data, key) {

    if (Array.isArray(data)) return data;

    if (Array.isArray(data.data)) return data.data;

    if (Array.isArray(data[key])) return data[key];

    return [];
}


// ======================================
// 4. DASHBOARD STATISTICS
// ======================================

async function loadStatistics() {

    try {

        const [projectsResponse, certificatesResponse] =
            await Promise.all([

                fetch(`${API_BASE_URL}/projects`),

                fetch(`${API_BASE_URL}/certificates`)

            ]);

        if (!projectsResponse.ok || !certificatesResponse.ok) {
            throw new Error("Unable to load statistics.");
        }

        const projectsData = await projectsResponse.json();
        const certificatesData = await certificatesResponse.json();

        const projects = getArray(projectsData, "projects");
        const certificates = getArray(certificatesData, "certificates");

        document.getElementById("projectCount").textContent =
            projects.length;

        document.getElementById("certificateCount").textContent =
            certificates.length;

    } catch (error) {

        console.error("Statistics error:", error);

        document.getElementById("projectCount").textContent = "—";
        document.getElementById("certificateCount").textContent = "—";

    }
}


// ======================================
// 5. PROFILE FORM ELEMENTS
// ======================================

const profileForm = document.getElementById("profileForm");

const profileImageInput = document.getElementById("profileImage");

const profilePreview = document.getElementById("profilePreview");

const uploadStatus = document.getElementById("uploadStatus");

const profileStatus = document.getElementById("profileStatus");

const saveProfileBtn = document.getElementById("saveProfileBtn");

let uploadedImageUrl = "";


// ======================================
// 6. LOAD EXISTING PROFILE
// ======================================

async function loadProfile() {

    try {

        const response = await fetch(`${API_BASE_URL}/profile`);

        if (!response.ok) {
            throw new Error("Unable to load profile.");
        }

        const result = await response.json();

        const profile = result.data;

        if (!profile) return;

        const fields = [
            "name",
            "designation",
            "headline",
            "subtitle",
            "about",
            "email",
            "phone",
            "location",
            "github",
            "linkedin",
            "website"
        ];

        fields.forEach((field) => {

            const input = document.getElementById(field);

            if (input) {
                input.value = profile[field] || "";
            }

        });

        uploadedImageUrl = profile.profileImage || "";

        if (uploadedImageUrl) {
            profilePreview.src = uploadedImageUrl;
        }

    } catch (error) {

        console.error("Profile loading error:", error);

        profileStatus.textContent = "Unable to load saved profile.";

        profileStatus.className = "form-status error";

    }
}


// ======================================
// 7. IMAGE PREVIEW
// ======================================

profileImageInput.addEventListener("change", () => {

    const file = profileImageInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        uploadStatus.textContent = "Please select an image file.";

        uploadStatus.className = "form-status error";

        profileImageInput.value = "";

        return;
    }

    if (file.size > 5 * 1024 * 1024) {

        uploadStatus.textContent = "Image must be smaller than 5 MB.";

        uploadStatus.className = "form-status error";

        profileImageInput.value = "";

        return;
    }

    profilePreview.src = URL.createObjectURL(file);

    uploadStatus.textContent = "Image selected. It will upload when you save.";

    uploadStatus.className = "form-status";

});


// ======================================
// 8. IMAGEKIT UPLOAD
// ======================================

async function uploadProfileImage() {

    const file = profileImageInput.files[0];

    if (!file) {
        return uploadedImageUrl;
    }

    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {

        method: "POST",

        headers: {
            "Authorization": `Bearer ${token}`
        },

        body: formData

    });

    const result = await response.json();

    if (!response.ok) {

        throw new Error(result.message || "Image upload failed.");

    }

    if (!result.data || !result.data.url) {

        throw new Error("Image URL was not returned by the server.");

    }

    return result.data.url;

}


// ======================================
// 9. SAVE PROFILE TO MONGODB
// ======================================

profileForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    profileStatus.textContent = "";
    uploadStatus.textContent = "";

    saveProfileBtn.disabled = true;

    saveProfileBtn.textContent = "Saving...";

    try {

        // Upload image first, if selected
        if (profileImageInput.files.length > 0) {

            uploadStatus.textContent = "Uploading image...";

            uploadedImageUrl = await uploadProfileImage();

            profilePreview.src = uploadedImageUrl;

            uploadStatus.textContent = "Image uploaded successfully.";

            uploadStatus.className = "form-status success";

        }


        // Collect profile data
        const profileData = {

            name: document.getElementById("name").value.trim(),

            designation: document.getElementById("designation").value.trim(),

            profileImage: uploadedImageUrl,

            headline: document.getElementById("headline").value.trim(),

            subtitle: document.getElementById("subtitle").value.trim(),

            about: document.getElementById("about").value.trim(),

            email: document.getElementById("email").value.trim(),

            phone: document.getElementById("phone").value.trim(),

            location: document.getElementById("location").value.trim(),

            github: document.getElementById("github").value.trim(),

            linkedin: document.getElementById("linkedin").value.trim(),

            website: document.getElementById("website").value.trim()

        };


        // Save to MongoDB
        const response = await fetch(`${API_BASE_URL}/profile`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify(profileData)

        });


        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message || "Profile save failed.");

        }


        profileStatus.textContent = "Profile saved successfully!";

        profileStatus.className = "form-status success";

        profileImageInput.value = "";

    } catch (error) {

        console.error("Profile save error:", error);

        profileStatus.textContent = error.message;

        profileStatus.className = "form-status error";

    } finally {

        saveProfileBtn.disabled = false;

        saveProfileBtn.textContent = "Save Profile Changes";

    }

});


// ======================================
// 10. INITIALIZE DASHBOARD
// ======================================

if (token) {

    loadStatistics();

    loadProfile();

}