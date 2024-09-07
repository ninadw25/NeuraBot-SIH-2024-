const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'null.pointers.SIH2024@gmail.com',
      pass: 'vzdm fgrx rtvj nmct'
    }
});

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

const sendOTPEmail = async (email, otp) => {
    try {
      const mailOptions = {
        from: "null.pointers.SIH2024@gmail.com",
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return info;
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error;
    }
};

const verifyOTP = (req, res) => {
  const enteredOtp = req.body.otp;
  const sessionOtp = req.session.generatedOtp;

  if (enteredOtp === sessionOtp) {
      req.session.otpAuthenticated = true;
      return res.status(200).json({ success: true });
  } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};

const otpHandler = (req, res) => {
    res.render('otp');

    const otp = generateOTP();
    req.session.generatedOtp = otp;
    const recipientEmail = req.session.userEmail;
    sendOTPEmail(recipientEmail, otp)
      .then(() => console.log('OTP sent successfully!'))
      .catch((err) => console.error('Failed to send OTP:', err));
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    otpHandler,
    verifyOTP
};