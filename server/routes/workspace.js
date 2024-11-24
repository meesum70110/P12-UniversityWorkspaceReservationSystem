const express = require('express');
const {
    getSurveys,
    addComment,
    deleteSurvey,
    surveyVisibility,
    getAvailability,
    bookWorkspace,
    getUserBookings,
    cancelBooking,
    getAllTablesStatus 
} = require('../controllers/workspacesController');

const router = express.Router();
const authenticateRequest = require('../middleware/authorize');

// Middleware to authenticate requests
router.use(authenticateRequest);

// Existing routes
router.get('/', getSurveys);
router.patch('/comment/:id', addComment);
router.delete('/:id', deleteSurvey);
router.patch('/visibility/:id', surveyVisibility);
router.get('/:workspaceId/availability', getAvailability);
router.post('/:workspaceId/book', bookWorkspace);
router.get('/bookings', getUserBookings);
router.delete('/bookings/:bookingId', cancelBooking);

// Route for fetching all tables' availability status
router.get('/tables', getAllTablesStatus);

module.exports = router;


