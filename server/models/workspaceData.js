// Importing Mongoose to define schemas and models for MongoDB
const mongoose = require('mongoose');

// Extracting Schema from Mongoose to structure workspace data
const Schema = mongoose.Schema;

// Defining the Workspace schema to represent workspaces in the database
const workspaceSchema = new Schema({
    title: { 
        type: String, // Field to store the workspace title
        required: false // Optional field; can be omitted
    },
    description: { 
        type: String, // Field to store a brief description of the workspace
        required: false // Optional field; can be omitted
    },
    status: { 
        type: String, // Field to indicate the workspace's availability status
        enum: ['available', 'unavailable'], // Restricts values to specific statuses
        default: 'available' // Default status is set to 'available'
    },
    responses: { 
        type: [String], // Array field to store associated responses, if any
        default: [] // Defaults to an empty array if no responses exist
    },
    visibility: { 
        type: String, // Field to store the visibility status of the workspace
        required: false // Optional field; can be omitted
    },
    room: { 
        type: String, // Field to specify the room associated with the workspace
        required: true // Mandatory field to link the workspace to a specific room
    },
    tables: [ // Nested array to define the tables within the workspace
        {
            tableNumber: { 
                type: String, // Field to store the table's unique identifier
                required: true // Mandatory for each table
            },
            availability: { 
                type: String, // Field to indicate table's booking status
                enum: ['available', 'booked'], // Restricts values to specific statuses
                default: 'available' // Default availability is set to 'available'
            },
            bookingDetails: { 
                type: [{ type: Schema.Types.ObjectId, ref: 'Booking' }], // References to the Booking schema
                default: [] // Defaults to an empty array if no bookings exist
            }
        }
    ]
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields for tracking
});

// Exporting the Workspace model for use in other parts of the application
module.exports = mongoose.model('Workspace', workspaceSchema);
