// Importing necessary modules
const Workspace = require('../models/workspaceData'); // Importing the Workspace model for interacting with workspace data
const Booking = require('../models/booking'); // Importing the Booking model for managing booking data
const mongoose = require('mongoose'); // Importing Mongoose for interacting with MongoDB
const { io } = require('../server'); // Importing the Socket.IO instance for real-time updates
const moment = require('moment'); // Importing Moment.js for date manipulation

// Retrieving workspaces with optional filters and bookings
const getSurveys = async (req, res) => {
    const { description, status, room, date, time } = req.query; // Destructuring query parameters from the request
    const query = {}; // Initializing an empty query object for filtering workspaces

    // Adding filters to the query based on the provided query parameters
    if (description && description !== "All") query.description = description;
    if (status) query.status = status;
    if (room && room !== "All") query.room = room;

    // Handling date and time filters for booking availability
    if (date && time) {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Converting date and time to a JavaScript Date object
        const endTime = moment(startTime).add(1, "hour").toDate(); // Adding one hour to the start time for the booking duration
        query["tables.bookingDetails"] = {
            $not: {
                $elemMatch: {
                    date: startTime, // Matching the booking date
                    timeSlot: `${time} - ${moment(time, "HH:mm").add(1, "hour").format("HH:mm")}`, // Matching the time slot
                },
            },
        };
    }

    try {
        const workspaces = await Workspace.find(query).sort({ createdAt: -1 }); // Retrieving workspaces from the database, sorted by creation date
        console.log("Surveys fetched:", workspaces); // Debugging: logging the retrieved workspaces
        res.status(200).json(workspaces); // Sending the retrieved workspaces in the response with a success status code
    } catch (error) {
        console.error("Error fetching workspaces:", error); // Logging any errors that occur
        res.status(400).json({ error: "Error occurred while fetching workspaces." }); // Returning an error response if fetching fails
    }
};

// Retrieving user bookings based on email
const getUserBookings = async (req, res) => {
    try {
        if (!req.email) { // Checking if the user's email is provided in the request
            return res.status(400).json({ error: 'User email not provided.' }); // Returning a 400 error if email is missing
        }

        const userEmail = req.email.email; // Retrieving the user's email from the request
        const bookings = await Booking.find({ email: userEmail }); // Retrieving bookings for the user from the database

        if (bookings.length > 0) { // If there are bookings found, returning them
            res.status(200).json(bookings); // Sending the bookings as the response
        } else {
            res.status(404).json({ error: 'No bookings found for this user.' }); // Returning a 404 error if no bookings are found
        }
    } catch (error) {
        console.error("Error retrieving bookings:", error); // Logging any errors that occur during the retrieval
        res.status(500).json({ error: 'Error retrieving bookings.' }); // Returning a 500 error if there is a problem with the retrieval
    }
};

// Adding a comment to a workspace
const addComment = async (req, res) => {
    const { id } = req.params; // Retrieving the workspace ID from the request parameters
    const { email } = req.email; // Retrieving the user's email from the request
    const { response } = req.body; // Retrieving the response/comment from the request body

    if (!mongoose.Types.ObjectId.isValid(id)) { // Validating the workspace ID
        return res.status(404).json({ error: 'No such workspace exists in the database' }); // Returning a 404 error if the workspace is not found
    }

    if (!response) { // Checking if the response/comment is provided
        return res.status(400).json({ error: 'Please fill out the comment field', errorFields: ['Response'] }); // Returning a 400 error if the response is missing
    }

    const responseAppend = `${email};${response}`; // Combining the email and response for storing in the responses array
    try {
        const workspace = await Workspace.findOneAndUpdate( // Finding the workspace and updating its responses
            { _id: id },
            { $push: { responses: responseAppend } } // Adding the new comment to the responses array
        );
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Retrieving all workspaces after updating
            io.emit('workspaces', allWorkspaces); // Emitting the updated workspaces through Socket.IO for real-time updates
            res.status(200).json({ message: 'Comment added' }); // Sending a success message in the response
        } else {
            res.status(404).json({ error: 'No such workspace exists in the database' }); // Returning a 404 error if the workspace is not found
        }
    } catch (error) {
        console.error('Error adding comment:', error); // Logging any errors that occur during the update
        res.status(400).json({ error: error.message }); // Returning the error message in the response
    }
};

