const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (The "Mail Truck")
  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER, // Your gmail
      pass: process.env.EMAIL_PASS, // Your App Password
    },
  });

  // ADD THIS TEMPORARY LOG
transporter.verify(function (error, success) {
  if (error) {
    console.log("Mail Server Error:", error);
  } else {
    console.log("Mail Server is ready to take messages");
  }
});

  // 2. Define the email options (The "Envelope")
  const mailOptions = {
    from: `"EliteEvents Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    // We'll send HTML to keep it looking "Elite"
    html: options.message, 
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;