
const Certificate = require("../models/Certificate");

// GET: Fetch all certificates
const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// POST: Add a new certificate
const addCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.create(req.body);

        res.status(201).json({
            success: true,
            message: "Certificate added successfully",
            data: certificate,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// PUT: Update certificate
const updateCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Certificate updated successfully",
            data: certificate,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE: Remove certificate
const deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndDelete(
            req.params.id
        );

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Certificate deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
};