// Fetching availability of tables in a workspace
const getAvailability = async (req, res) => {
    const { workspaceId } = req.query; // Retrieving the workspace ID from the query parameters

    if (!workspaceId) { // Checking if the workspace ID is provided
        return res.status(400).json({ error: 'Workspace ID is required.' }); // Returning a 400 error if the workspace ID is missing
    }

    try {
        const workspace = await Workspace.findById(workspaceId); // Retrieving the workspace by ID from the database
        if (!workspace) { // If the workspace is not found
            return res.status(404).json({ error: 'Workspace not found' }); // Returning a 404 error
        }

        // Mapping over the tables in the workspace to get their availability status
        const availability = workspace.tables.map((table) => ({
            tableNumber: table.tableNumber,
            availabilityStatus: table.availability === 'available' ? 'Available' : 'Booked' // Setting availability status based on the table's status
        }));

        res.status(200).json(availability); // Sending the availability status in the response
    } catch (error) {
        console.error("Error fetching availability:", error); // Logging any errors
        res.status(400).json({ error: error.message }); // Returning the error message in the response
    }
};

// Booking a workspace table
const bookWorkspace = async (req, res) => {
    const { workspaceId } = req.params; // Retrieving the workspace ID from the request parameters
    const { tableNumber, firstName, email, date, time, room } = req.body; // Retrieving the booking details from the request body

    if (!workspaceId || !room || !tableNumber || !firstName || !email || !date || !time) { // Checking if all required fields are provided
        return res.status(400).json({ error: 'All fields are required.' }); // Returning a 400 error if any field is missing
    }

    const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Creating a Date object for the start time
    const timeSlot = `${time} - ${moment(time, "HH:mm").add(1, "hour").format("HH:mm")}`; // Defining the time slot for the booking

    try {
        console.log("Booking request:", { workspaceId, tableNumber, date, timeSlot }); // Logging the booking request for debugging

        const activeBookingsCount = await Booking.countDocuments({ email }); // Counting the number of active bookings for the user
        if (activeBookingsCount >= 2) { // If the user already has two active bookings
            return res.status(400).json({ error: "Maximum of two active reservations allowed." }); // Returning a 400 error
        }

        const existingBooking = await Booking.findOne({
            workspace: workspaceId,
            tableNumber,
            date: startTime,
            timeSlot,
        }); // Checking if the table is already booked for the selected time slot

        if (existingBooking) { // If the table is already booked
            return res.status(400).json({ error: "Table is already booked for the selected time slot." }); // Returning a 400 error
        }

        const booking = new Booking({
            workspace: workspaceId,
            room,
            tableNumber,
            firstName,
            email,
            date: startTime,
            timeSlot,
        }); // Creating a new booking object

        await booking.save(); // Saving the new booking in the database

        await Workspace.updateOne(
            { _id: workspaceId, "tables.tableNumber": tableNumber },
            { $set: { "tables.$.availability": "booked" } } // Updating the table's availability status to "booked"
        );

        console.log("Booking confirmed:", booking); // Logging the booking confirmation for debugging
        res.status(201).json({ message: "Table booking confirmed", booking }); // Sending the booking details in the response
    } catch (error) {
        console.error("Error in booking workspace:", error); // Logging any errors that occur
        res.status(500).json({ error: error.message }); // Returning a 500 error if something goes wrong
    }
};

// Canceling a booking
const cancelBooking = async (req, res) => {
    const { bookingId } = req.params; // Retrieving the booking ID from the request parameters

    if (!mongoose.Types.ObjectId.isValid(bookingId)) { // Validating the booking ID
        return res.status(404).json({ error: 'Invalid booking ID' }); // Returning a 404 error if the booking ID is invalid
    }

    try {
        const booking = await Booking.findByIdAndDelete(bookingId); // Finding and deleting the booking by ID
        if (!booking) { // If the booking is not found
            return res.status(404).json({ error: 'Booking not found' }); // Returning a 404 error
        }

        await Workspace.updateOne(
            { _id: booking.workspace, "tables.tableNumber": booking.tableNumber },
            { $set: { "tables.$.availability": "available" } } // Updating the table's availability status to "available"
        );

        const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching all workspaces after the update
        io.emit('workspaces', allWorkspaces); // Emitting the updated workspaces via Socket.IO

        res.status(200).json({ message: 'Booking cancelled successfully' }); // Sending a success message
    } catch (error) {
        console.error("Error cancelling booking:", error); // Logging any errors that occur
        res.status(500).json({ error: 'Error cancelling booking' }); // Returning a 500 error if something goes wrong
    }
};

