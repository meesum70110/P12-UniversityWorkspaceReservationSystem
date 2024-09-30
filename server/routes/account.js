const express = require('express');
const {
    getProfile,
    searchUsers,
    updatePhoto,
    updatePassword,
    updateInfo,
    getProfileAdmin,
    updateSensitive,
    deleteUser
} = require('../controllers/accountController')

const router = express.Router();
const authenticateRequest = require('../middleware/authorize');

// JSON WEB TOKEN validation. If valid only then subsequent routes are invoked and access to controller functions is granted.
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

// UPDATE user company specific info
router.patch('/sensitive', updateSensitive);

// Delete a user
router.delete('/:id', deleteUser);

module.exports = router
