const express = require('express');
const router = express.Router();
const { adminLogin, adminHome, renderAdmin, pdfUploader, upload } = require('../controllers/adminController');

router.get('/', renderAdmin);
router.post('/login', adminLogin);
router.get('/home', adminHome);
router.post('/upload-pdf', upload.single('pdf'), pdfUploader);

module.exports=router;