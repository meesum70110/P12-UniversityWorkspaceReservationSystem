// Import the Survey model to interact with the MongoDB database
const Survey = require('../models/workspaceData');
const mongoose = require('mongoose'); // MongoDB object modeling tool

// Import the main server module which includes the socket.io instance
// const main = require('../server');
const { io } = require('../server');

const getSurveys = async (req, res) => {
    const { description, status } = req.query;

    let query = {};
    if (description && description !== 'All') {
        query.description = description;
    }
    if (status && status !== '') {
        query.status = status;
    }

    try {
        const surveys = await Survey.find(query).sort({createdAt: -1});
        res.status(200).json(surveys);
    } catch (error) {
        res.status(400).json({error: 'Error occurred while fetching surveys'});
    }
};




// Adding a new survey to the database
const addSurvey = async (req, res) => {
    // Extracting title, status and description from the request body
    const {title, description, status} = req.body;

    // Checking if the required fields are present
    let errorFields = [];
    if (!title) {
        errorFields.push('Title');
    }
    if (!description) {
        errorFields.push('Description');
    }
    if (!status) {
        errorFields.push('Status');
    }

    // If any required fields are missing, return an error
    if (errorFields.length != 0) {
        return res.status(400).json({error: 'Please fill out all the fields', errorFields});
    }

    try {
        // Creating a new survey in the database with the specified title, status, description, and default visibility set to true
        const survey = await Survey.create({title, description, status, visibility: 'true'});

        // Emitting the updated list of surveys to all connected clients using socket.io
        try {
            const allSurveys = await Survey.find({}).sort({createdAt: -1});
            io.emit('surveys', allSurveys);
        } catch (error) {
            return res.status(400).json({error: 'Survey added but socket error occurred'});
        }

        res.status(200).json({message: 'Survey has been added'});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Adding a comment to an existing survey
const addComment = async (req, res) => {
    const {id} = req.params; // Get the survey ID from the URL parameters
    const {email} = req.email; // Assume email is available in req.email, typically set by authentication middleware
    const {response} = req.body; // Get the comment from the request body

    // Validate the survey ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such survey exists in the database'});
    }

    // Check if the comment field is filled
    let errorFields = [];
    if (!response) {
        errorFields.push('Response');
        return res.status(400).json({error: 'Please fill out the comment field', errorFields});
    }

    // Append the email to the response for tracking
    let response_append = email + ';' + response;

    // Update the survey by adding the new comment to the responses array
    try {
        const survey = await Survey.findOneAndUpdate({_id: id}, {$push: {responses: response_append}});
        if (survey) {
            try {
                // After updating, emit the updated list of surveys to all connected clients
                const allSurveys = await Survey.find({}).sort({createdAt: -1});
                io.emit('surveys', allSurveys);
            } catch (error) {
                return res.status(400).json({error: 'Comment added but socket error occurred'});
            }
            res.status(200).json({message: 'Comment added'});
        } else {
            res.status(404).json({error: 'No such survey exists in the database'});
        }
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Delete a survey from the database
const deleteSurvey = async (req, res) => {
    const {id} = req.params; // Get the survey ID from the URL parameters

    // Validate the survey ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such survey exists in the database'});
    }

    try {
        // Delete the survey from the database
        const survey = await Survey.findByIdAndDelete({_id: id});
        if (survey) {
            try {
                // Emit the updated list of surveys to all connected clients
                const allSurveys = await Survey.find({}).sort({createdAt: -1});
                io.emit('surveys', allSurveys);
            } catch (error) {
                return res.status(400).json({error: 'Survey deleted but socket error occurred'});
            }
            res.status(200).json({message: 'Survey has been deleted'});
        } else {
            res.status(404).json({error: 'No such survey exists in the database'});
        }
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Update the visibility of a survey
const surveyVisibility = async (req, res) => {
    const {id} = req.params; // Get the survey ID from the URL parameters

    // Validate the survey ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such survey exists in the database'});
    }

    try {
        // Update the survey with the new visibility status
        const survey = await Survey.findOneAndUpdate({_id: id}, {...req.body});
        if (survey) {
            try {
                // Emit the updated list of surveys to all connected clients
                const allSurveys = await Survey.find({}).sort({createdAt: -1});
                io.emit('surveys', allSurveys);
            } catch (error) {
                return res.status(400).json({error: 'Survey updated but socket error occurred'});
            }
            res.status(200).json({message: 'Survey updated'});
        } else {
            res.status(404).json({error: 'No such survey exists in the database'});
        }
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Export all controller functions to be used by router
module.exports = {
    getSurveys,
    addSurvey,
    addComment,
    deleteSurvey,
    surveyVisibility
};
