// Import necessary modules and models
const Workspace = require('../models/workspaceData'); // Importing Workspace model for database operations
const Booking = require('../models/booking'); // Importing Booking model for managing booking data
const mongoose = require('mongoose'); // Importing Mongoose for MongoDB interaction
const { io } = require('../server'); // Importing Socket.io instance for real-time updates
const moment = require('moment'); // Importing Moment.js for date and time handling

// Function to retrieve workspaces based on filters
const getSurveys = async (req, res) => {
    const { description, status, room, date, time } = req.query; // Extracting filters from the request query
    const query = {}; // Initializing query object

    if (description && description !== "All") query.description = description; // Adding description filter if provided
    if (status) query.status = status; // Adding status filter if provided
    if (room && room !== "All") query.room = room; // Adding room filter if provided

    if (date && time) { // Adding date and time filters for availability checks
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Parsing start time
        const endTime = moment(startTime).add(1, "hour").toDate(); // Calculating end time
        query["tables.bookingDetails"] = { // Ensuring no booking exists for the given time slot
            $not: {
                $elemMatch: {
                    date: startTime,
                    timeSlot: `${time} - ${moment(time, "HH:mm").add(1, "hour").format("HH:mm")}`,
                },
            },
        };
    }

    try {
        const workspaces = await Workspace.find(query).sort({ createdAt: -1 }); // Querying and sorting workspaces by creation date
        console.log("Surveys fetched:", workspaces); // Logging fetched workspaces for debugging
        res.status(200).json(workspaces); // Sending successful response with workspaces
    } catch (error) {
        console.error("Error fetching workspaces:", error); // Logging error for debugging
        res.status(400).json({ error: "Error occurred while fetching workspaces." }); // Sending error response
    }
};

// Function to retrieve all bookings from the database
const getAllBookings = async (req, res) => {
    try {
        console.log("getAllBookings endpoint hit"); // Logging endpoint hit for debugging
        const bookings = await Booking.find({}); // Fetching all bookings

        if (bookings.length > 0) { // Checking if bookings exist
            res.status(200).json(bookings); // Sending successful response with bookings
        } else {
            res.status(404).json({ message: "No bookings found" }); // Sending error response if no bookings exist
        }
    } catch (error) {
        console.error("Error fetching bookings:", error); // Logging error for debugging
        res.status(500).json({ message: "Error fetching bookings", error }); // Sending server error response
    }
};

// Function to retrieve bookings for a specific user
const getUserBookings = async (req, res) => {
    try {
        if (!req.email) { // Checking if user email is provided in the request
            return res.status(400).json({ error: 'User email not provided.' }); // Sending error response if email is missing
        }

        const userEmail = req.email.email; // Extracting user email from the request
        const bookings = await Booking.find({ email: userEmail }); // Fetching bookings for the user

        if (bookings.length > 0) { // Checking if bookings exist for the user
            res.status(200).json(bookings); // Sending successful response with user bookings
        } else {
            res.status(404).json({ error: '...' }); // Sending error response if no bookings are found
        }
    } catch (error) {
        console.error("Error retrieving bookings:", error); // Logging error for debugging
        res.status(500).json({ error: 'Error retrieving bookings.' }); // Sending server error response
    }
};


