// Importing necessary modules
const express = require('express'); // Importing Express for creating routes
const {
    getSurveys, // Controller to fetch workspaces
    addComment, // Controller to add comments to a workspace
    deleteSurvey, // Controller to delete a workspace
    surveyVisibility, // Controller to update workspace visibility
    getAvailability, // Controller to fetch table availability in a workspace
    bookWorkspace, // Controller to book a table in a workspace
    getUserBookings, // Controller to fetch user-specific bookings
    cancelBooking, // Controller to cancel a booking
    getAllTablesStatus, // Controller to get the status of all tables
    getAllBookings // Controller to fetch all bookings
} = require('../controllers/workspacesController'); // Importing workspace-related controllers

const router = express.Router(); // Creating an Express router instance
const authenticateRequest = require('../middleware/authorize'); // Middleware to authenticate incoming requests

// Applying middleware to authenticate all routes
router.use(authenticateRequest); // Ensuring only authorized users can access these routes

// Routes for workspace management
router.get('/', getSurveys); // Route to fetch available workspaces with filters
router.patch('/comment/:id', addComment); // Route to add a comment to a specific workspace
router.delete('/:id', deleteSurvey); // Route to delete a specific workspace
router.patch('/visibility/:id', surveyVisibility); // Route to update the visibility of a specific workspace
router.get('/:workspaceId/availability', getAvailability); // Route to check table availability in a specific workspace
router.post('/:workspaceId/book', bookWorkspace); // Route to book a table in a specific workspace
router.get('/bookings', getUserBookings); // Route to fetch bookings for the authenticated user
router.delete('/bookings/:bookingId', cancelBooking); // Route to cancel a specific booking
router.get('/tables', getAllTablesStatus); // Route to fetch the status of all tables across workspaces
router.get('/bookings/all', getAllBookings); // Route to fetch all bookings (admin only)

// Exporting the router for use in the application
module.exports = router;
