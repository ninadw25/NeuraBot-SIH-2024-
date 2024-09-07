// authentication.js (middleware)
const authMiddleware = (req, res, next) => {
    if (['/login', '/user/createUser', '/user/login', '/auth/google/callback', '/auth/google', '/admin'].includes(req.path)) {
        return next();
    }
    if (req.session.isAuthenticated) {
        next();
    }
    else {
        res.redirect('/login');
    }
};

const otpAuthenticate = (req, res, next) => {
    if (['/login', '/user/createUser', '/user/login', '/otp', '/admin', '/verifyOtp'].includes(req.path)) {
        return next();
    }
    if (req.session.otpAuthenticated) {
        next();
    }
    else {
        res.redirect('/otp');
    }
};

module.exports = { 
    authMiddleware,
    otpAuthenticate
};