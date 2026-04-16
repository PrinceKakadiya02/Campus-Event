const jwt = require('jsonwebtoken');
const { userRegistration: UserRegistration, event: Event } = require('../../models');

const markAttendance = async (req, res) => {
    try {
        const { qrToken } = req.body;
        const eventId = req.params.id;

        if (!qrToken) {
            return res.status(400).json({ success: false, message: "QR Token is required" });
        }

        // Verify the token authenticity
        const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);

        // Check if the QR code belongs to the event being scanned
        if (decoded.eventId != eventId) {
            return res.status(400).json({ success: false, message: "Invalid QR Code for this event" });
        }

        // Fetch the event to verify the event date
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Check if today matches the event date
        const today = new Date();
        const eventDate = new Date(event.event_date);
        const isSameDate = today.getFullYear() === eventDate.getFullYear() &&
            today.getMonth() === eventDate.getMonth() &&
            today.getDate() === eventDate.getDate();

        // Bypass the date check for our permanent testing event (ID: 409)
        if (!isSameDate && eventId != 409) {
            return res.status(400).json({ success: false, message: "Attendance can only be marked on the day of the event." });
        }

        // Find the registration
        const registration = await UserRegistration.findOne({ where: { user_id: decoded.userId, event_id: eventId } });
        if (!registration) {
            return res.status(404).json({ success: false, message: "User registration not found" });
        }

        // Bypass the attendance check and saving for our permanent testing event (ID: 409)
        if (eventId == 409) {
            return res.status(200).json({ success: true, message: "Attendance marked successfully (Test Mode: You can scan this again!)" });
        }

        if (registration.attended) {
            return res.status(400).json({ success: false, message: "User has already been marked as attended" });
        }

        registration.attended = true;
        await registration.save();

        res.status(200).json({ success: true, message: "Attendance marked successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid or expired QR code", error: error.message });
    }
};

module.exports = markAttendance;