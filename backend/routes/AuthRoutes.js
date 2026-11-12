const express = require("express");
const router = express.Router();

const { adminLogin } = require("../controllers/authController");

// Temporary route for testing
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth route is working!"
  });
});

// Admin login
router.post("/login", adminLogin);

module.exports = router;

console.log("AuthRoutes.js loaded successfully"); 