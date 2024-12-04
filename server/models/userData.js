const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        required: true
    },
    lname: {
        type: String,
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
    photo: {
        type: String
    }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
