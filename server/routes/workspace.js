// Importing required dependencies and controller functions
const express = require('express');
const {
    getSurveys,           // Controller function to get all surveys
    addComment,           // Controller function to add a comment to a survey
    deleteSurvey,         // Controller function to delete a survey
    surveyVisibility,     // Controller function to change survey visibility
    getAvailability,      // Controller function to get availability of a workspace
    bookWorkspace,        // Controller function to book a workspace
    getUserBookings,      // Controller function to fetch all user bookings
    cancelBooking,        // Controller function to cancel a user's booking
    getAllTablesStatus    // Controller function to get the status of all tables
} = require('../controllers/workspacesController');

// Creating a new Express router instance
const router = express.Router();

// Importing middleware to authenticate requests using JWT (JSON Web Token)
const authenticateRequest = require('../middleware/authorize');

// Applying JWT authentication middleware to ensure only authenticated requests are processed
router.use(authenticateRequest);

// Defining the routes for workspaces and bookings:

// Get all surveys (GET request)
router.get('/', getSurveys);

// Add a comment to a specific survey (PATCH request)
router.patch('/comment/:id', addComment);

// Delete a specific survey (DELETE request)
router.delete('/:id', deleteSurvey);

// Change visibility of a survey (PATCH request)
router.patch('/visibility/:id', surveyVisibility);

// Get availability of a specific workspace (GET request)
router.get('/:workspaceId/availability', getAvailability);

// Book a workspace (POST request)
router.post('/:workspaceId/book', bookWorkspace);

// Get all user bookings (GET request)
router.get('/bookings', getUserBookings);

// Cancel a booking (DELETE request)
router.delete('/bookings/:bookingId', cancelBooking);

// Get the status of all tables (GET request)
router.get('/tables', getAllTablesStatus);

// Exporting the router to be used in the main app
module.exports = router;
