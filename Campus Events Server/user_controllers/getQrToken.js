const jwt = require('jsonwebtoken');
const { userRegistration: UserRegistration } = require('../models');

const getQrToken = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id; // From verifyToken middleware

        // Verify the user is actually registered for this event
        const registration = await UserRegistration.findOne({ where: { user_id: userId, event_id: eventId } });
        if (!registration) {
            return res.status(403).json({ success: false, message: "Not registered for this event" });
        }

        // Generate a secure token valid for the event
        const qrToken = jwt.sign({ userId, eventId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ success: true, qrToken });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error generating QR Token", error: error.message });
    }
};

module.exports = getQrToken;