
/* =========================================
   ROHIT JHA — ADMIN MESSAGES MANAGEMENT
========================================= */

// ======================================
// CONFIGURATION
// ======================================

const API_BASE = (window.PORTFOLIO_API_BASE_URL || (["localhost", "127.0.0.1"].includes(window.location.hostname) ? "http://localhost:5000/api" : "https://rohit-jha-portfolio.onrender.com/api"));
const token = sessionStorage.getItem("adminToken");

const messagesList = document.getElementById("messagesList");
const messageBox = document.getElementById("messageBox");

const totalMessageCount = document.getElementById("totalMessageCount");
const unreadMessageCount = document.getElementById("unreadMessageCount");
const readMessageCount = document.getElementById("readMessageCount");

const messageFilter = document.getElementById("messageFilter");
const refreshMessagesBtn = document.getElementById("refreshMessagesBtn");
const logoutBtn = document.getElementById("logoutBtn");

let allMessages = [];


// ======================================
// AUTHENTICATION
// ======================================

if (!token) {
    window.location.replace("login.html");
}


// ======================================
// SAFE HTML DISPLAY
// ======================================

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// ======================================
// MESSAGE NOTIFICATIONS
// ======================================

function showMessage(message, type = "success") {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
}


// ======================================
// API REQUEST HELPER
// ======================================

async function messageAPIRequest(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});

    headers.set("Authorization", `Bearer ${token}`);

    if (
        options.body !== undefined &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    try {
        const response = await fetch(
            `${API_BASE}${endpoint}`,
            {
                ...options,
                headers
            }
        );

        let result = {};

        if (response.status !== 204) {
            const contentType =
                response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                result = { message: text };
            }
        }

        if (response.status === 401) {
            sessionStorage.removeItem("adminToken");
            window.location.replace("login.html");

            throw new Error("Session expired. Please login again.");
        }

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message ||
                `Request failed with status ${response.status}.`
            );
        }

        return result;

    } catch (error) {
        console.error("Messages API error:", error);
        throw error;
    }
}


// ======================================
// FORMAT MESSAGE DATE
// ======================================

