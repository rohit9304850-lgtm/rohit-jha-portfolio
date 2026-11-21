
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ======================================
// PRODUCTION PROXY CONFIGURATION
// ======================================

app.set("trust proxy", 1);


// ======================================
// CORS CONFIGURATION
// ======================================

const allowedOrigins = (
    process.env.FRONTEND_URL ||
    "http://localhost:5500,http://127.0.0.1:5500"
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
    }
}));


// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());


// ======================================
// IMPORT ROUTES
// ======================================

const certificateRoutes = require("./routes/certificateRoutes");
const authRoutes = require("./routes/AuthRoutes");
const projectRoutes = require("./routes/projectRoutes");
const uploadRoutes = require("./routes/UploadRoutes");
const profileRoutes = require("./routes/ProfileRoutes");

const achievementRoutes = require("./routes/AchievementRoutes");
const skillRoutes = require("./routes/SkillRoutes");
const messageRoutes = require("./routes/MessageRoutes");


// ======================================
// REGISTER ROUTES
// ======================================

app.use("/api/certificates", certificateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/achievements", achievementRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/messages", messageRoutes);


// ======================================
// DIRECT CHECK
// ======================================

app.get("/api/direct-check", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Main Express server is working!"
    });
});


// ======================================
// HOME ROUTE
// ======================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Rohit's Portfolio Backend is Running!"
    });
});


// ======================================
// HEALTH CHECK
// ======================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        database: mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
    });
});


// ======================================
// MONGODB CONNECTION
// ======================================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB Connected Successfully!");

    } catch (error) {
        console.error(
            "MongoDB Connection Failed:",
            error.message
        );

        process.exit(1);
    }
};


// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
