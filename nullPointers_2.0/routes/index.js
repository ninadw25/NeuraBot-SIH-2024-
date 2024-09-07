const express = require('express');
const passport = require('passport');
const router = express.Router();
const app = express();
const chatbotController = require('../controllers/chatbotController');
const chatController = require('../controllers/chatController');
const { summarizerRender, summarizer, upload } = require('../controllers/summarizerController');
const homeController = require('../controllers/homeController');
const loginController = require('../controllers/loginController');
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

router.get('/send-otp', otpController.sendOTP);
router.post('/verify-otp', otpController.verifyOTP);
module.exports = router;
const adminRouter = require('./admin');
app.use('/admin', adminRouter);
