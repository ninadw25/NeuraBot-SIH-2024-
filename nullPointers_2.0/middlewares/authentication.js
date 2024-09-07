const authMiddleware = (req, res, next) => {
    const openRoutes = [
        '/login', 
        '/user/createUser', 
        '/user/login', 
        '/auth/google/callback', 
        '/auth/google', 
        '/admin',
        '/admin/home',
        '/admin/login',
        '/send-otp', 
        '/verify-otp',
        '/admin/login',
        '/admin/home',
        '/upload-pdf',
        '/admin/upload-pdf'
    ];

    // Allow access to open routes
    if (openRoutes.includes(req.path)) {
        return next();
    }

    // Check if user is authenticated
    if (req.session.isAuthenticated) {
        // Check if OTP verification is required
        if (req.session.isOtpVerified) {
            // Proceed to the next middleware or route if OTP is verified
            return next();
        } else {
            // Redirect to OTP page if not yet verified
            return res.redirect('/send-otp');
        }
    } else {
        // Redirect to login if not authenticated
        return res.redirect('/login');
    }
};

module.exports = { 
    authMiddleware
};
