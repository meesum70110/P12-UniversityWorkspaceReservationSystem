const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const bcrypt = require('bcrypt');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fname: {
        type: String,
    },
    lname: {
        type: String,
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
    },
    salary: {
        type: Number,
        required: true
    },
    occupation: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    residence: {
        type: String,
    },
    photo: {
        type: String,
    }
}, {timestamps : true});

module.exports = mongoose.model('User', userSchema)
