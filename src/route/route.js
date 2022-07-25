const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers.js')

router.post('/register', userControllers.createUser)
router.post('/login',userControllers.userLogin )



module.exports = router
