const mongoose = require('mongoose'); // Importing mongoose for MongoDB schema and model creation
const Schema = mongoose.Schema; // Extracting Schema constructor from mongoose
const moment = require('moment'); // Importing moment for date and time manipulation (if used)

// Defining the schema for bookings
const bookingSchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId, // Referring to an ObjectId in the Workspace collection
      ref: 'Workspace', // Specifying the reference collection
      required: true, // Marking the field as mandatory
    },
    room: {
      type: String, // Defining the room as a string
      required: true, // Making the room field mandatory
    },
    tableNumber: {
      type: String, // Defining the table number as a string
      required: true, // Marking the field as required
    },
    firstName: {
      type: String, // Storing the first name of the user who booked
      required: true, // This field must be provided
    },
    email: {
      type: String, // Email address of the booking user
      required: true, // Marking email as mandatory
    },
    date: {
      type: Date, // Storing the date of booking
      required: true, // Making the date field required
    },
    timeSlot: {
      type: String, // Defining the time slot as a string (e.g., "09:00 - 10:00")
      required: true, // Making the time slot mandatory
    },
  },
  { timestamps: true } // Automatically adding `createdAt` and `updatedAt` timestamps
);

module.exports = mongoose.model('Booking', bookingSchema); // Exporting the Booking model based on the bookingSchema
