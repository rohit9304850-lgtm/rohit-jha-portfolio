const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        organization: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        credentialUrl: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Achievement",
    achievementSchema
);