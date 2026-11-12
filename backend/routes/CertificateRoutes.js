const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getCertificates,
  addCertificate,
  updateCertificate,
  deleteCertificate,
} = require("../controllers/certificatecontroller");

// GET all certificates - Public
router.get("/", getCertificates);

// Protected routes - Admin only
router.post("/", protect, addCertificate);

router.put("/:id", protect, updateCertificate);

router.delete("/:id", protect, deleteCertificate);

module.exports = router;