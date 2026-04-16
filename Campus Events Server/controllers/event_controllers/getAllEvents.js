const { event: Event } = require('../../models');

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            order: [['event_date', 'ASC']]
        });
        return res.status(200).json(events);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = getAllEvents;