// Importing required modules
const Faqs = require('../models/faqsData'); // Importing Faqs model for interacting with FAQ data in the database
const mongoose = require('mongoose'); // Importing Mongoose for database operations
const main = require('../server'); // Importing main server to use socket.io for real-time communication

// GET all faqs - Fetches all FAQ data from the database, sorted by creation date
const getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faqs.find({}).sort({createdAt: -1}); // Retrieve all FAQs and sort by createdAt in descending order
        res.status(200).json(faqs); // Return the FAQ data in the response
    } catch (error) {
        res.status(400).json({error: 'Error occured while fetching all faqs'}); // Return error if fetching fails
    }
};

// POST a new faq - Adds a new FAQ to the database
const addFaq = async (req, res) => {
    const {question, answer} = req.body; // Extract question and answer from request body

    let errorFields = []; // Array to store missing fields if any
    if (!question) {
        errorFields.push('Question'); // If question is missing, add to error list
    }
    if (!answer) {
        errorFields.push('Answer'); // If answer is missing, add to error list
    }
    if (errorFields.length !== 0) {
        return res.status(400).json({error: 'Please fill out all the fields', errorFields}); // If fields are missing, return error
    }

    try {
        const faq = await Faqs.create({question, answer}); // Create a new FAQ in the database

        try {
            const allFaqs = await Faqs.find({}).sort({createdAt: -1}); // Fetch all FAQs after adding the new one, sorted by creation date
            main.io.emit('faqs', allFaqs); // Emit the updated FAQ list using socket.io to notify clients
        } catch (error) {
            return res.status(400).json({error: 'Faq added but socket error occured'}); // If socket error occurs, handle it
        }

        res.status(200).json({mssg: 'Faq has been added'}); // Return success message if FAQ is added successfully
    } catch (error) {
        res.status(400).json({error: error.message}); // Handle and return any errors during FAQ creation
    }
};

// DELETE a Faq - Deletes a specific FAQ by ID from the database
const deleteFaq = async (req, res) => {
    const {id} = req.params; // Extract FAQ ID from request parameters

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such faq exists in the database'}); // If ID is not valid, return error
    }

    try {
        const faq = await Faqs.findByIdAndDelete({_id: id}); // Delete FAQ by ID
        if (faq) {
            try {
                const allFaqs = await Faqs.find({}).sort({createdAt: -1}); // Fetch all FAQs after deletion, sorted by creation date
                main.io.emit('faqs', allFaqs); // Emit updated FAQ list using socket.io
            } catch (error) {
                return res.status(400).json({error: 'Faq deleted but socket error occured'}); // Handle socket error after deletion
            }

            res.status(200).json({mssg: 'Faq has been deleted'}); // Return success message if FAQ is deleted successfully
        } else {
            res.status(404).json({error: 'No such faq exists in the database'}); // Return error if FAQ with the given ID does not exist
        }
    } catch (error) {
        res.status(400).json({error: error.message}); // Handle and return any errors during FAQ deletion
    }
};

// Exporting all controller functions for use in routes
module.exports = {
    getAllFaqs,
    addFaq,
    deleteFaq,
};
