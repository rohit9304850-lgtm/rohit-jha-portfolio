const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// Public routes
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Admin protected routes
router.post("/", protect, addProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;