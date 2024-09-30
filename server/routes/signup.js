const express = require('express');
const {
    signupRequestAdmin,
    signupRequestEmployee

} = require('../controllers/signupController')

const router = express.Router();
const authenticateRequest = require('../middleware/authorize');

// JSON WEB TOKEN validation. If valid only then subsequent routes are invoked and access to controller functions is granted.
router.use(authenticateRequest);

// Signup routes
router.post('/', signupRequestAdmin);

router.patch('/', signupRequestEmployee);

module.exports = router