// Importing required dependencies and controller functions
const express = require('express');
const {
    getAllFaqs, // Controller to retrieve all FAQs
    addFaq, // Controller to add a new FAQ
    deleteFaq // Controller to delete an FAQ by ID
} = require('../controllers/faqsController');

// Creating a new Express router instance
const router = express.Router();

// Importing the middleware to authenticate requests
const authenticateRequest = require('../middleware/authorize');

// Applying the authentication middleware to validate the JSON Web Token (JWT)
// If the token is valid, it allows access to the subsequent routes and controller functions
router.use(authenticateRequest);

// Defining the route to GET all FAQs
router.get('/', getAllFaqs);

// Defining the route to POST a new FAQ
router.post('/', addFaq);

// Defining the route to DELETE an FAQ by its ID
router.delete('/:id', deleteFaq);

// Exporting the router to be used in the main app
module.exports = router;
