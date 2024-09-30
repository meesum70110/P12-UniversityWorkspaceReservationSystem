// Importing Mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Using the Schema constructor from mongoose to define the structure of the Survey document
const Schema = mongoose.Schema;

// Defining the Survey schema with necessary fields
const surveySchema = new Schema({
    title: {
        type: String,       // Data type is String
        required: true      // This field is required
    },
    description: {
        type: String,       // Data type is String
        required: true      // This field is required
    },
    // status: { 
    //     type: String, 
    //     required: true      // This field is required
    // },
    status: { 
        type: String, 
        enum: ['available', 'unavailable'], 
        default: 'available' 
    },
    responses: {
        type: [String]      // Array of Strings to hold responses
    },
    visibility: {
        type: String,       // Data type is String
        require: true       // This field is required (note: should be 'required' instead of 'require')
    }
}, {timestamps : true}); // Enable automatic timestamps for createdAt and updatedAt

// Exporting the model to be used in other parts of the application
module.exports = mongoose.model('Survey', surveySchema);
