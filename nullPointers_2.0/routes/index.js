const express = require('express');

const router = express.Router();

const homeController = require('../controllers/homeController');
const chatController = require('../controllers/chatController');
const summarizerController = require('../controllers/summarizerController');

router.get('/', homeController.index);
router.post('/chat', chatController.handleChat);
router.get('/summarize', summarizerController.summarizer)

module.exports = router;