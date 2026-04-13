const bcrypt = require('bcrypt');
const { user: User, otpVerification } = require('../models');

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }
        const otpEntry = await otpVerification.findOne({ where: { email } });
        if (!otpEntry) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (otpEntry.is_verified === true) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        // Check if OTP is expired
        if (new Date() > otpEntry.otp_expires_at) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        const otpMatch = await bcrypt.compare(otp, otpEntry.otp_hash);
        if (otpMatch) {
            await otpEntry.update({ is_verified: true });
            return res.status(200).json({
                success: true,
                message: "OTP verified successfully"
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: "OTP verification failed"
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong, internal server error"
        })
    }
}

module.exports = verifyOtp;