const nodemailer = require("nodemailer");



const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or "Outlook", "Yahoo", or custom SMTP
    auth: {
  user: process.env.EMAIL_USERNAME,
  pass: process.env.EMAIL_PASS, 

},
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
