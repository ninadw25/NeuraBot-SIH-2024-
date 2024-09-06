const express = require('express');

const router = express.Router();

const chatbotController = require('../controllers/chatbotController');
const chatController = require('../controllers/chatController');
const { summarizerRender, summarizer, upload } = require('../controllers/summarizerController');
const homeController = require('../controllers/homeController');
const loginController = require('../controllers/loginController');
const adminController = require('../controllers/adminController')

router.get('/', homeController.home);
router.get('/login', loginController.login);
router.get('/chatbot', chatbotController.index);
router.post('/chat', chatController.handleChat);
router.get('/summarize', summarizerRender);
<<<<<<< HEAD
router.post('/upload', upload.single('pdf'), summarizer);

=======
router.post('/summarize', summarizer);
router.get('/admin',adminController.admin)
>>>>>>> f846422dd81b3ecef72b6d360036360089236176
module.exports = router;