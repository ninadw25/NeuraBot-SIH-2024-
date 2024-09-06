const authMiddleware = (req, res, next) => {
    if (req.path === '/login' || req.path === '/user/createUser' || req.path === '/user/login') {
        return next();
    }
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = authMiddleware;