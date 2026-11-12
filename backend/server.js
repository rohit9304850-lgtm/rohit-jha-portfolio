const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const certificateRoutes = require("./routes/CertificateRoutes");
const authRoutes = require("./routes/AuthRoutes");
const projectRoutes = require("./routes/projectRoutes");

// Register Routes
app.use("/api/certificates", certificateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Direct Check
app.get("/api/direct-check", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Main Express server is working!"
    });
});

// Home Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Rohit's Portfolio Backend is Running!"
    });
});

// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        database: mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
    });
});

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB Connected Successfully!");

    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
    }
};

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});