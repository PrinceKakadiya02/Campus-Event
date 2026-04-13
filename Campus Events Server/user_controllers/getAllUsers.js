const { user: User } = require('../models');

const getAllUsers = async (req, res) => {
    try {
        // Fetch all users, excluding passwords for security
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = getAllUsers;