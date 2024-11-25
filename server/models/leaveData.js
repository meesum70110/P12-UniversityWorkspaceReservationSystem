// Importing the Mongoose library for defining schemas and models
const mongoose = require('mongoose');

// Extracting Schema from Mongoose to structure the leave data
const Schema = mongoose.Schema;

// Defining the Leave schema to represent leave requests in the database
const leaveSchema = new Schema({
    email_id: { 
        type: String, // Field to store the email ID of the employee requesting leave
        required: true // Ensures the email ID field is mandatory
    },
    startDate: { 
        type: Date, // Field to store the starting date of the leave
        required: true // Ensures the startDate field is mandatory
    },
    endDate: { 
        type: Date, // Field to store the ending date of the leave
        required: true // Ensures the endDate field is mandatory
    },
    description: { 
        type: String, // Field to store a description or reason for the leave
    },
    attachment: { 
        type: String, // Field to store the path or URL of an attachment (if any)
    },
    standing: { 
        type: String, // Field to store the current status of the leave (e.g., 'Pending', 'Approved', 'Rejected')
        required: true // Ensures the standing field is mandatory
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields for tracking
});

// Exporting the Leave model for use in other parts of the application
module.exports = mongoose.model('Leave', leaveSchema);
