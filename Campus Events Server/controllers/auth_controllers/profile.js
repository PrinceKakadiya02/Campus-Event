const { user: User } = require('../../models');

const profile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'deleted_at', 'approval_status', 'is_deleted'] }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = profile;