// Retrieving the availability status of all tables for a specific date and time slot
const getAllTablesStatus = async (req, res) => {
    const { date, time } = req.query; // Retrieving the date and time from the query parameters

    if (!date || !time) { // Checking if both date and time are provided
        return res.status(400).json({ error: 'Date and time are required.' }); // Returning an error if either is missing
    }

    try {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Converting the provided date and time into a JavaScript Date object
        const timeSlot = `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}`; // Defining the time slot for the table

        // Retrieving all bookings for the given date and time slot
        const bookings = await Booking.find({ date: startTime, timeSlot });
        const bookedTables = new Set(bookings.map((booking) => booking.tableNumber)); // Creating a set of booked table numbers for faster lookup

        // Retrieving all workspaces from the database
        const workspaces = await Workspace.find();
        const tablesStatus = workspaces.flatMap((workspace) =>
            workspace.tables.map((table) => ({
                tableNumber: table.tableNumber,
                availability: bookedTables.has(table.tableNumber) ? 'booked' : 'available', // Checking the availability of each table
            }))
        );

        res.status(200).json(tablesStatus); // Sending the availability status of all tables as the response
    } catch (error) {
        console.error("Error fetching tables' availability:", error); // Logging any errors that occur during fetching
        res.status(500).json({ error: 'Error fetching tables.' }); // Returning a 500 error if fetching fails
    }
};

// Deleting a workspace
const deleteSurvey = async (req, res) => {
    const { id } = req.params; // Retrieving the workspace ID from the request parameters

    if (!mongoose.Types.ObjectId.isValid(id)) { // Checking if the workspace ID is valid
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Returning a 404 error if the workspace ID is invalid
    }

    try {
        const workspace = await Workspace.findByIdAndDelete(id); // Deleting the workspace by its ID
        if (workspace) { // If the workspace is found and deleted
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Retrieving all workspaces after deletion
            io.emit('workspaces', allWorkspaces); // Emitting the updated list of workspaces via Socket.IO
            res.status(200).json({ message: 'Workspace deleted successfully' }); // Sending a success message in the response
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Returning a 404 error if the workspace is not found
        }
    } catch (error) {
        res.status(400).json({ error: error.message }); // Returning an error if deletion fails
    }
};

// Updating the visibility of a workspace
const surveyVisibility = async (req, res) => {
    const { id } = req.params; // Retrieving the workspace ID from the request parameters

    if (!mongoose.Types.ObjectId.isValid(id)) { // Checking if the workspace ID is valid
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Returning a 404 error if the workspace ID is invalid
    }

    try {
        const workspace = await Workspace.findOneAndUpdate({ _id: id }, { ...req.body }); // Updating the workspace's visibility based on the request body
        if (workspace) { // If the workspace is found and updated
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Retrieving all workspaces after the update
            io.emit('workspaces', allWorkspaces); // Emitting the updated workspaces list through Socket.IO for real-time updates
            res.status(200).json({ message: 'Workspace visibility updated' }); // Sending a success message in the response
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Returning a 404 error if the workspace is not found
        }
    } catch (error) {
        res.status(400).json({ error: error.message }); // Returning the error message if the update fails
    }
};

module.exports = {
    getSurveys, // Exporting the function to retrieve surveys
    addComment, // Exporting the function to add a comment to a workspace
    deleteSurvey, // Exporting the function to delete a workspace
    surveyVisibility, // Exporting the function to update workspace visibility
    getAvailability, // Exporting the function to fetch table availability in a workspace
    bookWorkspace, // Exporting the function to book a workspace table
    getUserBookings, // Exporting the function to retrieve user bookings
    cancelBooking, // Exporting the function to cancel a booking
    getAllTablesStatus, // Exporting the function to fetch the availability of all tables
};

