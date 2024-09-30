const User = require('../models/userData');
const Leave = require('../models/leaveData');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const validator = require('validator');

// GET user profile
const getProfile = async (req, res) => {

    try{
        const {email} = req.email;
        const user = await User.findOne({email});
        if (user)
            res.status(200).json(user);
        else
            res.status(404).json({error : 'User not found'});
    }
    catch (error){
        res.status(400).json({error: error.message});
    }

};

// Search for Users
const searchUsers = async (req, res) => {

    let {email, department} = req.body;
    let filter = {occupation : 'employee', fname:{$exists:true}};

    if (email)
        filter.email = email;
    if (department)
    {
        filter.department = department
    }

    try{
        const user = await User.find({...filter}).sort({fname : 1, lname : 1});
        res.status(200).json(user);
    }
    catch (error){
        res.status(400).json({error: error.message});
    }
};

// Update user photo
const updatePhoto = async (req, res) => {

    const {photo} = req.body;
    try{
        const {email} = req.email;

        if(photo)
        {
            const user = await User.findOneAndUpdate({email}, {photo});
            if (user)
                res.status(200).json({mssg: 'Photo updated'});
            else
                res.status(400).json({error : 'Unable to update photo'});
        }
        else
        {
            const user = await User.updateOne({email}, {$unset: {photo: ""}});
            if (user)
                res.status(200).json({mssg: 'Photo removed'});
            else
                res.status(400).json({error : 'Unable to update photo'});
        }
    }
    catch (error){
        res.status(400).json({error: error.message});
    }
};

// Update user password
const updatePassword = async (req, res) => {

    try{
        const {email} = req.email;
        const {oldPassword, newPassword1, newPassword2} = req.body;

        let errorList = {};
        let emptyMsg = 'Please complete this required field.';

        const user = await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({error: 'Account not found', errorList});
        }

        if(!oldPassword)
        {
            errorList.oldPassword = emptyMsg;
        }
        else
        {
            const compare = await bcrypt.compare(oldPassword, user.password);
            if (!compare)
            {
                errorList.oldPassword = 'Incorrect password';
            }
        }

        if(!newPassword1 || !newPassword2)
        {
            if(!newPassword1)
                errorList.newPassword1 = emptyMsg;
            if(!newPassword2)
                errorList.newPassword2 = emptyMsg;  
        }
        else if(newPassword1 !== newPassword2)
        {
            errorList.newPassword1 = 'New passwords dont match';
            errorList.newPassword2 = 'New passwords dont match';
        }
        else if(oldPassword === newPassword1)
        {
            errorList.oldPassword = 'Current and new password cannot be same';
            errorList.newPassword1 = 'Current and new password cannot be same';
            errorList.newPassword2 = 'Current and new password cannot be same';
        }
        else if (!validator.isStrongPassword(newPassword1))
        {
            errorList.newPassword1 = 'Please enter a strong password';
            errorList.newPassword2 = 'Please enter a strong password';       
        }

        if(Object.keys(errorList).length != 0){
            return res.status(400).json({error: 'Error with password fields', errorList});
        }


        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword1, salt);

        const update = await User.findOneAndUpdate({email}, {password : hash});
        if (update)
            res.status(200).json({mssg : 'Password updated'});
        else
            res.status(400).json({error : 'Could not update password', errorList});
    }
    catch (error){
        res.status(400).json({error: 'Account not found, contact admin'});
    }
};

// Update user info
const updateInfo = async (req, res) => {
    try{
        const {email} = req.email;
        let {fname, lname, dob, gender, residence} = req.body;

        let errorList = {};
        let updateList = {};

        if(!fname && !lname && !dob && !gender && !residence)
        {
            return res.status(400).json({error: 'No fields to update', errorList});
        }
        
        // Validating input fields
        if(fname)
        {
            fname = fname.toLowerCase().trim();
            if (!validator.isAlpha(fname))
                errorList.fname = 'Name must only have alphabets';
            else if(fname.length > 15)
                errorList.fname = 'Maximum 15 characters';
            else
                updateList.fname = fname;
        }
        if(lname)
        {
            lname = lname.toLowerCase().trim();
            if (!validator.isAlpha(lname))
                errorList.lname = 'Name must only have alphabets';
            else if(lname.length > 15)
                errorList.lname = 'Maximum 15 characters';
            else
                updateList.lname = lname;
        }

        if(dob)
        {
            if(!validator.isDate(dob))
                errorList.dob = 'Invalid date';     
            else
                updateList.dob = dob;
        }

        if(gender)
        {
            if(gender != 'male' && gender != 'female')
                errorList.gender = 'Gender entered is invalid.' 
            else
                updateList.gender = gender;
        }

        if(residence)
            updateList.residence = residence;

        if(Object.keys(errorList).length !== 0){
            return res.status(400).json({error: 'Error with input fields', errorList});
        }

        const update = await User.findOneAndUpdate({email} , {...updateList});
        if (update)
            res.status(200).json({mssg : 'Info updated'});
        else
            res.status(400).json({error : 'Could not update info', errorList});
    }
    catch (error){
        res.status(400).json({error: 'Account not found, contact admin'});
    }
};

// Retrieve user profile requested by admin
const getProfileAdmin = async (req, res) => {

    const {email} = req.body;
    try{
        if (email)
        {
            const user = await User.findOne({email, occupation : 'employee'});
            if (user)
                res.status(200).json(user);
            else
                res.status(404).json({error : 'User not found'});
        }
        else{
            res.status(400).json({error : 'Email not provided'}); 
        }
    }
    catch (error){
        res.status(400).json({error: error.message});
    }
};

// UPDATE user company specific info
const updateSensitive = async (req, res) => {

    const {email, salary, department} = req.body;

    let errorList = {};
    let updateList = {};

    if(!salary && !department)
    {
        return res.status(400).json({error: 'No fields to update', errorList});
    }
    
    // Validating input fields
    if(!email)
    {
        return res.status(400).json({error: 'Employee account not found', errorList});
    }

    const user = await User.findOne({email})
    if (!user) 
    {
        return res.status(400).json({error: 'Employee account not found', errorList});
    }

    if(salary)
    {
        if(!validator.isNumeric(salary) || salary < 0)
            errorList.salary = 'Salary entered must be greater than or equal to 0';
        else
            updateList.salary = salary;
    }

    if (department)
        updateList.department = department;

    if(Object.keys(errorList).length !== 0){
        return res.status(400).json({error: 'Error with input fields', errorList});
    }

    try{
        const updateUser = await User.findOneAndUpdate({email} , {...updateList});
        if (updateUser)
            res.status(200).json({mssg : 'Info updated'});
        else
            res.status(400).json({error : 'Could not update info', errorList});
    }
    catch (error){
        res.status(400).json({error: error.message, errorList});
    }
};

// DELETE a user
const deleteUser = async (req, res) => {
    const {id} = req.params;

    try{
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({error : 'No such user exists in the database'});
        }
    
        const user = await User.findByIdAndDelete({_id: id});
    
        if (user)
        {
            const leave = await Leave.deleteMany({email_id : user.email});
            res.status(200).json({mssg : 'User deleted'});
        }
        else
            res.status(404).json({error : 'No such user exists in the database'});
    }
    catch (error){
        res.status(400).json({error: error.message});
    }
    
};


module.exports = {
    getProfile,
    searchUsers,
    updatePhoto,
    updatePassword,
    updateInfo,
    getProfileAdmin,
    updateSensitive,
    deleteUser
}
