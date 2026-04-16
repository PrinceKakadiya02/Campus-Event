const { transporter } = require('./EmailConfig')

const SendEmailVerification = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Campus Events" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your Email",
            text: "Verify Your Email", // Plain-text version of the message
            html: otp
        });
        console.log("Email Sent Successfully", response)
    }
    catch (err) {
        console.log("Email error", err)
    }
}

module.exports = { SendEmailVerification };