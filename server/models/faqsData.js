// Importing the Mongoose library for defining schemas and models
const mongoose = require('mongoose');

// Extracting Schema from Mongoose to structure data
const Schema = mongoose.Schema;

// Defining the FAQ schema to represent frequently asked questions in the database
const faqsSchema = new Schema({
    question: { 
        type: String, // Field to store the question text
        required: true // Ensures the question field is mandatory
    },
    answer: { 
        type: String, // Field to store the corresponding answer text
        required: true // Ensures the answer field is mandatory
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields for tracking
});

// Exporting the FAQ model for use in other parts of the application
module.exports = mongoose.model('Faqs', faqsSchema);
