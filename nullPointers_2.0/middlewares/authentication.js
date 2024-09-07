const authMiddleware = (req, res, next) => {
    if (req.path === '/login' || req.path === '/user/createUser' || req.path === '/user/login' || req.path === '/auth/google/callback' || req.path === '/auth/google' || req.path === '/admin') {
        return next();
    }
    if (req.session.isAuthenticated) {
        next();
    }
    else {
        res.redirect('/login');
    }
};

module.exports = { 
    authMiddleware
};