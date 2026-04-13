const { user: User } = require('../models');

const updateOrganizerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Map 'rejected' from frontend to 'declined' to match ENUM in database
        const mappedStatus = status === 'rejected' ? 'declined' : status;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Organizer not found" });
        }

        if (user.role !== 'organizer') {
            return res.status(400).json({ success: false, message: "User is not an organizer" });
        }

        user.approval_status = mappedStatus;
        await user.save();

        return res.status(200).json({ success: true, message: `Organizer ${status} successfully`, user });
    } catch (error) {
        console.error("Error updating organizer status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = updateOrganizerStatus;