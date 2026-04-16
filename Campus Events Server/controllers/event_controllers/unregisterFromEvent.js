const { userRegistration: UserRegistration } = require('../../models');

const unregisterFromEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const deletedCount = await UserRegistration.destroy({
            where: {
                event_id: eventId,
                user_id: userId
            }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ success: false, message: "You are not registered for this event." });
        }


        return res.status(200).json({ success: true, message: "Successfully unregistered from the event." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = unregisterFromEvent;