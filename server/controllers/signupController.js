const User = require('../models/userData');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const validator = require('validator');
const generator = require('generate-password');
// const jwt = require('jsonwebtoken');

const {sendCredentials} = require('./mailer/sendCredentials')

// Signup a user
const signupRequestAdmin = async (req, res) => {

    let {email, salary, occupation, department} = req.body;

    let errorList = {};
    let emptyMsg = 'Please complete this required field.';


    if (email) {email = email.trim();}
    if (salary) {salary = salary.trim();}
    if (occupation) {occupation = occupation.trim();}
    if (department) {department = department.trim();}
    
    // Validating input fields
    if(!email)
    {
        errorList.email = emptyMsg;
    }
    else if (!validator.isEmail(email)) 
    {
        errorList.email = 'Email entered is invalid.';
    }
    else
    {
        try{
            const contains = await User.findOne({email});
            if (contains) 
            {
                errorList.email = 'Email already in use.';
            }
        }
        catch (error){
            errorList.email = 'Email already in use.';
        }
    }

    if(!salary)
        errorList.salary = emptyMsg;
    else if(!validator.isNumeric(salary) || salary < 0)
    {
        errorList.salary = 'Salary entered must be greater than or equal to 0';
    }

    if(!occupation)
        errorList.occupation = emptyMsg;
    else if(occupation != 'admin' && occupation != 'employee')
        errorList.occupation = 'Occupation entered is invalid.'

    if(!department)
        errorList.department = emptyMsg;

    if(Object.keys(errorList).length !== 0){
        return res.status(400).json({error: 'Error with input fields', errorList});
    }

    // Generating a random password
    const passcode = generator.generate({
        length: 8,
        uppercase: true,
        lowercase: true,
        numbers: true,
        strict: true
    });

    try{

        sendCredentials(email, passcode);

        // Adding randon nonce to generate unique hash for same passwords
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passcode, salt);

        const user = await User.create({email, password : hash, salary, occupation, department});
        res.status(200).json({email, user})
    }
    catch (error){
        res.status(400).json({error: error.message});
    }
};

// Setup a user
const signupRequestEmployee = async (req, res) => {

    const {email} = req.email;
    let {fname, lname, dob, gender, residence} = req.body;

    let errorList = {};
    let emptyMsg = 'Please complete this required field.';

    if (fname) {fname = fname.toLowerCase().trim();}
    if (lname) {lname = lname.toLowerCase().trim();}
    
    // Validating input fields
    if(!fname)
        errorList.fname = emptyMsg;
    else if(!validator.isAlpha(fname))
        errorList.fname = 'Name must only have alphabets';
    else if(fname.length > 15)
        errorList.fname = 'Maximum 15 characters';

    if(!lname)
        errorList.lname = emptyMsg;
    else if(!validator.isAlpha(lname))
        errorList.lname = 'Name must only have alphabets';
    else if(lname.length > 15)
        errorList.lname = 'Maximum 15 characters';

    if(!dob)
        errorList.dob = emptyMsg;
    else if(!validator.isDate(dob))
        errorList.dob = 'Invalid date';

    if(!gender)
        errorList.gender = emptyMsg;
    else if(gender != 'male' && gender != 'female')
        errorList.gender = 'Gender entered is invalid.'

    if(!residence)
        errorList.residence = emptyMsg;

    if(Object.keys(errorList).length !== 0){
        return res.status(400).json({error: 'Error with input fields', errorList});
    }

    try{

        const user = await User.updateOne({email} , {fname, lname, dob, gender, residence});
        res.status(200).json({email, user})
    }
    catch (error){
        res.status(400).json({error: error.message});
    }
};

module.exports = {
    signupRequestAdmin,
    signupRequestEmployee
}