function formatMessageDate(dateValue) {
    if (!dateValue) {
        return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}


// ======================================
// UPDATE STATISTICS
// ======================================

function updateMessageStatistics() {
    const total = allMessages.length;

    const unread = allMessages.filter(
        item => item.status === "new"
    ).length;

    const read = allMessages.filter(
        item => item.status === "read"
    ).length;

    totalMessageCount.textContent = total;
    unreadMessageCount.textContent = unread;
    readMessageCount.textContent = read;
}


// ======================================
// RENDER EMPTY STATE
// ======================================

function renderEmptyState(filtered = false) {
    messagesList.innerHTML = `
        <div class="empty-state">
            <h3>
                ${filtered ? "No matching messages" : "Your inbox is empty"}
            </h3>

            <p>
                ${filtered
                    ? "There are no messages in this category."
                    : "Messages sent through your public portfolio will appear here."
                }
            </p>
        </div>
    `;
}


// ======================================
// RENDER MESSAGES
// ======================================

function renderMessages() {
    const filterValue = messageFilter.value;

    const filteredMessages = allMessages.filter(item => {
        if (filterValue === "all") {
            return true;
        }

        return item.status === filterValue;
    });

    if (filteredMessages.length === 0) {
        renderEmptyState(filterValue !== "all");
        return;
    }

    messagesList.innerHTML = filteredMessages.map(item => {
        const id = escapeHTML(item._id);
        const name = escapeHTML(item.name);
        const email = escapeHTML(item.email);
        const subject = escapeHTML(item.subject);
        const message = escapeHTML(item.message);

        const status = item.status === "read" ? "read" : "new";

        const statusLabel = status === "read" ? "Read" : "Unread";

        const statusActionLabel =
            status === "read" ? "Mark as Unread" : "Mark as Read";

        const initials = escapeHTML(
            String(item.name || "U")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map(word => word.charAt(0).toUpperCase())
                .join("")
        );

        const formattedDate = escapeHTML(
            formatMessageDate(item.createdAt)
        );

        const replySubject = encodeURIComponent(
            `Re: ${item.subject || "Your message"}`
        );

        return `
            <article class="message-card ${status}">

                <div class="message-card-header">

                    <div class="message-sender">

                        <div class="sender-avatar">
                            ${initials}
                        </div>

                        <div class="sender-details">

                            <h3>${name}</h3>

                            <a href="mailto:${email}">
                                ${email}
                            </a>

                        </div>

                    </div>

                    <span class="message-status ${status}">
                        ${statusLabel}
                    </span>

                </div>


                <h4 class="message-subject">
                    ${subject}
                </h4>

                <p class="message-date">
                    Received: ${formattedDate}
                </p>

                <div class="message-content">${message}</div>


                <div class="message-actions">

                    <a
                        class="message-action-button reply-button"
                        href="mailto:${email}?subject=${replySubject}"
                    >
                        Reply
                    </a>

                    <button
                        type="button"
                        class="message-action-button status-button"
                        data-action="toggle-status"
                        data-id="${id}"
                        ${!id ? "disabled" : ""}
                    >
                        ${statusActionLabel}
                    </button>

                    <button
                        type="button"
                        class="message-action-button delete-button"
                        data-action="delete"
                        data-id="${id}"
                        ${!id ? "disabled" : ""}
                    >
                        Delete
                    </button>

                </div>

            </article>
        `;
    }).join("");
}


// ======================================
// LOAD ALL MESSAGES
// ======================================

async function loadMessages(showLoading = true) {
    if (showLoading) {
        messagesList.innerHTML = `
            <div class="loading-state">
                Loading messages...
            </div>
        `;
    }

    refreshMessagesBtn.disabled = true;
    refreshMessagesBtn.textContent = "Refreshing...";

    try {
        const response = await messageAPIRequest("/messages");

        allMessages = Array.isArray(response.data)
            ? response.data
            : [];

        updateMessageStatistics();
        renderMessages();

        console.log(
            "Messages loaded successfully:",
            allMessages.length
        );

    } catch (error) {
        console.error("Message loading error:", error);

        messagesList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load messages</h3>
                <p>Please check your connection and try again.</p>
            </div>
        `;

        showMessage(error.message, "error");

    } finally {
        refreshMessagesBtn.disabled = false;
        refreshMessagesBtn.textContent = "↻ Refresh Messages";
    }
}


// ======================================
// UPDATE MESSAGE STATUS
// ======================================

async function toggleMessageStatus(id) {
    const message = allMessages.find(
        item => item._id === id
    );

    if (!message) {
        showMessage("Message not found.", "error");
        return;
    }

    const newStatus =
        message.status === "read" ? "new" : "read";

    try {
        const response = await messageAPIRequest(
            `/messages/${encodeURIComponent(id)}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        showMessage(
            response.message || "Message status updated."
        );

        await loadMessages(false);

    } catch (error) {
        showMessage(error.message, "error");
    }
}


// ======================================
// DELETE MESSAGE
// ======================================

async function deleteMessage(id) {
    const confirmed = confirm(
        "Are you sure you want to permanently delete this message?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await messageAPIRequest(
            `/messages/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        showMessage(
            response.message || "Message deleted successfully."
        );

        await loadMessages(false);

    } catch (error) {
        showMessage(error.message, "error");
    }
}


// ======================================
// MESSAGE ACTIONS
// ======================================

messagesList.addEventListener("click", async event => {
    const button = event.target.closest(
        "button[data-action]"
    );

    if (!button || button.disabled) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (!id) {
        return;
    }

    button.disabled = true;

    try {
        if (action === "toggle-status") {
            await toggleMessageStatus(id);
        }

        if (action === "delete") {
            await deleteMessage(id);
        }

    } finally {
        button.disabled = false;
    }
});


// ======================================
// FILTER MESSAGES
// ======================================

messageFilter.addEventListener("change", () => {
    renderMessages();
});


// ======================================
// REFRESH MESSAGES
// ======================================

refreshMessagesBtn.addEventListener("click", () => {
    loadMessages();
});


// ======================================
// LOGOUT
// ======================================

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.replace("login.html");
});


// ======================================
// INITIALIZE
// ======================================

if (token) {
    loadMessages();
}
