const express = require('express');

const router = express.Router();

const chatbotController = require('../controllers/chatbotController');
const chatController = require('../controllers/chatController');
const summarizerController = require('../controllers/summarizerController');
const homeController = require('../controllers/homeController');

router.get('/', homeController.home);
router.get('/chatbot', chatbotController.index);
router.post('/chat', chatController.handleChat);
router.get('/summarize', summarizerController.summarizer)

module.exports = router;