function checkLogin(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    return res.redirect('/login');
}

module.exports = checkLogin;