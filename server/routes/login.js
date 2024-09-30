const express = require('express');
const {
    loginRequest,
} = require('../controllers/loginController')

const router = express.Router();

// Login route
router.post('/', loginRequest);

module.exports = router
