// Importing necessary modules
const User = require('../models/userData'); // Importing User model
const Leave = require('../models/leaveData'); // Importing Leave model
const mongoose = require('mongoose'); // Importing Mongoose for database operations

const bcrypt = require('bcrypt'); // Importing bcrypt for password encryption
const validator = require('validator'); // Importing validator for input validation

// GET user profile - Fetches the profile details of the currently authenticated user
const getProfile = async (req, res) => {
    try {
        const {email} = req.email; // Extract email from the request object
        const user = await User.findOne({email}); // Fetch user from the database based on the email
        if (user) 
            res.status(200).json(user); // If user found, return the profile data
        else 
            res.status(404).json({error : 'User not found'}); // If no user is found, return an error message
    } catch (error) {
        res.status(400).json({error: error.message}); // Catch any errors and return them
    }
};

// Search for Users - Allows search for users based on email or department
const searchUsers = async (req, res) => {
    let {email, department} = req.body; // Get email and department from the request body
    let filter = {occupation : 'employee', fname: {$exists: true}}; // Default filter to search employees with first names

    if (email)
        filter.email = email; // Add email filter if provided
    if (department) 
        filter.department = department; // Add department filter if provided

    try {
        const user = await User.find({...filter}).sort({fname : 1, lname : 1}); // Fetch users based on filter and sort by first and last name
        res.status(200).json(user); // Return the found users
    } catch (error) {
        res.status(400).json({error: error.message}); // Catch any errors and return them
    }
};

// Update user photo - Allows the user to update their profile photo
const updatePhoto = async (req, res) => {
    const {photo} = req.body; // Get photo from the request body
    try {
        const {email} = req.email; // Extract the user's email from the request object

        if(photo) {
            const user = await User.findOneAndUpdate({email}, {photo}); // Update photo field in the database
            if (user)
                res.status(200).json({mssg: 'Photo updated'}); // Return success message
            else
                res.status(400).json({error : 'Unable to update photo'}); // Return error if photo update fails
        } else {
            const user = await User.updateOne({email}, {$unset: {photo: ""}}); // Remove photo if it's not provided
            if (user)
                res.status(200).json({mssg: 'Photo removed'}); // Return success message for photo removal
            else
                res.status(400).json({error : 'Unable to update photo'}); // Return error if removal fails
        }
    } catch (error) {
        res.status(400).json({error: error.message}); // Catch any errors and return them
    }
};

// Update user password - Allows the user to update their password with validation checks
const updatePassword = async (req, res) => {
    try {
        const {email} = req.email; // Extract email from the request object
        const {oldPassword, newPassword1, newPassword2} = req.body; // Get old and new passwords from the request body

        let errorList = {}; // Initialize an object to collect validation errors
        let emptyMsg = 'Please complete this required field.'; // Default error message for empty fields

        const user = await User.findOne({email}); // Find the user based on email
        if(!user) {
            return res.status(400).json({error: 'Account not found', errorList});
        }

        if(!oldPassword) {
            errorList.oldPassword = emptyMsg; // If old password is missing, add error
        } else {
            const compare = await bcrypt.compare(oldPassword, user.password); // Compare the entered old password with the stored one
            if (!compare) {
                errorList.oldPassword = 'Incorrect password'; // If passwords do not match, return error
            }
        }

        if(!newPassword1 || !newPassword2) {
            if(!newPassword1) errorList.newPassword1 = emptyMsg; // If new passwords are missing, add error
            if(!newPassword2) errorList.newPassword2 = emptyMsg;  
        } else if(newPassword1 !== newPassword2) {
            errorList.newPassword1 = 'New passwords dont match'; // If new passwords don't match, add error
            errorList.newPassword2 = 'New passwords dont match'; 
        } else if(oldPassword === newPassword1) {
            errorList.oldPassword = 'Current and new password cannot be same'; // If new password is the same as the old one, return error
            errorList.newPassword1 = 'Current and new password cannot be same';
            errorList.newPassword2 = 'Current and new password cannot be same';
        } else if (!validator.isStrongPassword(newPassword1)) {
            errorList.newPassword1 = 'Please enter a strong password'; // If new password is weak, add error
            errorList.newPassword2 = 'Please enter a strong password';       
        }

        if(Object.keys(errorList).length != 0) {
            return res.status(400).json({error: 'Error with password fields', errorList}); // Return validation errors if any
        }

        const salt = await bcrypt.genSalt(10); // Generate salt for hashing the password
        const hash = await bcrypt.hash(newPassword1, salt); // Hash the new password

        const update = await User.findOneAndUpdate({email}, {password : hash}); // Update the user's password in the database
        if (update)
            res.status(200).json({mssg : 'Password updated'}); // Return success message
        else
            res.status(400).json({error : 'Could not update password', errorList}); // Return error if update fails
    } catch (error) {
        res.status(400).json({error: 'Account not found, contact admin'}); // Catch any errors and return them
    }
};

