const User = require('../models/userData');
const bcrypt = require('bcrypt');
const validator = require('validator');
const generator = require('generate-password');
const { sendCredentials } = require('./mailer/sendCredentials');

// Signup a user (Admin Request)
const signupRequestAdmin = async (req, res) => {
    console.log('Received Admin Signup Request');
    console.log('Request Body:', req.body);

    let { email, fname, lname, occupation, department } = req.body;

    let errorList = {};
    let emptyMsg = 'Please complete this required field.';

    // Trim input values
    email = email ? email.trim() : '';
    fname = fname ? fname.trim() : '';
    lname = lname ? lname.trim() : '';
    occupation = occupation ? occupation.trim() : '';
    department = department ? department.trim() : '';

    // Validating input fields
    if (!email) {
        errorList.email = emptyMsg;
    } else if (!validator.isEmail(email)) {
        errorList.email = 'Email entered is invalid.';
    } else {
        try {
            console.log('Checking if email already exists');
            const contains = await User.findOne({ email });
            if (contains) {
                errorList.email = 'Email already in use.';
            }
        } catch (error) {
            console.error('Error checking email:', error.message);
            errorList.email = 'Error checking email.';
        }
    }

    if (!fname) {
        errorList.fname = emptyMsg;
    } else if (!validator.isAlpha(fname)) {
        errorList.fname = 'First name must only contain alphabets.';
    } else if (fname.length > 15) {
        errorList.fname = 'First name must be a maximum of 15 characters.';
    }

    if (!lname) {
        errorList.lname = emptyMsg;
    } else if (!validator.isAlpha(lname)) {
        errorList.lname = 'Last name must only contain alphabets.';
    } else if (lname.length > 15) {
        errorList.lname = 'Last name must be a maximum of 15 characters.';
    }

    if (!occupation) {
        errorList.occupation = emptyMsg;
    } else if (occupation !== 'admin' && occupation !== 'employee') {
        errorList.occupation = 'Occupation entered is invalid.';
    }

    if (!department) {
        errorList.department = emptyMsg;
    }

    if (Object.keys(errorList).length !== 0) {
        console.log('Validation Errors:', errorList);
        return res.status(400).json({ error: 'Error with input fields', errorList });
    }

    // Generating a random password
    console.log('Generating random password');
    const passcode = generator.generate({
        length: 8,
        uppercase: true,
        lowercase: true,
        numbers: true,
        strict: true,
    });

    try {
        console.log('Sending credentials email');
        sendCredentials(email, passcode);

        console.log('Hashing password');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passcode, salt);

        console.log('Creating user in database');
        const user = await User.create({ email, fname, lname, password: hash, occupation, department });
        console.log('User created:', user);
        res.status(200).json({ email, user });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// Setup a user (Employee Request)
const signupRequestEmployee = async (req, res) => {
    console.log('Received Employee Signup Request');
    console.log('Request Body:', req.body);

    const { email } = req.body;
    let { fname, lname, occupation, department } = req.body;

    let errorList = {};
    let emptyMsg = 'Please complete this required field.';

    // Trim input values
    email = email ? email.trim() : '';
    fname = fname ? fname.trim() : '';
    lname = lname ? lname.trim() : '';
    occupation = occupation ? occupation.trim() : '';
    department = department ? department.trim() : '';

    // Validating input fields
    if (!email) {
        errorList.email = emptyMsg;
    } else if (!validator.isEmail(email)) {
        errorList.email = 'Email entered is invalid.';
    } else {
        try {
            console.log('Checking if email exists in database');
            const userExists = await User.findOne({ email });
            if (!userExists) {
                errorList.email = 'Email does not exist.';
            }
        } catch (error) {
            console.error('Error checking email:', error.message);
            errorList.email = 'Error checking email.';
        }
    }

    if (!fname) {
        errorList.fname = emptyMsg;
    } else if (!validator.isAlpha(fname)) {
        errorList.fname = 'First name must only contain alphabets.';
    } else if (fname.length > 15) {
        errorList.fname = 'First name must be a maximum of 15 characters.';
    }

    if (!lname) {
        errorList.lname = emptyMsg;
    } else if (!validator.isAlpha(lname)) {
        errorList.lname = 'Last name must only contain alphabets.';
    } else if (lname.length > 15) {
        errorList.lname = 'Last name must be a maximum of 15 characters.';
    }

    if (!occupation) {
        errorList.occupation = emptyMsg;
    } else if (occupation !== 'admin' && occupation !== 'employee') {
        errorList.occupation = 'Occupation entered is invalid.';
    }

    if (!department) {
        errorList.department = emptyMsg;
    }

    if (Object.keys(errorList).length !== 0) {
        console.log('Validation Errors:', errorList);
        return res.status(400).json({ error: 'Error with input fields', errorList });
    }

    try {
        console.log('Updating user information in database');
        const user = await User.updateOne(
            { email },
            { fname, lname, occupation, department },
            { new: true }
        );
        if (user.modifiedCount === 0) {
            console.log('No updates made to the user');
            return res.status(400).json({ error: 'No updates made to the user.' });
        }
        console.log('User updated:', user);
        res.status(200).json({ email, user });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    signupRequestAdmin,
    signupRequestEmployee,
};
