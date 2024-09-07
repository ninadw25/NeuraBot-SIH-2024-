const User = require('../models/users');
const bcrypt = require('bcrypt');
const { generateOTP, sendOTPEmail } = require('./otpController'); // Import OTP functions

const login = (req, res) => {
    res.render('login', { errorMessage: "" });
};

const userValidate = async (req, res) => {
    const { email, password } = req.body;

    req.session.userEmail = email;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).redirect('/login');
        }

        // Generate and send OTP
        const otp = generateOTP();
        req.session.otp = otp;  // Store OTP in session for validation
        await sendOTPEmail(email, otp);

        req.session.isAuthenticated = true;
        req.session.userId = user._id;

        return res.status(200).redirect('/otp');
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: `${error}` });
    }
};

module.exports = {
    login,
    userValidate
};