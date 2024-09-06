const express = require('express');
const router = express.Router();

const handleCreateUser = require('../controllers/createUserController').handleCreateUser; 
const { login, userValidate } = require('../controllers/loginController');

router.post('/createUser', handleCreateUser);
router.post('/login', userValidate);
router.get('/login', login);

module.exports = router;