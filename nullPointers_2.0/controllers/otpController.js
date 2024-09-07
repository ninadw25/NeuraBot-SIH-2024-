exports.otpHandler = (req, res) => {
    req.session.optAuthenticated = true;
    res.render('otp');
};