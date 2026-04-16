const bcrypt = require('bcrypt');
const { user: User, otpVerification } = require('../../models');

const resetPassword = async (req, res) => {
    try {
        let { email, otp, new_password } = req.body;

        if (!email || !otp || !new_password) {
            return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
        }

        email = email.trim();
        otp = otp.trim();
        new_password = new_password.trim();

        const otpRecord = await otpVerification.findOne({ where: { email } });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid request or OTP expired" });
        }

        if (new Date() > otpRecord.otp_expires_at) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update User password
        await User.update({ password: hashedPassword }, { where: { email } });

        // Mark OTP as verified and expire it immediately instead of deleting
        await otpRecord.update({
            is_verified: true,
            otp_expires_at: new Date()
        });

        return res.status(200).json({ success: true, message: "Password reset successfully" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = resetPassword;