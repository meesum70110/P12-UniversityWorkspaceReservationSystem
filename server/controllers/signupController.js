const User = require('../models/userData'); // Importing the User model for interacting with user data in MongoDB
const mongoose = require('mongoose'); // Importing mongoose for MongoDB interactions

const bcrypt = require('bcrypt'); // Bcrypt for hashing passwords
const validator = require('validator'); // Validator for input validation (e.g., email, date, etc.)
const generator = require('generate-password'); // Generator for creating random passwords

// Importing the function to send credentials email
const {sendCredentials} = require('./mailer/sendCredentials')

// Signup a user (admin)
const signupRequestAdmin = async (req, res) => {

    let {email, salary, occupation, department} = req.body; // Destructuring input from request body

    let errorList = {}; // List to hold any validation errors
    let emptyMsg = 'Please complete this required field.'; // Message for missing fields

    // Trimming whitespace from the fields for consistency
    if (email) {email = email.trim();}
    if (salary) {salary = salary.trim();}
    if (occupation) {occupation = occupation.trim();}
    if (department) {department = department.trim();}

    // Validating input fields
    if(!email)
        errorList.email = emptyMsg; // Email is required
    else if (!validator.isEmail(email)) 
        errorList.email = 'Email entered is invalid.'; // Validate the email format
    else {
        try{
            const contains = await User.findOne({email}); // Check if email already exists in the database
            if (contains) 
                errorList.email = 'Email already in use.'; // If email exists, return error
        }
        catch (error){
            errorList.email = 'Email already in use.'; // Catch any DB error
        }
    }

    // Validating salary
    if(!salary)
        errorList.salary = emptyMsg; // Salary is required
    else if(!validator.isNumeric(salary) || salary < 0) // Salary must be a positive number
        errorList.salary = 'Salary entered must be greater than or equal to 0';

    // Validating occupation
    if(!occupation)
        errorList.occupation = emptyMsg; // Occupation is required
    else if(occupation != 'admin' && occupation != 'employee') // Only 'admin' or 'employee' are allowed
        errorList.occupation = 'Occupation entered is invalid.';

    // Validating department
    if(!department)
        errorList.department = emptyMsg; // Department is required

    if(Object.keys(errorList).length !== 0){
        return res.status(400).json({error: 'Error with input fields', errorList}); // Return validation errors
    }

    // Generating a random password for the admin
    const passcode = generator.generate({
        length: 8, // Length of the password
        uppercase: true,
        lowercase: true,
        numbers: true,
        strict: true // Enforcing strict password rules
    });

    try {
        // Send credentials email to the admin with the generated password
        sendCredentials(email, passcode);

        // Hash the password using bcrypt before storing it in the database
        const salt = await bcrypt.genSalt(10); 
        const hash = await bcrypt.hash(passcode, salt); 

        // Creating the new admin user in the database
        const user = await User.create({email, password : hash, salary, occupation, department});
        res.status(200).json({email, user}); // Return success response
    }
    catch (error){
        res.status(400).json({error: error.message}); // Return error message if user creation fails
    }
};

// Setup a user (employee)
const signupRequestEmployee = async (req, res) => {

    const {email} = req.email; // Getting email from authenticated request
    let {fname, lname, dob, gender, residence} = req.body; // Destructuring employee info from request body

    let errorList = {}; // List to hold validation errors
    let emptyMsg = 'Please complete this required field.'; // Message for missing fields

    // Trimming the input fields
    if (fname) {fname = fname.toLowerCase().trim();}
    if (lname) {lname = lname.toLowerCase().trim();}

    // Validating employee name fields
    if(!fname)
        errorList.fname = emptyMsg; // First name is required
    else if(!validator.isAlpha(fname)) // Name must contain only alphabets
        errorList.fname = 'Name must only have alphabets';
    else if(fname.length > 15) // Limit first name length to 15 characters
        errorList.fname = 'Maximum 15 characters';

    if(!lname)
        errorList.lname = emptyMsg; // Last name is required
    else if(!validator.isAlpha(lname)) // Last name must contain only alphabets
        errorList.lname = 'Name must only have alphabets';
    else if(lname.length > 15) // Limit last name length to 15 characters
        errorList.lname = 'Maximum 15 characters';

    // Validating date of birth
    if(!dob)
        errorList.dob = emptyMsg; // Date of birth is required
    else if(!validator.isDate(dob)) // Validate the date format
        errorList.dob = 'Invalid date';

    // Validating gender
    if(!gender)
        errorList.gender = emptyMsg; // Gender is required
    else if(gender != 'male' && gender != 'female') // Only male or female are allowed
        errorList.gender = 'Gender entered is invalid.';

    // Validating residence
    if(!residence)
        errorList.residence = emptyMsg; // Residence is required

    // If there are validation errors, return them
    if(Object.keys(errorList).length !== 0){
        return res.status(400).json({error: 'Error with input fields', errorList});
    }

    try {
        // Update the employee's details in the database
        const user = await User.updateOne({email}, {fname, lname, dob, gender, residence});
        res.status(200).json({email, user}); // Return success response
    }
    catch (error){
        res.status(400).json({error: error.message}); // Return error if update fails
    }
};

module.exports = {
    signupRequestAdmin, // Export the admin signup function
    signupRequestEmployee // Export the employee signup function
};
