// Importing required dependencies
const User = require('../models/userData'); // Importing the User model to interact with the user data
const mongoose = require('mongoose'); // Importing mongoose (though it's not explicitly used here)
const jwt = require('jsonwebtoken'); // Importing the JSON Web Token library for token verification

// Middleware function to authenticate requests
const authenticateRequest = async (req, res, next) => {

    // Extracting the 'authorization' field from request headers
    const { authorization } = req.headers;

    // Initializing error fields and list to send in case of failure
    let errorFields = [];
    let errorList = {};

    // If there's no authorization header, return an error
    if (!authorization) 
        return res.status(401).json({ error: 'Authorization data not found', errorList, errorFields });

    // Try block for processing the JWT token
    try {
        // The authorization header is expected to have the format: 'Bearer <token>'
        // So, we split it into an array and extract the token
        let jsonToken = authorization.split(' ')[1]; // Extracting token from the header

        // Verifying the JWT token using the symmetric key from environment variables
        const { email } = jwt.verify(jsonToken, process.env.SYM_KEY);

        // If the token is valid, we fetch the user associated with the email from the database
        // We only need the email field to verify the user
        req.email = await User.findOne({ email }).select('email');

        // If user exists, proceed to the next middleware/controller function
        next();
    } catch (error) {
        // If an error occurs (invalid token, expired token, etc.), return a 401 Unauthorized response
        console.log(error);
        res.status(401).json({ error: 'Access denied', errorList, errorFields });
    }
}

// Exporting the middleware to be used in the routes
module.exports = authenticateRequest;
