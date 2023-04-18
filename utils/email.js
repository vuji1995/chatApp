const nodemailer = require(`nodemailer`);

const sendMail = async (options) => {
  //1. Create transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "Antonio <sef.bgp@gmail.com>",
    to: options.email,
    text: options.message,
    subject: options.subject,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
