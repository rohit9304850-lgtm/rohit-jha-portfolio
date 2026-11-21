
const mongoose = require("mongoose");
const Message = require("../models/Message");

// ======================================
// CREATE NEW MESSAGE — PUBLIC
// ======================================

const createMessage = async (req, res) => {
    try {
        const {
            name,
            email,
            subject,
            message
        } = req.body || {};

        // Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Trim input values
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        // Required field validation
        if (
            !cleanName ||
            !cleanEmail ||
            !cleanSubject ||
            !cleanMessage
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields."
            });
        }

        // Length validation
        if (
            cleanName.length > 80 ||
            cleanEmail.length > 254 ||
            cleanSubject.length > 120 ||
            cleanMessage.length > 5000
        ) {
            return res.status(400).json({
                success: false,
                message: "One or more fields exceed the allowed length."
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Save message
        const savedMessage = await Message.create({
            name: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage
        });

        return res.status(201).json({
            success: true,
            message: "Your message has been sent successfully.",
            data: {
                id: savedMessage._id
            }
        });

    } catch (error) {
        console.error("Create message error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send your message. Please try again later."
        });
    }
};


// ======================================
// GET ALL MESSAGES — ADMIN ONLY
// ======================================

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .lean();

        const unreadCount = messages.filter(
            item => item.status === "new"
        ).length;

        return res.status(200).json({
            success: true,
            count: messages.length,
            unreadCount,
            data: messages
        });

    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch messages."
        });
    }
};


// ======================================
// UPDATE MESSAGE STATUS — ADMIN ONLY
// ======================================

const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID."
            });
        }

        if (!["new", "read"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be either new or read."
            });
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Message status updated successfully.",
            data: updatedMessage
        });

    } catch (error) {
        console.error("Update message status error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update message status."
        });
    }
};


// ======================================
// DELETE MESSAGE — ADMIN ONLY
// ======================================

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID."
            });
        }

        const deletedMessage = await Message.findByIdAndDelete(id);

        if (!deletedMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully."
        });

    } catch (error) {
        console.error("Delete message error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete message."
        });
    }
};


// ======================================
// EXPORT CONTROLLERS
// ======================================

module.exports = {
    createMessage,
    getMessages,
    updateMessageStatus,
    deleteMessage
};
