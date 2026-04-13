const { transporter } = require("./EmailConfig");


const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>

  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: 'Poppins', Arial, sans-serif;
    }
    .container {
      width: 100%;
      padding: 30px 0;
    }
    .card {
      max-width: 600px;
      background: #ffffff;
      margin: auto;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }
    .header {
      background: #2563eb;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 22px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
      color: #333333;
      font-size: 15px;
      line-height: 1.6;
    }
    .otp {
      font-size: 32px;
      letter-spacing: 6px;
      font-weight: 600;
      color: #2563eb;
      text-align: center;
      margin: 20px 0;
    }
    .details {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .footer {
      background: #f8fafc;
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="card">
      <div class="header">Campus Events</div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Campus Events · College Event Management
      </div>
    </div>
  </div>
</body>
</html>
`;

/* ===============================
   1️⃣ OTP EMAIL
================================ */
const sendOtpEmail = async (to, name, otp) => {
    const html = emailTemplate(
        "OTP Verification",
        `
      <p>Hello <b>${name}</b>,</p>
      <p>Use the OTP below to verify your Campus Events account:</p>
      <div class="otp">${otp}</div>
      <p>This OTP is valid for <b>1 minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `
    );

    await transporter.sendMail({
        from: '"Campus Events" <princekakadiya207@gmail.com>',
        to,
        subject: "Your OTP for Campus Events Verification",
        html,
    });
};

/* ===============================
   2️⃣ WELCOME EMAIL
================================ */
const sendWelcomeEmail = async (to, name) => {
    const html = emailTemplate(
        "Welcome to Campus Events",
        `
      <p>Hello <b>${name}</b>,</p>
      <p>🎉 Your account has been successfully created!</p>
      <p>You can now:</p>
      <ul>
        <li>Explore upcoming campus events</li>
        <li>Register easily</li>
        <li>Organize events (if approved)</li>
      </ul>
      <p>We’re excited to have you onboard 🚀</p>
    `
    );

    await transporter.sendMail({
        from: '"Campus Events" <princekakadiya207@gmail.com>',
        to,
        subject: "Welcome to Campus Events 🎉",
        html,
    });
};

/* ===============================
   3️⃣ EVENT REGISTRATION EMAIL
================================ */
const sendEventRegistrationEmail = async (
    to,
    name,
    eventName,
    venue,
    date,
    time
) => {
    const html = emailTemplate(
        "Event Registration Successful",
        `
      <p>Hello <b>${name}</b>,</p>
      <p>You have successfully registered for:</p>

      <div class="details">
        <p><b>📌 Event:</b> ${eventName}</p>
        <p><b>📍 Venue:</b> ${venue}</p>
        <p><b>📅 Date:</b> ${date}</p>
        <p><b>⏰ Time:</b> ${time}</p>
      </div>

      <p>Please arrive on time and carry your college ID.</p>
      <p>See you there 🎊</p>
    `
    );

    await transporter.sendMail({
        from: '"Campus Events" <princekakadiya207@gmail.com>',
        to,
        subject: "Event Registration Confirmed 🎟️",
        html,
    });
};

/* ===============================
   4️⃣ EVENT REMINDER EMAIL
================================ */
const sendEventReminderEmail = async (
    to,
    name,
    eventName,
    venue,
    date,
    time
) => {
    const html = emailTemplate(
        "Event Reminder",
        `
      <p>Hello <b>${name}</b>,</p>
      <p>⏰ This is a reminder for your upcoming event:</p>

      <div class="details">
        <p><b>📌 Event:</b> ${eventName}</p>
        <p><b>📍 Venue:</b> ${venue}</p>
        <p><b>📅 Date:</b> ${date}</p>
        <p><b>⏰ Time:</b> ${time}</p>
      </div>

      <p>We’re excited to see you there!</p>
    `
    );

    await transporter.sendMail({
        from: '"Campus Events" <princekakadiya207@gmail.com>',
        to,
        subject: `Reminder: ${eventName} is Today!`,
        html,
    });
};

/* ===============================
   EXPORTS
================================ */
module.exports = {
    sendOtpEmail,
    sendWelcomeEmail,
    sendEventRegistrationEmail,
    sendEventReminderEmail,
};
