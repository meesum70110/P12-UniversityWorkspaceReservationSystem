// Importing the Mongoose library for database schema and model creation
const mongoose = require('mongoose'); 

// Extracting Schema from Mongoose to define data structure
const Schema = mongoose.Schema;

// Importing Moment.js for date manipulation (not used here but useful for date formatting)
const moment = require('moment'); 

// Defining the Booking schema to represent booking documents in the database
const bookingSchema = new Schema({
    workspace: { 
        type: Schema.Types.ObjectId, // Reference to the associated Workspace document
        ref: 'Workspace', // Links this field to the Workspace model
        required: true // Ensures that this field is mandatory
    },
    room: { 
        type: String, // Stores the name or identifier of the room
        required: true // Ensures this field must be provided
    },
    tableNumber: { 
        type: String, // Stores the identifier of the table being booked
        required: true // Makes this field mandatory
    },
    firstName: {
        type: String, // Stores the first name of the person making the booking
        required: true // Makes this field mandatory
    },
    email: {
        type: String, // Stores the email address of the person making the booking
        required: true // Ensures this field must be provided
    },
    date: { 
        type: Date, // Stores the date of the booking
        required: true // Ensures the date field is mandatory
    },
    timeSlot: { 
        type: String, // Stores the time slot for the booking
        required: true // Makes this field mandatory
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Exporting the Booking model for use in other parts of the application
module.exports = mongoose.model('Booking', bookingSchema);