// Update user info - Allows the user to update personal details such as name, gender, and residence
const updateInfo = async (req, res) => {
    try {
        const {email} = req.email; // Extract email from the request object
        let {fname, lname, dob, gender, residence} = req.body; // Get user info from the request body

        let errorList = {}; // Initialize an object to collect validation errors
        let updateList = {}; // Initialize an object to store updated fields

        if(!fname && !lname && !dob && !gender && !residence) {
            return res.status(400).json({error: 'No fields to update', errorList}); // If no fields provided, return error
        }

        // Validating input fields
        if(fname) {
            fname = fname.toLowerCase().trim();
            if (!validator.isAlpha(fname)) errorList.fname = 'Name must only have alphabets';
            else if(fname.length > 15) errorList.fname = 'Maximum 15 characters';
            else updateList.fname = fname;
        }
        if(lname) {
            lname = lname.toLowerCase().trim();
            if (!validator.isAlpha(lname)) errorList.lname = 'Name must only have alphabets';
            else if(lname.length > 15) errorList.lname = 'Maximum 15 characters';
            else updateList.lname = lname;
        }

        if(dob) {
            if(!validator.isDate(dob)) errorList.dob = 'Invalid date';     
            else updateList.dob = dob;
        }

        if(gender) {
            if(gender != 'male' && gender != 'female') errorList.gender = 'Gender entered is invalid.'; 
            else updateList.gender = gender;
        }

        if(residence) updateList.residence = residence;

        if(Object.keys(errorList).length !== 0) {
            return res.status(400).json({error: 'Error with input fields', errorList}); // Return validation errors if any
        }

        const update = await User.findOneAndUpdate({email}, {...updateList}); // Update the user data in the database
        if (update)
            res.status(200).json({mssg : 'Info updated'}); // Return success message
        else
            res.status(400).json({error : 'Could not update info', errorList}); // Return error if update fails
    } catch (error) {
        res.status(400).json({error: 'Account not found, contact admin'}); // Catch any errors and return them
    }
};

// Retrieve user profile requested by admin - Allows admin to retrieve another user's profile
const getProfileAdmin = async (req, res) => {
    const {email} = req.body; // Extract email from the request body
    try {
        if (email) {
            const user = await User.findOne({email, occupation : 'employee'}); // Find employee by email
            if (user)
                res.status(200).json(user); // Return user data if found
            else
                res.status(404).json({error : 'User not found'}); // Return error if no user found
        } else {
            res.status(400).json({error : 'Email not provided'}); // Return error if no email provided
        }
    } catch (error) {
        res.status(400).json({error: error.message}); // Catch and return any errors
    }
};

// UPDATE user company-specific info - Allows updating sensitive user information such as salary and department
const updateSensitive = async (req, res) => {
    const {email, salary, department} = req.body; // Extract email, salary, and department from request body

    let errorList = {}; // Initialize error list
    let updateList = {}; // Initialize fields to update

    if(!salary && !department) {
        return res.status(400).json({error: 'No fields to update', errorList}); // If no fields provided, return error
    }

    // Validate input fields
    if(!email) {
        return res.status(400).json({error: 'Employee account not found', errorList});
    }

    const user = await User.findOne({email}) // Find user by email
    if (!user) {
        return res.status(400).json({error: 'Employee account not found', errorList});
    }

    if(salary) {
        if(!validator.isNumeric(salary) || salary < 0)
            errorList.salary = 'Salary entered must be greater than or equal to 0'; // Validate salary
        else
            updateList.salary = salary;
    }

    if (department)
        updateList.department = department; // Update department if provided

    if(Object.keys(errorList).length !== 0) {
        return res.status(400).json({error: 'Error with input fields', errorList}); // Return validation errors if any
    }

    try {
        const updateUser = await User.findOneAndUpdate({email}, {...updateList}); // Update user data in the database
        if (updateUser)
            res.status(200).json({mssg : 'Info updated'}); // Return success message
        else
            res.status(400).json({error : 'Could not update info', errorList}); // Return error if update fails
    } catch (error) {
        res.status(400).json({error: error.message, errorList}); // Catch and return any errors
    }
};

// DELETE a user - Deletes a user and their associated leave data
const deleteUser = async (req, res) => {
    const {id} = req.params; // Extract user ID from the request parameters

    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({error : 'No such user exists in the database'}); // If invalid ID, return error
        }

        const user = await User.findByIdAndDelete({_id: id}); // Delete user by ID

        if (user) {
            const leave = await Leave.deleteMany({email_id : user.email}); // Also delete associated leave data
            res.status(200).json({mssg : 'User deleted'}); // Return success message
        } else {
            res.status(404).json({error : 'No such user exists in the database'}); // Return error if no user found
        }
    } catch (error) {
        res.status(400).json({error: error.message}); // Catch and return any errors
    }
};

// Exporting all controller functions for use in routes
module.exports = {
    getProfile,
    searchUsers,
    updatePhoto,
    updatePassword,
    updateInfo,
    getProfileAdmin,
    updateSensitive,
    deleteUser
};