// Add a comment to a workspace
const addComment = async (req, res) => {
    const { id } = req.params; // Extracting workspace ID from request parameters
    const { email } = req.email; // Extracting user email from request context
    const { response } = req.body; // Extracting comment from request body

    if (!mongoose.Types.ObjectId.isValid(id)) { // Validating workspace ID format
        return res.status(404).json({ error: 'No such workspace exists in the database' }); // Returning error for invalid ID
    }

    if (!response) { // Checking if comment field is empty
        return res.status(400).json({ error: 'Please fill out the comment field', errorFields: ['Response'] }); // Returning error for empty comment
    }

    const responseAppend = `${email};${response}`; // Appending email with the response for storage
    try {
        const workspace = await Workspace.findOneAndUpdate( // Adding comment to the workspace
            { _id: id },
            { $push: { responses: responseAppend } }
        );
        if (workspace) { // Checking if workspace exists
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching all workspaces after the update
            io.emit('workspaces', allWorkspaces); // Emitting real-time update to connected clients
            res.status(200).json({ message: 'Comment added' }); // Sending success response
        } else {
            res.status(404).json({ error: 'No such workspace exists in the database' }); // Sending error if workspace not found
        }
    } catch (error) { // Handling errors during the update
        console.error('Error adding comment:', error); // Logging the error
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Fetch availability of tables in a workspace
const getAvailability = async (req, res) => {
    const { workspaceId } = req.query; // Extracting workspace ID from request query

    if (!workspaceId) { // Checking if workspace ID is provided
        return res.status(400).json({ error: 'Workspace ID is required.' }); // Returning error if missing
    }

    try {
        const workspace = await Workspace.findById(workspaceId); // Fetching workspace by ID
        if (!workspace) { // Checking if workspace exists
            return res.status(404).json({ error: 'Workspace not found' }); // Returning error if not found
        }

        const availability = workspace.tables.map((table) => ({ // Mapping table availability details
            tableNumber: table.tableNumber, // Including table number
            availabilityStatus: table.availability === 'available' ? 'Available' : 'Booked' // Determining availability status
        }));

        res.status(200).json(availability); // Sending availability data as response
    } catch (error) { // Handling errors during fetching
        console.error("Error fetching availability:", error); // Logging the error
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Book a workspace table
const bookWorkspace = async (req, res) => {
    const { workspaceId } = req.params; // Extracting workspace ID from request parameters
    const { tableNumber, firstName, email, date, time, room } = req.body; // Extracting booking details from request body

    // Check for required fields
    if (!workspaceId || !room || !tableNumber || !firstName || !email || !date || !time) {
        return res.status(400).json({ error: 'All fields are required.' }); // Returning error if any field is missing
    }

    const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm"); // Parsing booking start time
    const timeSlot = `${time} - ${moment(time, "HH:mm").add(1, "hour").format("HH:mm")}`; // Generating time slot string

    const bookingHour = startTime.hour(); // Extracting booking hour
    if (bookingHour < 9 || bookingHour >= 18) { // Validating booking time
        return res.status(400).json({ error: "Bookings are only allowed between 09:00 and 17:00." }); // Returning error for invalid time
    }

    try {
        console.log("Booking request:", { workspaceId, tableNumber, date, timeSlot }); // Logging booking request details

        if (req.body.occupation !== 'admin') { // Checking if user is not admin
            const activeBookingsCount = await Booking.countDocuments({ email }); // Counting user's active bookings
            if (activeBookingsCount >= 2) { // Limiting active bookings to 2 for non-admin users
                return res.status(400).json({ error: "Maximum of two active reservations allowed for TAs." }); // Returning error for exceeding limit
            }
        }

        const existingBooking = await Booking.findOne({ // Checking if the table is already booked
            workspace: workspaceId,
            tableNumber,
            date: startTime.toDate(),
            timeSlot,
        });

        if (existingBooking) { // If booking exists, returning error
            return res.status(400).json({ error: "Table is already booked for the selected time slot." });
        }

        const booking = new Booking({ // Creating a new booking instance
            workspace: workspaceId,
            room,
            tableNumber,
            firstName,
            email,
            date: startTime.toDate(),
            timeSlot,
        });

        await booking.save(); // Saving the new booking in the database

        await Workspace.updateOne( // Updating table availability in workspace collection
            { _id: workspaceId, "tables.tableNumber": tableNumber },
            { $set: { "tables.$.availability": "booked" } }
        );

        console.log("Booking confirmed:", booking); // Logging successful booking
        res.status(201).json({ message: "Table booking confirmed", booking }); // Sending success response with booking details
    } catch (error) { // Handling errors during booking
        console.error("Error in booking workspace:", error); // Logging error
        res.status(500).json({ error: error.message }); // Sending server error response
    }
};



// Cancel a booking
const cancelBooking = async (req, res) => {
    const { bookingId } = req.params; // Extracting booking ID from request parameters

    if (!mongoose.Types.ObjectId.isValid(bookingId)) { // Validating booking ID format
        return res.status(404).json({ error: 'Invalid booking ID' }); // Returning error for invalid ID
    }

    try {
        const booking = await Booking.findByIdAndDelete(bookingId); // Deleting booking by ID
        if (!booking) { // Checking if booking exists
            return res.status(404).json({ error: 'Booking not found' }); // Returning error if not found
        }

        await Workspace.updateOne( // Updating workspace table to mark it as available
            { _id: booking.workspace, "tables.tableNumber": booking.tableNumber },
            { $set: { "tables.$.availability": "available" } }
        );

        const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching all workspaces after update
        io.emit('workspaces', allWorkspaces); // Emitting real-time update to connected clients

        res.status(200).json({ message: 'Booking cancelled successfully' }); // Sending success response
    } catch (error) { // Handling errors during cancellation
        console.error("Error cancelling booking:", error); // Logging the error
        res.status(500).json({ error: 'Error cancelling booking' }); // Sending server error response
    }
};

// Get the status of all tables
const getAllTablesStatus = async (req, res) => {
    const { date, time, room } = req.query; // Extracting date, time, and room filters from query

    if (!date || !time) { // Checking if date and time are provided
        return res.status(400).json({ error: "Date and time are required." }); // Returning error if missing
    }

    try {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Parsing start time
        const timeSlot = `${time} - ${moment(time, "HH:mm").add(1, "hour").format("HH:mm")}`; // Generating time slot string

        const bookingsQuery = { date: startTime, timeSlot }; // Querying bookings for the given time slot
        if (room) { bookingsQuery.room = room; } // Adding room filter if provided

        const bookings = await Booking.find(bookingsQuery); // Fetching bookings for the query

        const bookedTables = new Set(bookings.map((booking) => `${booking.workspace}:${booking.tableNumber}`)); // Creating a set of booked tables

        const workspacesQuery = {}; // Initializing workspaces query
        if (room) { workspacesQuery.room = room; } // Adding room filter for workspaces

        const workspaces = await Workspace.find(workspacesQuery); // Fetching workspaces based on the query
        const tablesStatus = workspaces.flatMap((workspace) => // Mapping workspace tables with their status
            workspace.tables.map((table) => ({
                workspaceId: workspace._id, // Including workspace ID
                tableNumber: table.tableNumber, // Including table number
                availability: bookedTables.has(`${workspace._id}:${table.tableNumber}`) ? "booked" : "available", // Determining table availability
            }))
        );

        res.status(200).json(tablesStatus); // Sending table statuses as response
    } catch (error) { // Handling errors during fetching
        console.error("Error fetching tables' availability:", error); // Logging the error
        res.status(500).json({ error: "Error fetching tables." }); // Sending server error response
    }
};

// Delete a workspace
const deleteSurvey = async (req, res) => {
    const { id } = req.params; // Extracting workspace ID from request parameters

    if (!mongoose.Types.ObjectId.isValid(id)) { // Validating workspace ID format
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Returning error for invalid ID
    }

    try {
        const workspace = await Workspace.findByIdAndDelete(id); // Deleting workspace by ID
        if (workspace) { // Checking if workspace exists
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching all workspaces after deletion
            io.emit('workspaces', allWorkspaces); // Emitting real-time update to connected clients
            res.status(200).json({ message: 'Workspace deleted successfully' }); // Sending success response
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Returning error if not found
        }
    } catch (error) { // Handling errors during deletion
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Update workspace visibility
const surveyVisibility = async (req, res) => {
    const { id } = req.params; // Extracting workspace ID from request parameters

    if (!mongoose.Types.ObjectId.isValid(id)) { // Validating workspace ID format
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Returning error for invalid ID
    }

    try {
        const workspace = await Workspace.findOneAndUpdate({ _id: id }, { ...req.body }); // Updating workspace visibility
        if (workspace) { // Checking if workspace exists
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching all workspaces after the update
            io.emit('workspaces', allWorkspaces); // Emitting real-time update to connected clients
            res.status(200).json({ message: 'Workspace visibility updated' }); // Sending success response
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Returning error if not found
        }
    } catch (error) { // Handling errors during visibility update
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Exporting all functions for use in routes
module.exports = {
    getSurveys, // Function to retrieve workspaces
    addComment, // Function to add a comment to a workspace
    deleteSurvey, // Function to delete a workspace
    surveyVisibility, // Function to update workspace visibility
    getAvailability, // Function to check table availability
    bookWorkspace, // Function to book a table
    getUserBookings, // Function to retrieve user-specific bookings
    cancelBooking, // Function to cancel a booking
    getAllTablesStatus, // Function to get the status of all tables
    getAllBookings, // Function to retrieve all bookings
};
