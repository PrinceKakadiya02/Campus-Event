const { user: User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        let { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: "Please provide email, password, and role." });
        }

        // Trim whitespace to prevent accidental mismatches
        email = email.trim();
        password = password.trim();

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.role !== role) {
            return res.status(403).json({ success: false, message: "Access denied. Incorrect role specified." });
        }

        if (user.role === 'organizer' && user.approval_status !== 'approved') {
            return res.status(403).json({ success: false, message: "Your organizer account is still pending approval by an admin." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const payload = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        const userResponse = { ...user.get({ plain: true }) };
        delete userResponse.password;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({ success: true, message: "Logged in successfully.", user: userResponse });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = login;