const bcrypt = require('bcrypt');
const { user: User, otpVerification } = require('../../models');
const { sendOtpEmail } = require('../../middleware/EmailTemplate');

const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        email = email.trim();

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // For security, we might want to return 200 even if user not found, 
            // but for this implementation we'll return 404 as per typical dev setups.
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Check if an OTP record exists (it might not if they finished registration)
        const existingOtp = await otpVerification.findOne({ where: { email } });

        if (existingOtp) {
            await existingOtp.update({
                otp_hash: otpHash,
                otp_expires_at: expiry,
                is_verified: false
            });
        } else {
            await otpVerification.create({
                email,
                name: user.full_name,
                role: user.role,
                otp_hash: otpHash,
                otp_expires_at: expiry
            });
        }

        await sendOtpEmail(email, user.full_name, otp);
        return res.status(200).json({ success: true, message: "OTP sent to your email" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = forgotPassword;