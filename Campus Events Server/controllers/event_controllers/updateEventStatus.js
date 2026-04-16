const { event: Event } = require('../../models');

const updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Map 'rejected' from frontend to 'declined' to match ENUM in database
        const mappedStatus = status === 'rejected' ? 'declined' : status;

        const event = await Event.findByPk(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        event.approval_status = mappedStatus;
        await event.save();

        return res.status(200).json({ success: true, message: `Event ${status} successfully`, event });
    } catch (error) {
        console.error("Error updating event status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = updateEventStatus;