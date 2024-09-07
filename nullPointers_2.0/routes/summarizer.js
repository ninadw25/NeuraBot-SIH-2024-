const express = require('express');
const router = express.Router();
const { summarizerRender, summarizer, upload } = require('../controllers/summarizerController');

router.get('/', summarizerRender);
router.post('/upload', upload.single('pdf'), summarizer);

module.exports  =router;