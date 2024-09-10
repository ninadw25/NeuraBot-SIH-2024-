const express = require('express');
const router = express.Router();
const {renderSummarizer, uploadAndSummarize, handleChat, deleteFile, upload} = require('../controllers/summarizerController');

router.get('/', renderSummarizer);
router.post('/upload', upload.single('pdf'), uploadAndSummarize);
router.post('/chatApi', handleChat);
router.delete('/delete/:filename', deleteFile);

module.exports = router;