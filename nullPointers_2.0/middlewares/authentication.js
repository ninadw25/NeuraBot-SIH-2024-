const authMiddleware = (req, res, next) => {
    if (req.path === '/login') {
        return next();
    }
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = authMiddleware;