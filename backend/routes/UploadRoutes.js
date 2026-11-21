const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { uploadImage } = require("../controllers/imageUploadController");

router.post("/", protect, upload.single("image"), uploadImage);

module.exports = router;