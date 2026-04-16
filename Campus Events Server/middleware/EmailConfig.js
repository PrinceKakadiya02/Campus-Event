const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


const SendEmail = async () => {
    try {
        const info = await transporter.sendMail({
             from: `"Campus Events" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Update this to your intended target or parameter
            subject: "Hello ✔",
            text: "Hello world?", // Plain-text version of the message
            html: "<b>Hello world?</b>", // HTML version of the message
        });
        console.log(info)
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = { transporter, SendEmail };