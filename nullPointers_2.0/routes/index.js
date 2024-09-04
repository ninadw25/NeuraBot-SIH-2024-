const express = require('express');

const router = express.Router();

const homeController = require('../controllers/homeController');
const chatController = require('../controllers/chatController');

router.get('/', homeController.index);
router.post('/chat', chatController.handleChat);

module.exports = router;