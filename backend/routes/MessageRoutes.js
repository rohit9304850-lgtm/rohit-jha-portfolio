
const express = require("express");
const router = express.Router();

const { rateLimit } = require("express-rate-limit");

const protect = require("../middleware/authMiddleware");

const {
    createMessage,
    getMessages,
    updateMessageStatus,
    deleteMessage
} = require("../controllers/messageController");


// ======================================
// PUBLIC MESSAGE RATE LIMITER
// ======================================

const contactMessageLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    // Maximum 5 submissions per IP per 15 minutes
    limit: 5,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message:
                "Too many messages submitted. Please try again after 15 minutes."
        });
    }
});


// ======================================
// PUBLIC ROUTE — SUBMIT MESSAGE
// ======================================

router.post(
    "/",
    contactMessageLimiter,
    createMessage
);


// ======================================
// ADMIN ROUTES — PROTECTED
// ======================================

// Fetch all messages
router.get("/", protect, getMessages);

// Update message read/unread status
router.patch(
    "/:id/status",
    protect,
    updateMessageStatus
);

// Delete message
router.delete(
    "/:id",
    protect,
    deleteMessage
);


module.exports = router;
