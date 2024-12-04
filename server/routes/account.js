const express = require('express');
const {
    getProfile,
    searchUsers,
    updatePhoto,
    updatePassword,
    updateInfo,
    getProfileAdmin,
    deleteUser // Removed updateSensitive
} = require('../controllers/accountController');

const router = express.Router();
const authenticateRequest = require('../middleware/authorize');

// Ensure the middleware is applied before the routes
router.use(authenticateRequest);

// GET user profile
router.get('/', getProfile);

// GET all employee profiles
router.post('/', searchUsers);

// Update user photo
router.patch('/photo', updatePhoto);

// Update user password
router.patch('/password', updatePassword);

// Update user info
router.patch('/info', updateInfo);

// Retrieve user profile requested by admin
router.post('/profile', getProfileAdmin);

// Delete a user
router.delete('/:id', deleteUser);

module.exports = router;
