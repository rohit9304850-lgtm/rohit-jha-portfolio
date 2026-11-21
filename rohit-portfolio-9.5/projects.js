
/* =========================================
   ROHIT JHA — DYNAMIC PUBLIC PROJECTS
========================================= */

// =========================================
// GET PROJECTS ARRAY
// =========================================

function getPublicProjectsArray(response) {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.projects)) {
        return response.projects;
    }

    if (Array.isArray(response?.data?.projects)) {
        return response.data.projects;
    }

    return [];
}


// =========================================
// EMPTY PROJECT PLACEHOLDER
// =========================================

function createProjectsPlaceholder() {
    const placeholder = document.createElement("div");

    placeholder.className = "projects-placeholder projects-empty";

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "placeholder-icon";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-code";

    iconWrapper.appendChild(icon);

    const content = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = "Projects are taking shape";

    const description = document.createElement("p");
    description.textContent =
        "New projects will appear here once added.";

    content.append(title, description);

    const badge = document.createElement("span");
    badge.className = "building-badge";
    badge.textContent = "COMING SOON";

    const badgeDot = document.createElement("span");
    badge.prepend(badgeDot);

    placeholder.append(iconWrapper, content, badge);

    return placeholder;
}


// =========================================
// PROJECT IMAGE FALLBACK
// =========================================

function createProjectImageFallback() {
    const fallback = document.createElement("div");

    fallback.className = "public-project-image-fallback";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-code";

    fallback.appendChild(icon);

    return fallback;
}


// =========================================
// PROJECT IMAGE
// =========================================

function createProjectImage(project) {
    const imageWrapper = document.createElement("div");

    imageWrapper.className = "public-project-image-wrap";

    const imageUrl =
        typeof project.image === "string"
            ? project.image.trim()
            : "";

    if (!imageUrl) {
        imageWrapper.appendChild(
            createProjectImageFallback()
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
                createProjectImageFallback()
            );

            return imageWrapper;
        }

        const image = document.createElement("img");

        image.className = "public-project-image";
        image.src = parsedUrl.href;
        image.alt = project.title
            ? `${project.title} project preview`
            : "Project preview";

        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.replaceWith(
                createProjectImageFallback()
            );
        });

        imageWrapper.appendChild(image);

    } catch (error) {
        imageWrapper.appendChild(
            createProjectImageFallback()
        );
    }

    return imageWrapper;
}


// =========================================
// PROJECT LINKS
// =========================================

function createProjectLink(url, label, iconClass, extraClass = "") {
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

        link.className = extraClass
            ? `public-project-link ${extraClass}`
            : "public-project-link";

        link.href = parsedUrl.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const icon = document.createElement("i");

        icon.className = iconClass;
        icon.setAttribute("aria-hidden", "true");

        link.append(
            icon,
            document.createTextNode(` ${label}`)
        );

        return link;

    } catch (error) {
        console.warn("Invalid project link:", url);

        return null;
    }
}


// =========================================
// CREATE PROJECT CARD
// =========================================

function createPublicProjectCard(project) {
    const card = document.createElement("article");

    card.className = "public-project-card";

    // Project image
    card.appendChild(
        createProjectImage(project)
    );


    // Project information
    const info = document.createElement("div");

    info.className = "public-project-info";


    // Category and featured badge
    const top = document.createElement("div");

    top.className = "public-project-top";

    const category = document.createElement("span");

    category.className = "public-project-category";

    category.textContent =
        project.category || "Web Development";

    top.appendChild(category);

    if (project.featured === true) {
        const featured = document.createElement("span");

        featured.className = "public-featured-tag";
        featured.textContent = "★ Featured Project";

        top.appendChild(featured);
    }

    info.appendChild(top);


    // Project title
    const title = document.createElement("h3");

    title.textContent =
        project.title || "Untitled Project";

    info.appendChild(title);


    // Project description
    const description = document.createElement("p");

    description.className = "public-project-description";

    description.textContent =
        project.description || "Project details coming soon.";

    info.appendChild(description);


    // Project technologies
    if (
        Array.isArray(project.technologies) &&
        project.technologies.length > 0
    ) {
        const technologies = document.createElement("div");

        technologies.className = "public-project-techs";

        project.technologies.forEach((technology) => {
            const tech = document.createElement("span");

            tech.className = "public-project-tech";
            tech.textContent = technology;

            technologies.appendChild(tech);
        });

        info.appendChild(technologies);
    }


    // GitHub and Live Demo links
    const actions = document.createElement("div");

    actions.className = "public-project-actions";

    const githubLink = createProjectLink(
        project.githubUrl,
        "GitHub",
        "fa-brands fa-github"
    );

    const liveLink = createProjectLink(
        project.liveUrl,
        "Live Demo",
        "fa-solid fa-arrow-up-right-from-square",
        "public-live-link"
    );

    if (githubLink) {
        actions.appendChild(githubLink);
    }

    if (liveLink) {
        actions.appendChild(liveLink);
    }

    if (actions.children.length > 0) {
        info.appendChild(actions);
    }


    card.appendChild(info);

    return card;
}


// =========================================
// LOAD PUBLIC PROJECTS
// =========================================

async function loadProjects() {
    const projectsSection = document.getElementById("projects");

    if (!projectsSection || !window.API) {
        return;
    }

    const heading = projectsSection.querySelector(
        ".section-heading"
    );

    if (!heading) {
        return;
    }

    try {
        const response = await API.get("/projects");

        if (response?.success === false) {
            throw new Error(
                response.message || "Unable to load projects."
            );
        }

        const projects = getPublicProjectsArray(response);


        // Remove previous dynamic project content
        projectsSection.querySelectorAll(
            ".projects-placeholder, .public-project-grid"
        ).forEach((element) => {
            element.remove();
        });


        // Show placeholder if no projects exist
        if (projects.length === 0) {
            heading.after(
                createProjectsPlaceholder()
            );

            console.log("No public projects available.");

            return;
        }


        // Create projects grid
        const grid = document.createElement("div");

        grid.className = "public-project-grid";


        // Create and append project cards
        projects.forEach((project) => {
            const card = createPublicProjectCard(project);

            grid.appendChild(card);
        });


        heading.after(grid);

        console.log(
            "Public projects loaded successfully:",
            projects.length
        );

    } catch (error) {
        console.error(
            "Projects loading failed:",
            error
        );
    }
}


// =========================================
// LOAD PROJECTS WHEN PAGE OPENS
// =========================================

loadProjects();
