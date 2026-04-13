const { event: Event } = require('../models');

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        // Check if the user is the organizer or an admin
        if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You are not authorized to update this event." });
        }

        const updatedEvent = await event.update(req.body);

        return res.status(200).json({ success: true, message: "Event updated successfully!", event: updatedEvent });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = updateEvent;