// Importing required dependencies and controller functions
const express = require('express');
const {
    loginRequest, // Controller to handle the login request
} = require('../controllers/loginController');

// Creating a new Express router instance
const router = express.Router();

// Defining the login route, which handles POST requests for user login
router.post('/', loginRequest);

// Exporting the router to be used in the main app
module.exports = router;
