const { user: User } = require('../models');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    try {
        let { username, full_name, email, password, role, phone_number, department, academic_year, enrollment_no } = req.body;

        // Map username to full_name if full_name is missing
        if (!full_name && username) full_name = username;

        if (!full_name || !email || !password || !phone_number || !department || !role) {
            return res.status(400).json({ success: false, message: "Please provide full name, email, password, role, phone number, and department." });
        }

        // Trim whitespace
        email = email.trim();
        password = password.trim();

        // Handle optional fields: convert empty strings to null to avoid DB errors with ENUMs
        if (academic_year === "") academic_year = null;
        if (enrollment_no === "") enrollment_no = null;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            full_name,
            email,
            password: hashedPassword,
            role,
            phone_number,
            department,
            academic_year,
            enrollment_no
        });

        const userResponse = { ...newUser.get({ plain: true }) };
        delete userResponse.password;

        return res.status(201).json({ success: true, message: "User registered successfully.", user: userResponse });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = register;