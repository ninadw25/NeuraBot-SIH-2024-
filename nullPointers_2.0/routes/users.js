const express = require('express');
const router = express.Router();

const handleCreateUser = require('../controllers/createUserController').handleCreateUser; 

router.post('/createUser', handleCreateUser);

module.exports = router;