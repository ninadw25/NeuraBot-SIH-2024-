const express = require('express');
const router = express.Router();

const handleCreateUser = require('../controllers/createUserController').handleCreateUser; 
const { login, userValidate } = require('../controllers/loginController')

router.post('/createUser', handleCreateUser);
router.post('/user/login', userValidate);
module.exports = router;