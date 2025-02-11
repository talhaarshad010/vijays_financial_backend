const nodemailer = require("nodemailer");

const sendEmail = async (mailOptions) => {
  const Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    port: 465,
    secure: true,
  });

  await Transporter.sendMail(mailOptions, (error, Info) => {
    if (error) {
      console.log("Error", error.message);
    } else {
      console.log("Info", Info.response);
    }
  });
};
module.exports = { sendEmail };
