const mongoose = require('mongoose'); // Importing mongoose for MongoDB operations
const Schema = mongoose.Schema; // Extracting Schema constructor for schema definition

// Defining the schema for workspaces
const workspaceSchema = new Schema(
  {
    title: {
      type: String, // Title of the workspace
      required: false, // Optional field
    },
    description: {
      type: String, // Description of the workspace
      required: false, // Optional field
    },
    status: {
      type: String, // Status indicating if the workspace is available or unavailable
      enum: ['available', 'unavailable'], // Restricting to predefined values
      default: 'available', // Default value set to 'available'
    },
    responses: {
      type: [String], // Array of responses (e.g., comments or feedback)
      default: [], // Default is an empty array if no responses exist
    },
    visibility: {
      type: String, // Visibility status (e.g., public or private)
      required: false, // Optional field
    },
    room: {
      type: String, // Room identifier (e.g., Room #01)
      required: true, // Mandatory field to associate workspace with a room
    },
    tables: [
      {
        tableNumber: {
          type: String, // Table identifier (e.g., T1, T2)
          required: true, // Each table must have a unique identifier
        },
        availability: {
          type: String, // Availability status of the table
          enum: ['available', 'booked'], // Restricting to 'available' or 'booked'
          default: 'available', // Default status set to 'available'
        },
        bookingDetails: {
          type: [{ type: Schema.Types.ObjectId, ref: 'Booking' }], // Array of references to Booking schema
          default: [], // Default is an empty array if no bookings exist
        },
      },
    ],
  },
  { timestamps: true } // Automatically adding `createdAt` and `updatedAt` timestamps
);

module.exports = mongoose.model('Workspace', workspaceSchema); // Exporting the Workspace model based on the workspaceSchema
