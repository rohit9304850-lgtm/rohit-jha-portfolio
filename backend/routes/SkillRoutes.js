const express = require("express");
const router = express.Router();

const {
    getSkills,
    addSkill,
    updateSkill,
    deleteSkill
} = require("../controllers/skillController");

const protect = require("../middleware/authMiddleware");

// GET: All skills (Public)
router.get("/", getSkills);

// POST: Add skill (Admin only)
router.post("/", protect, addSkill);

// PUT: Update skill (Admin only)
router.put("/:id", protect, updateSkill);

// DELETE: Delete skill (Admin only)
router.delete("/:id", protect, deleteSkill);

module.exports = router;