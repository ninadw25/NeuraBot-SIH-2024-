function checkLogin(req, res, next) {
    if (req.session.isAuthenticated) {
        // User is authenticated, allow access to the requested route
        return next();
    }
    // User is not authenticated, redirect to the login page
    return res.redirect('/login');
}

module.exports = checkLogin;