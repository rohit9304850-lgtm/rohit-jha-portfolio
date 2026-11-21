
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address."
            ]
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        status: {
            type: String,
            enum: ["new", "read"],
            default: "new"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Message", messageSchema);
