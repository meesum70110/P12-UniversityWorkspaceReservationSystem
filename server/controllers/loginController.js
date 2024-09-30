const User = require('../models/userData');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JSON WEB TOKENS contain Headers, Payload, Signature
// Header: Contains algorithm used for jwt.
// Payload: Contains non-sensitive user data (e.g. user_id)
// Signature: Used to verify token by Server. (Ecrpytion of Header and Payload using a private key)

// The following function creates jwt for login and signup
const generateTokens = (email) => {
    // Method below generates a token. First argument: payload, Second argument: secret key, Third argument: options 
    return jwt.sign({email}, process.env.SYM_KEY, {expiresIn: '3d'})
    // Once created, 3 dots separate the Header, Payload, and Signature
}

// Login a user
const loginRequest = async (req, res) => {
    const {email, password} = req.body;

    // Logging the email and password received in the request
    console.log(`Login attempt with Email: ${email} and Password: ${password}`);

    let errorFields = [];
    if(!email){
        errorFields.push('Email');
    }
    if(!password){
        errorFields.push('Password');
    }
    if(errorFields.length != 0)
    {
        return res.status(400).json({error : 'Please fill out all the fields', errorFields});
    }

    try {
        const user = await User.findOne({ email });

        // Log the user details retrieved from the database (if any)
        if (user) {
            console.log(`User found in database: ${JSON.stringify(user, null, 2)}`);
        } else {
            console.log('No user found with the provided email');
        }

        if (!user) {
            errorFields.push('Email');
            return res.status(400).json({error : 'Incorrect email', errorFields});
        }

        // Logging the plain text password from input and hashed password from database
        console.log(`Comparing input password: ${password} with hashed password: ${user.password}`);

        const compare = await bcrypt.compare(password, user.password);
        
        if (compare) {
            const userToken = generateTokens(user.email);
            console.log('Password match. Generating token and logging in.');
            res.status(200).json({email, occupation: user.occupation, fname: user.fname, userToken});
        } else {
            errorFields.push('Password');
            console.log('Password mismatch.');
            res.status(400).json({error : 'Incorrect password', errorFields});
        }
    } catch (error) {
        console.log('Error during login:', error.message);
        res.status(400).json({error: error.message});
    }
};

module.exports = {
    loginRequest
}
