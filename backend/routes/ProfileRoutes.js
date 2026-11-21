
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getProfile,
    saveProfile
} = require("../controllers/ProfileController");

// Public profile reading
router.get("/", getProfile);

// Admin-only profile update
router.put("/", protect, saveProfile);

module.exports = router;
