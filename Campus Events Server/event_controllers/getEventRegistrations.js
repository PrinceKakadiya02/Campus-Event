const { event: Event, userRegistration: UserRegistration, user: User } = require('../models');

const getEventRegistrations = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        // Check if the user is the organizer or an admin
        if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You are not authorized to view registrations for this event." });
        }

        const registrations = await UserRegistration.findAll({
            where: {
                event_id: id,
                parent_id: null // Fetch only leaders/solo participants as the main records
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'full_name', 'email']
                },
                {
                    model: UserRegistration,
                    as: 'user_registrations' // Automatically nests the team members linked to this leader
                }
            ]
        });


        return res.status(200).json(registrations);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = getEventRegistrations;