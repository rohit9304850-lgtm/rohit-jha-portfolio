const Achievement = require("../models/Achievement");

// GET ALL ACHIEVEMENTS
const getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find().sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: achievements.length,
            data: achievements
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch achievements."
        });
    }
};


// ADD ACHIEVEMENT
const addAchievement = async (req, res) => {
    try {
        const {
            title,
            organization,
            date,
            description,
            credentialUrl
        } = req.body;

        if (!title || !organization || !date) {
            return res.status(400).json({
                success: false,
                message: "Title, organization and date are required."
            });
        }

        const achievement = await Achievement.create({
            title,
            organization,
            date,
            description,
            credentialUrl
        });

        res.status(201).json({
            success: true,
            message: "Achievement added successfully.",
            data: achievement
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add achievement."
        });
    }
};


// UPDATE ACHIEVEMENT
const updateAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Achievement updated successfully.",
            data: achievement
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update achievement."
        });
    }
};


// DELETE ACHIEVEMENT
const deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndDelete(
            req.params.id
        );

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Achievement deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete achievement."
        });
    }
};


module.exports = {
    getAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement
};