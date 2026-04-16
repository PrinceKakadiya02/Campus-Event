const { event: Event } = require('../../models');

const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            time,
            registration_deadline,
            team_size,
            location
        } = req.body;

        // Validate required fields
        if (!title || !description || !category || !date || !time || !location) {
            return res.status(400).json({ success: false, message: "Please fill in all required fields." });
        }

        const newEvent = await Event.create({
            title,
            description,
            event_date: date,
            last_reg_date: registration_deadline,
            no_of_team_members: team_size || 1,
            location,
            organizer_id: req.user.id // Retrieved from verifyToken middleware
        });

        return res.status(201).json({ success: true, message: "Event created successfully!", event: newEvent });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = createEvent;