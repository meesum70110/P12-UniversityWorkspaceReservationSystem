// Importing required dependencies and controller functions
const express = require('express');
const {
    getProfile, // Controller to get the user profile
    searchUsers, // Controller to search for users
    updatePhoto, // Controller to update user photo
    updatePassword, // Controller to update user password
    updateInfo, // Controller to update user information
    getProfileAdmin, // Controller to get user profile by admin
    updateSensitive, // Controller to update sensitive company-specific information
    deleteUser // Controller to delete a user
} = require('../controllers/accountController');

// Creating a new Express router instance
const router = express.Router();

// Importing the middleware to authenticate requests
const authenticateRequest = require('../middleware/authorize');

// Applying the authentication middleware to validate the JSON Web Token (JWT)
// If the token is valid, it allows access to the subsequent routes and controller functions
router.use(authenticateRequest);

// Defining the route to GET the user profile
router.get('/', getProfile);

// Defining the route to POST and search users by certain criteria
router.post('/', searchUsers);

// Defining the route to PATCH and update the user photo
router.patch('/photo', updatePhoto);

// Defining the route to PATCH and update the user password
router.patch('/password', updatePassword);

// Defining the route to PATCH and update general user info
router.patch('/info', updateInfo);

// Defining the route to GET the user profile requested by an admin
router.post('/profile', getProfileAdmin);

// Defining the route to PATCH and update company-specific sensitive information
router.patch('/sensitive', updateSensitive);

// Defining the route to DELETE a user by their ID
router.delete('/:id', deleteUser);

// Exporting the router to be used in the main app
module.exports = router;
