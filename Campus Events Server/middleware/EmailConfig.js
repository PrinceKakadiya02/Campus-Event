const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "princekakadiya207@gmail.com",
        pass: "gpkw mkgb uwlx umup",
    },
});


const SendEmail = async () => {
    try {
        const info = await transporter.sendMail({
            from: '"Campus Events" <princekakadiya207@gmail.com>',
            to: "kakadiyaprince207@gmail.com",
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