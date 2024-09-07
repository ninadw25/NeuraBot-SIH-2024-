const express = require('express');
const passport = require('passport');
const router = express.Router();

const chatbotController = require('../controllers/chatbotController');
const chatController = require('../controllers/chatController');
const { summarizerRender, summarizer, upload } = require('../controllers/summarizerController');
const homeController = require('../controllers/homeController');
const loginController = require('../controllers/loginController');
const { admin, adminHome } = require('../controllers/adminController');
const otpController = require('../controllers/otpController');

router.get('/', homeController.home);
router.get('/login', loginController.login);
router.get('/chatbot', chatbotController.index);
router.post('/chat', chatController.handleChat);
router.get('/summarize', summarizerRender);
router.post('/upload', upload.single('pdf'), summarizer);

router.post('/summarize', summarizer);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);
router.get('/admin', admin);
router.get('/admin/home', adminHome);

router.get('/send-otp', otpController.sendOTP); // Sends OTP after login (only once)
router.post('/verify-otp', otpController.verifyOTP); // Verifies OTP entered by the user

module.exports = router;
