const bcrypt = require('bcrypt');
const { user: User, otpVerification } = require('../../models');
const { sendOtpEmail } = require('../../middleware/EmailTemplate');
const { sendOtpValidation } = require('../../validation/auth');

const sendOtp = async (req, res) => {
    try {
        const { error } = sendOtpValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { name, email, role } = req.body;

        // check if user already registered
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        const existingOtpEntry = await otpVerification.findOne({ where: { email } });

        if (existingOtpEntry) {
            // An OTP entry already exists for this email
            if (!existingOtpEntry.is_verified && existingOtpEntry.otp_expires_at > new Date()) {
                // The existing OTP is still valid
                return res.status(400).json({
                    success: false,
                    message: "An active OTP has already been sent. Please check your email or wait for it to expire."
                });
            }

            // The existing OTP has expired or was verified but registration incomplete
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpHash = await bcrypt.hash(otp, 10);

            existingOtpEntry.otp_hash = otpHash;
            existingOtpEntry.otp_expires_at = new Date(Date.now() + 60 * 1000); // Set new 1-minute expiry
            existingOtpEntry.is_verified = false;
            await existingOtpEntry.save();

            await sendOtpEmail(email, name, otp);
            return res.status(200).json({ success: true, message: "A new OTP has been sent to your email." });

        } else {
            // No OTP entry exists, create a new one
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpHash = await bcrypt.hash(otp, 10);
            await otpVerification.create({
                email,
                name,
                role,
                otp_hash: otpHash,
                otp_expires_at: new Date(Date.now() + 60 * 1000) // Expires in 1 minute
            });
            await sendOtpEmail(email, name, otp);
            return res.status(200).json({ success: true, message: "OTP sent to your email" });
        }

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong, internal server error"
        })
    }
}

module.exports = sendOtp;