const express = require("express");
const router = express.Router();

const {
    getAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement
} = require("../controllers/achievementController");

const protect = require("../middleware/authMiddleware");

// GET: All achievements (Public)
router.get("/", getAchievements);

// POST: Add achievement (Admin only)
router.post("/", protect, addAchievement);

// PUT: Update achievement (Admin only)
router.put("/:id", protect, updateAchievement);

// DELETE: Delete achievement (Admin only)
router.delete("/:id", protect, deleteAchievement);

module.exports = router;