const Profile = require("../models/Profile");

// Get profile
const getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne();

        if (!profile) {
            return res.status(200).json({
                success: true,
                message: "Profile not created yet.",
                data: null
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch profile."
        });
    }
};


// Create or update profile
const saveProfile = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "designation",
            "profileImage",
            "headline",
            "subtitle",
            "about",
            "email",
            "phone",
            "location",
            "github",
            "linkedin",
            "website"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (!updates.name && !await Profile.findOne()) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        const profile = await Profile.findOneAndUpdate(
            {},
            { $set: updates },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Profile saved successfully.",
            data: profile
        });

    } catch (error) {
        console.error("Save profile error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to save profile."
        });
    }
};

module.exports = {
    getProfile,
    saveProfile
};