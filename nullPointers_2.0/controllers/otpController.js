const nodemailer = require('nodemailer');
const User = require('../models/users'); // Assuming you already have a User model
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'null.pointers.SIH2024@gmail.com',
        pass: 'vzdm fgrx rtvj nmct'
    }
});

// Generate random 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

const otpStore = {}; // A temporary store to keep the OTPs in memory

// Use the generateOTP function here instead of inline OTP generation
const sendOTP = (req, res) => {
    const email = req.session.userEmail; // Get the email from session

    // Check if OTP is already generated and stored
    if (!otpStore[email]) {
        const otp = generateOTP(); // Generate OTP only if it doesn't exist
        otpStore[email] = otp; // Store the OTP associated with the user's email

        // Email options
        const mailOptions = {
            from: 'null.pointers.SIH2024@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending OTP: ', error); // Log the error
                return res.status(500).json({ message: 'Failed to send OTP', error: error });
            } else {
                console.log('OTP sent: ' + info.response); // Log success
            }
        });
    }

    // Render the OTP page
    res.render('otp', { email, errorMessage: '' });
};



const verifyOTP = (req, res) => {
    const { otp1, otp2, otp3, otp4 } = req.body;
    const otp = `${otp1}${otp2}${otp3}${otp4}`;
    const email = req.session.userEmail; // Get the email from session

    // Check if the entered OTP matches the one in the store
    if (otpStore[email] && otpStore[email] == otp) {
        delete otpStore[email]; // Clear OTP after verification
        req.session.isOtpVerified = true; // Mark OTP as verified
        return res.redirect('/'); // Redirect to the home page after successful verification
    } else {
        return res.status(400).render('otp', { email, errorMessage: 'Invalid OTP' });
    }
};



module.exports = {
    sendOTP,
    verifyOTP
};
