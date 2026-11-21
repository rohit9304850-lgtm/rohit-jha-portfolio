
/* =========================================
   ROHIT JHA — DYNAMIC PUBLIC SKILLS
========================================= */

const publicSkillCategoryConfig = [
    {
        id: "frontend",
        categories: ["frontend"],
        title: "Frontend Development",
        icon: "fa-solid fa-laptop-code"
    },
    {
        id: "backend-database",
        categories: ["backend", "database"],
        title: "Backend & Databases",
        icon: "fa-solid fa-server"
    },
    {
        id: "programming",
        categories: ["programming"],
        title: "Programming",
        icon: "fa-solid fa-terminal"
    },
    {
        id: "aiml",
        categories: ["aiml", "ai / machine learning", "ai/ml", "ai / ml"],
        title: "AI & Machine Learning",
        icon: "fa-solid fa-brain"
    },
    {
        id: "tools",
        categories: ["tools", "tools & technologies"],
        title: "Tools",
        icon: "fa-solid fa-screwdriver-wrench"
    },
    {
        id: "other",
        categories: ["other"],
        title: "Other Skills",
        icon: "fa-solid fa-layer-group"
    }
];


// =========================================
// SKILL ICON MAPPING
// =========================================

function getPublicSkillIcon(skillName) {
    const name = String(skillName || "")
        .trim()
        .toLowerCase();

    if (name === "c") {
        return { type: "text", value: "C" };
    }

    if (name === "c++") {
        return { type: "text", value: "C++" };
    }

    const iconMap = {
        "html": "fa-brands fa-html5",
        "html5": "fa-brands fa-html5",

        "css": "fa-brands fa-css3-alt",
        "css3": "fa-brands fa-css3-alt",

        "javascript": "fa-brands fa-js",
        "js": "fa-brands fa-js",

        "python": "fa-brands fa-python",

        "react": "fa-brands fa-react",
        "react.js": "fa-brands fa-react",

        "angular": "fa-brands fa-angular",
        "vue": "fa-brands fa-vuejs",
        "vue.js": "fa-brands fa-vuejs",

        "node": "fa-brands fa-node-js",
        "node.js": "fa-brands fa-node-js",
        "node js": "fa-brands fa-node-js",
        "nodejs": "fa-brands fa-node-js",

        "git": "fa-brands fa-git-alt",
        "github": "fa-brands fa-github",

        "docker": "fa-brands fa-docker",
        "php": "fa-brands fa-php",
        "bootstrap": "fa-brands fa-bootstrap",
        "linux": "fa-brands fa-linux",
        "aws": "fa-brands fa-aws",
        "figma": "fa-brands fa-figma",

        "mongodb": "fa-solid fa-database",
        "mysql": "fa-solid fa-database",
        "postgresql": "fa-solid fa-database",
        "postgres": "fa-solid fa-database",
        "sql": "fa-solid fa-table",

        "express": "fa-solid fa-code",
        "express.js": "fa-solid fa-code",
        "java": "fa-solid fa-mug-hot",

        "next.js": "fa-solid fa-code",
        "nextjs": "fa-solid fa-code",
        "typescript": "fa-solid fa-code",

        "machine learning": "fa-solid fa-brain",
        "artificial intelligence": "fa-solid fa-brain",
        "ai": "fa-solid fa-brain",
        "aiml": "fa-solid fa-brain",

        "power bi": "fa-solid fa-chart-column",
        "powerbi": "fa-solid fa-chart-column",

        "postman": "fa-solid fa-paper-plane",
        "vscode": "fa-solid fa-laptop-code",
        "vs code": "fa-solid fa-laptop-code",

        "firebase": "fa-solid fa-fire",
        "redis": "fa-solid fa-database",
        "tailwind css": "fa-solid fa-wind"
    };

    return {
        type: "icon",
        value: iconMap[name] || "fa-solid fa-code"
    };
}


// =========================================
// GET SKILLS ARRAY
// =========================================

function getPublicSkillsArray(response) {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.skills)) {
        return response.skills;
    }

    if (Array.isArray(response?.data?.skills)) {
        return response.data.skills;
    }

    return [];
}


// =========================================
// RESOLVE SKILL CATEGORY
// =========================================

function resolvePublicSkillCategory(category) {
    const normalizedCategory = String(category || "")
        .trim()
        .toLowerCase();

    const matchingGroup = publicSkillCategoryConfig.find(
        group => group.categories.includes(normalizedCategory)
    );

    if (matchingGroup) {
        return matchingGroup;
    }

    return {
        id: `custom-${normalizedCategory}`,
        categories: [normalizedCategory],
        title: category || "Other Skills",
        icon: "fa-solid fa-layer-group"
    };
}


