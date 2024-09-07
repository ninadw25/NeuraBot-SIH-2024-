const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'null.pointers.SIH2024@gmail.com',
      pass: 'vzdm fgrx rtvj nmct'
    }
});

const generateOTP = () => {
    return Math.floor(Math.random() * 1000) + 1000;
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
  const sessionOtp = req.session.otp;

  if (enteredOtp === sessionOtp) {
      req.session.otpAuthenticated = true;
      return res.status(200).json({ success: true });
  } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};

const otpHandler = (req, res) => {
    res.render('otp');
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    otpHandler,
    verifyOTP
};