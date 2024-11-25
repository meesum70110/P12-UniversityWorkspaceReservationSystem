// Importing required dependencies and controller functions
const express = require('express');
const {
    signupRequestAdmin, // Controller function to handle admin signup requests
    signupRequestEmployee // Controller function to handle employee signup requests
} = require('../controllers/signupController');

// Creating a new Express router instance
const router = express.Router();

// Importing middleware to authenticate requests using JWT (JSON Web Token)
const authenticateRequest = require('../middleware/authorize');

// Applying the JWT authentication middleware to ensure only authenticated requests are processed
router.use(authenticateRequest);

// Defining the signup routes:
// Admin signup: POST request to create a new admin
router.post('/', signupRequestAdmin);

// Employee signup: PATCH request to update or create an employee
router.patch('/', signupRequestEmployee);

// Exporting the router to be used in the main app
module.exports = router;
