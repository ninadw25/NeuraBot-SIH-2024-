const express = require('express');
const router = express.Router();
const { summarizerRender, summarizer, upload } = require('../controllers/summarizerController');
const { chatHandler } = require('../controllers/QnAcontroller');

router.get('/', summarizerRender);
router.post('/upload', upload.single('pdf'), summarizer);
router.post('/chatApi', chatHandler);

module.exports = router;
