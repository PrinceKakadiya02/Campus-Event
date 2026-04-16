const { userRegistration: UserRegistration, event: Event } = require('../../models');

const getUserRegistrations = async (req, res) => {
    try {
        const userId = req.user.id;

        const registrations = await UserRegistration.findAll({
            where: {
                user_id: userId,
                parent_id: null // Fetch only main registrations so team members don't see duplicate events
            },
            include: [{
                model: Event,
                as: 'event'
            }]
        });

        const registeredEvents = registrations.map(reg => reg.event);

        return res.status(200).json(registeredEvents);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = getUserRegistrations;