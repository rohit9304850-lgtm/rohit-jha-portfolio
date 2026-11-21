const Skill = require("../models/Skill");

// GET ALL SKILLS
const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({
            category: 1,
            name: 1
        });

        res.status(200).json({
            success: true,
            count: skills.length,
            data: skills
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch skills."
        });
    }
};


// ADD SKILL
const addSkill = async (req, res) => {
    try {
        const { name, category, proficiency } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: "Skill name and category are required."
            });
        }

        const skill = await Skill.create({
            name,
            category,
            proficiency
        });

        res.status(201).json({
            success: true,
            message: "Skill added successfully.",
            data: skill
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add skill."
        });
    }
};


// UPDATE SKILL
const updateSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Skill updated successfully.",
            data: skill
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update skill."
        });
    }
};


// DELETE SKILL
const deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(
            req.params.id
        );

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Skill deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete skill."
        });
    }
};


module.exports = {
    getSkills,
    addSkill,
    updateSkill,
    deleteSkill
};