// =========================================
// CREATE SKILL ICON
// =========================================

function createPublicSkillIcon(skillName) {
    const iconData = getPublicSkillIcon(skillName);

    if (iconData.type === "text") {
        const letterIcon = document.createElement("b");

        letterIcon.className = "letter-icon";
        letterIcon.textContent = iconData.value;

        return letterIcon;
    }

    const icon = document.createElement("i");

    icon.className = iconData.value;
    icon.setAttribute("aria-hidden", "true");

    return icon;
}


// =========================================
// CREATE SKILL TAG
// =========================================

function createPublicSkillTag(skill) {
    const tag = document.createElement("span");

    const name = String(skill.name || "Unnamed Skill").trim();

    const percentage = Math.min(
        100,
        Math.max(0, Number(skill.proficiency) || 0)
    );

    tag.title = `${name} — Proficiency: ${percentage}%`;

    tag.append(
        createPublicSkillIcon(name),
        document.createTextNode(` ${name}`)
    );

    return tag;
}


// =========================================
// CREATE SKILL GROUP
// =========================================

function createPublicSkillGroup(group, skills) {
    const card = document.createElement("div");

    card.className = "skill-group";

    const header = document.createElement("div");
    header.className = "skill-group-head";

    const categoryIcon = document.createElement("i");
    categoryIcon.className = group.icon;
    categoryIcon.setAttribute("aria-hidden", "true");

    const heading = document.createElement("h3");
    heading.textContent = group.title;

    header.append(categoryIcon, heading);

    const pills = document.createElement("div");
    pills.className = "skill-pills";

    skills.forEach(skill => {
        pills.appendChild(createPublicSkillTag(skill));
    });

    card.append(header, pills);

    return card;
}


// =========================================
// EMPTY SKILLS PLACEHOLDER
// =========================================

function createPublicSkillsPlaceholder() {
    const placeholder = document.createElement("div");

    placeholder.className = "projects-placeholder skills-empty";

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "placeholder-icon";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-laptop-code";

    iconWrapper.appendChild(icon);

    const content = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = "Skills are being updated";

    const description = document.createElement("p");
    description.textContent =
        "Your skills and technologies will appear here once added.";

    content.append(title, description);
    placeholder.append(iconWrapper, content);

    return placeholder;
}


// =========================================
// LOAD PUBLIC SKILLS
// =========================================

async function loadPublicSkills() {
    const skillsSection = document.getElementById("skills");

    if (!skillsSection || !window.API) {
        return;
    }

    const heading = skillsSection.querySelector(
        ".section-heading"
    );

    if (!heading) {
        return;
    }

    try {
        const response = await API.get("/skills");

        if (response?.success === false) {
            throw new Error(
                response.message || "Unable to load skills."
            );
        }

        const skills = getPublicSkillsArray(response);

        skillsSection.querySelectorAll(
            ".skills-groups, .skills-empty"
        ).forEach(element => element.remove());

        if (skills.length === 0) {
            const note = skillsSection.querySelector(".skills-note");

            if (note) note.remove();

            heading.after(createPublicSkillsPlaceholder());

            console.log("No public skills available.");
            return;
        }

        const groupedSkills = new Map();

        skills.forEach(skill => {
            const group = resolvePublicSkillCategory(skill.category);

            if (!groupedSkills.has(group.id)) {
                groupedSkills.set(group.id, {
                    config: group,
                    skills: []
                });
            }

            groupedSkills.get(group.id).skills.push(skill);
        });

        const orderedGroups = [];

        publicSkillCategoryConfig.forEach(group => {
            if (groupedSkills.has(group.id)) {
                orderedGroups.push(groupedSkills.get(group.id));
            }
        });

        groupedSkills.forEach((value, key) => {
            const isConfigured = publicSkillCategoryConfig.some(
                group => group.id === key
            );

            if (!isConfigured) {
                orderedGroups.push(value);
            }
        });

        const grid = document.createElement("div");
        grid.className = "skills-groups";

        orderedGroups.forEach(groupData => {
            grid.appendChild(
                createPublicSkillGroup(
                    groupData.config,
                    groupData.skills
                )
            );
        });

        heading.after(grid);

        console.log(
            "Public skills loaded successfully:",
            skills.length,
            "skills across",
            orderedGroups.length,
            "categories."
        );

    } catch (error) {
        console.error("Skills loading failed:", error);
    }
}


// =========================================
// LOAD SKILLS WHEN PAGE OPENS
// =========================================

loadPublicSkills();
