
/* =========================================
   ROHIT JHA — CENTRAL API CONFIGURATION
========================================= */

// =========================================
// API BASE URL
// =========================================

const isLocalDevelopment = [
    "localhost",
    "127.0.0.1"
].includes(window.location.hostname);

const DEFAULT_API_BASE_URL = isLocalDevelopment
    ? "http://localhost:5000/api"
    : "https://rohit-jha-portfolio.onrender.com/api";

const API_BASE_URL = (
    window.PORTFOLIO_API_BASE_URL ||
    DEFAULT_API_BASE_URL
).replace(/\/+$/, "");


// =========================================
// SAFE TOKEN ACCESS
// =========================================

function getAdminToken() {
    try {
        return sessionStorage.getItem("adminToken");
    } catch (error) {
        console.warn("Session storage is unavailable.");
        return null;
    }
}


// =========================================
// API HELPER
// =========================================

const API = {

    async request(endpoint, options = {}) {

        const token = getAdminToken();

        const headers = new Headers(options.headers || {});

        // Add JWT token when available
        if (token && !headers.has("Authorization")) {
            headers.set(
                "Authorization",
                `Bearer ${token}`
            );
        }

        // FormData must set its own multipart boundary
        const isFormData =
            typeof FormData !== "undefined" &&
            options.body instanceof FormData;

        // Set JSON content type for normal JSON requests
        if (
            options.body !== undefined &&
            options.body !== null &&
            !isFormData &&
            !headers.has("Content-Type")
        ) {
            headers.set(
                "Content-Type",
                "application/json"
            );
        }

        const normalizedEndpoint = endpoint.startsWith("/")
            ? endpoint
            : `/${endpoint}`;

        const requestUrl = `${API_BASE_URL}${normalizedEndpoint}`;

        try {

            const response = await fetch(requestUrl, {
                ...options,
                headers
            });

            // HANDLE API RESPONSE

            let data = {};

            if (response.status !== 204) {

                const contentType =
                    response.headers.get("content-type") || "";

                if (contentType.includes("application/json")) {

                    try {
                        data = await response.json();
                    } catch (error) {
                        throw new Error(
                            "Server returned an invalid JSON response."
                        );
                    }

                } else {

                    const responseText = await response.text();

                    data = responseText
                        ? { message: responseText }
                        : {};
                }
            }

            // HANDLE HTTP ERRORS

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    `Request failed with status ${response.status}.`
                );
            }

            return data;

        } catch (error) {

            console.error(
                `API Error [${endpoint}]:`,
                error
            );

            throw error;
        }
    },


    // =====================================
    // GET REQUEST
    // =====================================

    get(endpoint) {
        return this.request(endpoint);
    },


    // =====================================
    // POST REQUEST
    // =====================================

    post(endpoint, body) {

        const isFormData =
            typeof FormData !== "undefined" &&
            body instanceof FormData;

        return this.request(endpoint, {
            method: "POST",
            body: isFormData
                ? body
                : JSON.stringify(body)
        });
    },


    // =====================================
    // PUT REQUEST
    // =====================================

    put(endpoint, body) {

        const isFormData =
            typeof FormData !== "undefined" &&
            body instanceof FormData;

        return this.request(endpoint, {
            method: "PUT",
            body: isFormData
                ? body
                : JSON.stringify(body)
        });
    },


    // =====================================
    // DELETE REQUEST
    // =====================================

    delete(endpoint) {
        return this.request(endpoint, {
            method: "DELETE"
        });
    }

};


// =========================================
// GLOBAL API ACCESS
// =========================================

window.API = API;
