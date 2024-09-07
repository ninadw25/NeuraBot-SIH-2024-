const express = require('express');

const router = express.Router();

const { adminLogin, adminHome, renderAdmin } = require('../controllers/adminController');

router.get('/', renderAdmin);
router.post('/login', adminLogin);
router.get('/home', adminHome);

module.exports = router;