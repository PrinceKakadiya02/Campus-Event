const { Contact } = require('../../models');

const submitContact = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim();
        const subject = req.body.subject?.trim();
        const message = req.body.message?.trim();

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Name, email, and message are required." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Please provide a valid email address." });
        }

        const newContact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        return res.status(201).json({ success: true, message: "Message sent successfully!", data: newContact });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    submitContact,
    getAllContacts
};