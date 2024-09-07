const authMiddleware = (req, res, next) => {
    if (req.path === '/login' || req.path === '/user/createUser' || req.path === '/user/login') {
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
    if (req.path === '/login' || req.path === '/user/createUser' || req.path === '/user/login' || req.path === '/otp') {
        return next();
    }
    if (req.session.optAuthenticated){
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