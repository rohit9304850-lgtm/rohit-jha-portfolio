const imagekit = require("../config/imageKit");
const { toFile } = require("@imagekit/nodejs");

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image to upload."
            });
        }

        const response = await imagekit.files.upload({
            file: await toFile(
                req.file.buffer,
                req.file.originalname
            ),
            fileName: `${Date.now()}-${req.file.originalname}`,
            folder: "/portfolio",
            useUniqueFileName: true
        });

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully.",
            data: {
                url: response.url,
                fileId: response.fileId,
                name: response.name
            }
        });

    } catch (error) {
        console.error("Image upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Image upload failed."
        });
    }
};

module.exports = { uploadImage };