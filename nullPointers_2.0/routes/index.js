const express = require('express');

const router = express.Router();

const chatbotController = require('../controllers/chatbotController');
const chatController = require('../controllers/chatController');
const { summarizerRender, summarizer } = require('../controllers/summarizerController');
const homeController = require('../controllers/homeController');
const loginController = require('../controllers/loginController');
const adminController = require('../controllers/adminController')

router.get('/', homeController.home);
router.get('/login', loginController.login);
router.get('/chatbot', chatbotController.index);
router.post('/chat', chatController.handleChat);
router.get('/summarize', summarizerRender);
router.post('/summarize', summarizer);
router.get('/admin',adminController.admin)
module.exports = router;