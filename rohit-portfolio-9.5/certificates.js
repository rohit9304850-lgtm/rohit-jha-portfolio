
/* =========================================
   ROHIT JHA — DYNAMIC PUBLIC CERTIFICATES
========================================= */

// =========================================
// GET CERTIFICATES ARRAY
// =========================================

function getPublicCertificatesArray(response) {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.certificates)) {
        return response.certificates;
    }

    if (Array.isArray(response?.data?.certificates)) {
        return response.data.certificates;
    }

    return [];
}


// =========================================
// CERTIFICATE IMAGE FALLBACK
// =========================================

function createCertificateImageFallback() {
    const fallback = document.createElement("div");

    fallback.className = "public-certificate-image-fallback";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-award";

    fallback.appendChild(icon);

    return fallback;
}


// =========================================
// CERTIFICATE IMAGE
// =========================================

function createCertificateImage(certificate) {
    const imageWrapper = document.createElement("div");

    imageWrapper.className = "public-certificate-image-wrap";

    const imageUrl =
        typeof certificate.image === "string"
            ? certificate.image.trim()
            : "";

    if (!imageUrl) {
        imageWrapper.appendChild(
            createCertificateImageFallback()
        );

        return imageWrapper;
    }

    try {
        const parsedUrl = new URL(
            imageUrl,
            window.location.href
        );

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            imageWrapper.appendChild(
                createCertificateImageFallback()
            );

            return imageWrapper;
        }

        const image = document.createElement("img");

        image.className = "public-certificate-image";
        image.src = parsedUrl.href;
        image.alt = certificate.title
            ? `${certificate.title} certificate`
            : "Certificate image";

        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.replaceWith(
                createCertificateImageFallback()
            );
        });

        imageWrapper.appendChild(image);

    } catch (error) {
        imageWrapper.appendChild(
            createCertificateImageFallback()
        );
    }

    return imageWrapper;
}


// =========================================
// CREDENTIAL LINK
// =========================================

function createCertificateLink(url) {
    if (typeof url !== "string" || !url.trim()) {
        return null;
    }

    try {
        const parsedUrl = new URL(
            url.trim(),
            window.location.href
        );

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return null;
        }

        const link = document.createElement("a");

        link.className = "public-certificate-link";
        link.href = parsedUrl.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const icon = document.createElement("i");

        icon.className = "fa-solid fa-arrow-up-right-from-square";
        icon.setAttribute("aria-hidden", "true");

        link.append(
            icon,
            document.createTextNode(" View Credential")
        );

        return link;

    } catch (error) {
        console.warn("Invalid certificate URL:", url);

        return null;
    }
}


// =========================================
// CREATE CERTIFICATE CARD
// =========================================

function createPublicCertificateCard(certificate) {
    const card = document.createElement("article");

    card.className = "public-certificate-card";

    // Certificate image
    card.appendChild(
        createCertificateImage(certificate)
    );

    // Certificate information
    const info = document.createElement("div");

    info.className = "public-certificate-info";

    // Issuer and issue date
    const top = document.createElement("div");

    top.className = "public-certificate-top";

    const issuer = document.createElement("span");

    issuer.className = "public-certificate-issuer";
    issuer.textContent = certificate.issuer || "Certificate";

    top.appendChild(issuer);

    if (certificate.issueDate) {
        const date = document.createElement("span");

        date.className = "public-certificate-date";
        date.textContent = certificate.issueDate;

        top.appendChild(date);
    }

    info.appendChild(top);

    // Certificate title
    const title = document.createElement("h3");

    title.textContent =
        certificate.title || "Untitled Certificate";

    info.appendChild(title);

    // Certificate description
    if (certificate.description) {
        const description = document.createElement("p");

        description.className = "public-certificate-description";
        description.textContent = certificate.description;

        info.appendChild(description);
    }

    // Credential link
    const credentialLink = createCertificateLink(
        certificate.credentialUrl
    );

    if (credentialLink) {
        const actions = document.createElement("div");

        actions.className = "public-certificate-actions";
        actions.appendChild(credentialLink);

        info.appendChild(actions);
    }

    card.appendChild(info);

    return card;
}


// =========================================
// EMPTY CERTIFICATES PLACEHOLDER
// =========================================

function createCertificatesPlaceholder() {
    const placeholder = document.createElement("div");

    placeholder.className =
        "projects-placeholder certificates-empty";

    const iconWrapper = document.createElement("div");

    iconWrapper.className = "placeholder-icon";

    const icon = document.createElement("i");

    icon.className = "fa-solid fa-award";

    iconWrapper.appendChild(icon);

    const content = document.createElement("div");

    const title = document.createElement("h3");

    title.textContent = "Certificates will appear here";

    const description = document.createElement("p");

    description.textContent =
        "Courses, certifications, and credentials will be showcased here.";

    content.append(title, description);

    placeholder.append(iconWrapper, content);

    return placeholder;
}


// =========================================
// LOAD PUBLIC CERTIFICATES
// =========================================

async function loadCertificates() {
    const certificatesSection =
        document.getElementById("certificates");

    if (!certificatesSection || !window.API) {
        return;
    }

    const heading = certificatesSection.querySelector(
        ".section-heading"
    );

    if (!heading) {
        return;
    }

    try {
        const response = await API.get("/certificates");

        if (response?.success === false) {
            throw new Error(
                response.message || "Unable to load certificates."
            );
        }

        const certificates =
            getPublicCertificatesArray(response);

        // Remove old dynamic content and static placeholder
        certificatesSection.querySelectorAll(
            ".projects-placeholder, .public-certificate-grid"
        ).forEach((element) => {
            element.remove();
        });

        // Show placeholder when no certificates exist
        if (certificates.length === 0) {
            heading.after(
                createCertificatesPlaceholder()
            );

            console.log("No public certificates available.");

            return;
        }

        // Create certificates grid
        const grid = document.createElement("div");

        grid.className = "public-certificate-grid";

        certificates.forEach((certificate) => {
            grid.appendChild(
                createPublicCertificateCard(certificate)
            );
        });

        heading.after(grid);

        console.log(
            "Public certificates loaded successfully:",
            certificates.length
        );

    } catch (error) {
        console.error(
            "Certificates loading failed:",
            error
        );
    }
}


// =========================================
// LOAD CERTIFICATES WHEN PAGE OPENS
// =========================================

loadCertificates();
