
/* =========================================
   ROHIT JHA — PUBLIC CONTACT FORM
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const contactForm = document.getElementById("contactForm");
    const statusMessage = document.getElementById("contactFormStatus");
    const submitButton = document.getElementById("contactSubmitBtn");

    if (!contactForm || !statusMessage || !submitButton) {
        return;
    }


    // ======================================
    // DISPLAY FORM STATUS
    // ======================================

    function showContactStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `contact-form-status ${type}`;
        statusMessage.setAttribute("role", "status");
    }


    // ======================================
    // FORM SUBMISSION
    // ======================================

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        // Honeypot field for basic spam detection
        const honeypot = document.getElementById("contactWebsite");

        if (honeypot && honeypot.value.trim()) {
            contactForm.reset();

            showContactStatus(
                "Your message has been submitted successfully.",
                "success"
            );

            return;
        }


        // Collect form data
        const formData = {
            name: document.getElementById("contactName").value.trim(),
            email: document.getElementById("contactEmail").value.trim(),
            subject: document.getElementById("contactSubject").value.trim(),
            message: document.getElementById("contactMessage").value.trim()
        };


        // Basic empty field check
        if (
            !formData.name ||
            !formData.email ||
            !formData.subject ||
            !formData.message
        ) {
            showContactStatus(
                "Please fill in all required fields.",
                "error"
            );

            return;
        }


        // Disable button while sending
        submitButton.disabled = true;
        submitButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        statusMessage.className = "contact-form-status";
        statusMessage.textContent = "";


        try {

            // Submit message to backend
            const response = await API.post(
                "/messages",
                formData
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Unable to send your message."
                );
            }


            // Reset form after success
            contactForm.reset();

            showContactStatus(
                response.message || "Your message has been sent successfully!",
                "success"
            );

            console.log("Contact message submitted successfully.");

        } catch (error) {

            console.error("Contact form error:", error);

            showContactStatus(
                error.message || "Something went wrong. Please try again.",
                "error"
            );

        } finally {

            // Restore submit button
            submitButton.disabled = false;

            submitButton.innerHTML =
                'Send Message <i class="fa-regular fa-paper-plane"></i>';

        }
    });

});
