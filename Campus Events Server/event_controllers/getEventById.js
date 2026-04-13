const { event: Event } = require('../models');

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        return res.status(200).json(event);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = getEventById;