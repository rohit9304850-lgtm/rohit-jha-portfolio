
const openPhotoButton = document.getElementById("openPhoto");
const photoModal = document.getElementById("photoModal");
const closePhotoButton = document.getElementById("closePhoto");

// ========================================
// PROFILE PHOTO MODAL
// ========================================

function openPhoto() {
    if (!photoModal || !closePhotoButton) return;

    photoModal.classList.add("is-open");
    photoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closePhotoButton.focus();
}

function closePhoto() {
    if (!photoModal) return;

    photoModal.classList.remove("is-open");
    photoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (openPhotoButton) {
        openPhotoButton.focus();
    }
}

if (openPhotoButton && photoModal && closePhotoButton) {
    openPhotoButton.addEventListener("click", openPhoto);
    closePhotoButton.addEventListener("click", closePhoto);

    photoModal.addEventListener("click", (event) => {
        if (event.target === photoModal) {
            closePhoto();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            photoModal.classList.contains("is-open")
        ) {
            closePhoto();
        }
    });
}


// ========================================
// DYNAMIC ABOUT SECTION
// ========================================

function updateAboutSection(aboutText) {
    if (typeof aboutText !== "string" || !aboutText.trim()) {
        return;
    }

    const aboutPanel = document.querySelector(
        "#about .about-panel"
    );

    if (!aboutPanel) return;

    const aboutContent = aboutPanel.querySelector(
        ".about-panel > div:last-child"
    );

    if (!aboutContent) return;

    // Split content into separate paragraphs
    const aboutTexts = aboutText
        .split(/\r?\n\s*\r?\n/)
        .map((text) => text.trim())
        .filter(Boolean);

    if (!aboutTexts.length) return;

    // Get existing paragraphs and highlight icon
    const existingParagraphs = Array.from(
        aboutContent.querySelectorAll(":scope > p")
    );

    const highlightTemplate = existingParagraphs.find(
        (paragraph) => paragraph.classList.contains("about-highlight")
    );

    const highlightIcon = highlightTemplate
        ? highlightTemplate.querySelector("i")
        : null;

    // Keep the last paragraph highlighted when there are
    // three or more paragraphs
    const highlightIndex =
        aboutTexts.length >= 3
            ? aboutTexts.length - 1
            : -1;

    aboutTexts.forEach((text, index) => {
        const isHighlight = index === highlightIndex;

        // Reuse existing paragraphs or create new ones
        const paragraph =
            existingParagraphs[index] ||
            document.createElement("p");

        paragraph.classList.toggle(
            "about-highlight",
            isHighlight
        );

        paragraph.style.display = "";

        paragraph.replaceChildren();

        if (isHighlight && highlightIcon) {
            paragraph.appendChild(highlightIcon.cloneNode(true));

            paragraph.appendChild(
                document.createTextNode(" " + text)
            );
        } else {
            paragraph.textContent = text;
        }

        // Add newly created paragraphs
        if (!existingParagraphs[index]) {
            aboutContent.appendChild(paragraph);
        }
    });

    // Remove unused old paragraphs
    existingParagraphs
        .slice(aboutTexts.length)
        .forEach((paragraph) => paragraph.remove());
}


// ========================================
// DYNAMIC PROFILE INTEGRATION
// ========================================

async function loadProfile() {
    try {
        const response = await API.get("/profile");

        const profile = response.data;

        // Keep existing static content if profile is unavailable
        if (!profile) return;


        // --------------------------------
        // UPDATE PROFILE IMAGES
        // --------------------------------

        if (profile.profileImage) {
            const profileImages = document.querySelectorAll(
                '#openPhoto img, #photoModal img'
            );

            profileImages.forEach((img) => {
                img.src = profile.profileImage;
            });
        }


        // --------------------------------
        // UPDATE SIDEBAR NAME
        // --------------------------------

        if (profile.name) {
            const sidebarName = document.querySelector(
                ".sidebar h1"
            );

            if (sidebarName) {
                sidebarName.textContent = profile.name;
            }
        }


        // --------------------------------
        // UPDATE SIDEBAR DESIGNATION
        // --------------------------------

        if (profile.designation) {
            const designation = document.querySelector(
                ".sidebar .role"
            );

            if (designation) {
                designation.textContent = profile.designation;
            }
        }


        // --------------------------------
        // UPDATE EMAIL
        // --------------------------------

        if (profile.email) {
            const emailLink = document.querySelector(
                '.sidebar a[href^="mailto:"]'
            );

            if (emailLink) {
                emailLink.href = `mailto:${profile.email}`;

                const emailText = emailLink.querySelector("strong");

                if (emailText) {
                    emailText.textContent = profile.email;
                }
            }
        }


        // --------------------------------
        // UPDATE PHONE
        // --------------------------------

        if (profile.phone) {
            const phoneLink = document.querySelector(
                '.sidebar a[href^="tel:"]'
            );

            if (phoneLink) {
                phoneLink.href = `tel:${profile.phone}`;

                const phoneText = phoneLink.querySelector("strong");

                if (phoneText) {
                    phoneText.textContent = profile.phone;
                }
            }
        }


        // --------------------------------
        // UPDATE LOCATION
        // --------------------------------

        if (profile.location) {
            const locationItem = document.querySelector(
                ".sidebar .contact-list .contact-item:last-child strong"
            );

            if (locationItem) {
                locationItem.textContent = profile.location;
            }
        }


        // --------------------------------
        // UPDATE SOCIAL LINKS
        // --------------------------------

        const socialLinks = document.querySelectorAll(
            ".sidebar .social-links a"
        );

        socialLinks.forEach((link) => {
            const href = link.href.toLowerCase();

            if (href.includes("github.com") && profile.github) {
                link.href = profile.github;
            }

            if (href.includes("linkedin.com") && profile.linkedin) {
                link.href = profile.linkedin;
            }
        });


        // --------------------------------
        // UPDATE HERO HEADING
        // --------------------------------

        const heroHeading = document.querySelector(
            ".hero-copy h2"
        );

        if (heroHeading && profile.headline?.trim()) {
            const words = profile.headline.trim().split(/\s+/);

            const highlightedText = words.splice(-2).join(" ");
            const normalText = words.join(" ");

            heroHeading.replaceChildren();

            if (normalText) {
                heroHeading.append(
                    document.createTextNode(normalText + " ")
                );
            }

            const highlight = document.createElement("span");

            highlight.className = "gradient-text";
            highlight.textContent = highlightedText;

            heroHeading.append(highlight);
        }


        // --------------------------------
        // UPDATE HERO DESCRIPTION
        // --------------------------------

        const heroDescription = document.querySelector(
            ".hero-copy .hero-description"
        );

        if (heroDescription && profile.subtitle) {
            heroDescription.textContent = profile.subtitle;
        }


        // --------------------------------
        // UPDATE ABOUT SECTION
        // --------------------------------

        updateAboutSection(profile.about);


        console.log("Profile loaded successfully.");

    } catch (error) {
        console.error("Profile loading failed:", error);
    }
}


// ========================================
// LOAD PROFILE WHEN PAGE OPENS
// ========================================

loadProfile();
