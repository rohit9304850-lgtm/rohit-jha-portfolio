
/* =========================================
   ROHIT JHA — DYNAMIC PUBLIC ACHIEVEMENTS
========================================= */

// =========================================
// GET ACHIEVEMENTS ARRAY
// =========================================

function getPublicAchievementsArray(response) {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.achievements)) {
        return response.achievements;
    }

    if (Array.isArray(response?.data?.achievements)) {
        return response.data.achievements;
    }

    return [];
}


// =========================================
// CREATE CREDENTIAL LINK
// =========================================

function createAchievementLink(url) {
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
        console.warn("Invalid achievement credential URL:", url);

        return null;
    }
}


// =========================================
// CREATE ACHIEVEMENT CARD
// =========================================

function createPublicAchievementCard(achievement) {
    const card = document.createElement("article");

    card.className = "highlight-card";

    // Achievement icon
    const iconWrapper = document.createElement("span");

    iconWrapper.className = "highlight-icon";

    const icon = document.createElement("i");

    icon.className = "fa-solid fa-trophy";

    iconWrapper.appendChild(icon);


    // Achievement title
    const title = document.createElement("h3");

    title.textContent =
        achievement.title || "Untitled Achievement";


    // Organization and date
    const metadata = document.createElement("p");

    const organization = achievement.organization || "";

    const date = achievement.date || "";

    if (organization && date) {
        metadata.textContent = `${organization} · ${date}`;
    } else {
        metadata.textContent = organization || date;
    }


    // Achievement description
    const description = document.createElement("p");

    description.textContent =
        achievement.description || "";


    // Build card
    card.append(iconWrapper, title);

    if (metadata.textContent) {
        card.appendChild(metadata);
    }

    if (achievement.description) {
        card.appendChild(description);
    }


    // Credential link
    const credentialLink = createAchievementLink(
        achievement.credentialUrl
    );

    if (credentialLink) {
        const actions = document.createElement("div");

        actions.style.marginTop = "14px";

        actions.appendChild(credentialLink);

        card.appendChild(actions);
    }

    return card;
}


// =========================================
// EMPTY ACHIEVEMENTS PLACEHOLDER
// =========================================

function createAchievementsPlaceholder() {
    const placeholder = document.createElement("div");

    placeholder.className =
        "projects-placeholder achievements-empty";

    const iconWrapper = document.createElement("div");

    iconWrapper.className = "placeholder-icon";

    const icon = document.createElement("i");

    icon.className = "fa-solid fa-trophy";

    iconWrapper.appendChild(icon);

    const content = document.createElement("div");

    const title = document.createElement("h3");

    title.textContent = "Achievements are on the way";

    const description = document.createElement("p");

    description.textContent =
        "Achievements and milestones will appear here once added.";

    content.append(title, description);

    placeholder.append(iconWrapper, content);

    return placeholder;
}


// =========================================
// LOAD PUBLIC ACHIEVEMENTS
// =========================================

async function loadAchievements() {
    const achievementsSection =
        document.getElementById("achievements");

    if (!achievementsSection || !window.API) {
        return;
    }

    const heading = achievementsSection.querySelector(
        ".section-heading"
    );

    if (!heading) {
        return;
    }

    try {
        const response = await API.get("/achievements");

        if (response?.success === false) {
            throw new Error(
                response.message || "Unable to load achievements."
            );
        }

        const achievements =
            getPublicAchievementsArray(response);


        // Remove previous dynamic and static content
        achievementsSection.querySelectorAll(
            ".highlights-grid, .projects-placeholder"
        ).forEach((element) => {
            element.remove();
        });


        // Empty state
        if (achievements.length === 0) {
            heading.after(
                createAchievementsPlaceholder()
            );

            console.log("No public achievements available.");

            return;
        }


        // Create achievements grid
        const grid = document.createElement("div");

        grid.className = "highlights-grid";


        // Create achievement cards
        achievements.forEach((achievement) => {
            grid.appendChild(
                createPublicAchievementCard(achievement)
            );
        });


        heading.after(grid);

        console.log(
            "Public achievements loaded successfully:",
            achievements.length
        );

    } catch (error) {
        console.error(
            "Achievements loading failed:",
            error
        );
    }
}


// =========================================
// LOAD ACHIEVEMENTS WHEN PAGE OPENS
// =========================================

loadAchievements();
