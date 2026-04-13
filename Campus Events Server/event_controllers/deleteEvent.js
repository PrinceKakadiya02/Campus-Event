const { event: Event } = require('../models');

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        // Check if the user is the organizer or an admin
        if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this event." });
        }

        await event.destroy();

        return res.status(200).json({ success: true, message: "Event deleted successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = deleteEvent;