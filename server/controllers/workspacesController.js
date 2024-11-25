// Importing necessary modules for handling workspace and booking data, mongoose, and server communication
const Workspace = require('../models/workspaceData'); // Importing the Workspace model for database interactions
const Booking = require('../models/booking'); // Importing the Booking model for database interactions
const mongoose = require('mongoose'); // Importing mongoose for database operations
const { io } = require('../server'); // Importing server-side socket.io to emit events
const moment = require('moment'); // Importing moment.js for handling dates and times

// Retrieving all surveys/workspaces based on query parameters (description, status, room, date, time)
const getSurveys = async (req, res) => {
    const { description, status, room, date, time } = req.query; // Extracting query parameters
    const query = {}; // Initializing an empty query object

    if (description && description !== "All") query.description = description; // Adding description filter if specified
    if (status) query.status = status; // Adding status filter if specified
    if (room && room !== "All") query.room = room; // Adding room filter if specified

    if (date && time) {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Parsing start time from the date and time
        const endTime = moment(startTime).add(1, "hour").toDate(); // Calculating end time (1 hour after start)
        query["tables.bookingDetails"] = {
            $not: {
                $elemMatch: {
                    date: startTime,
                    timeSlot: `${time} - ${moment(time, "HH:mm").add(1, "hour").format("HH:mm")}`, // Filtering by the booking time slot
                },
            },
        };
    }

    try {
        const workspaces = await Workspace.find(query).sort({ createdAt: -1 }); // Fetching workspaces with applied filters
        console.log("Surveys fetched:", workspaces); // Debugging: logging the fetched workspaces
        res.status(200).json(workspaces); // Sending the workspaces as response
    } catch (error) {
        console.error("Error fetching workspaces:", error); // Logging any errors
        res.status(400).json({ error: "Error occurred while fetching workspaces." }); // Sending error response
    }
};

// Retrieving bookings of the current user
const getUserBookings = async (req, res) => {
    try {
        if (!req.email) {
            return res.status(400).json({ error: 'User email not provided.' }); // Checking if user email exists
        }

        const userEmail = req.email.email; // Extracting email from the request
        const bookings = await Booking.find({ email: userEmail }); // Fetching bookings based on the user's email

        if (bookings.length > 0) {
            res.status(200).json(bookings); // Sending the found bookings as response
        } else {
            res.status(404).json({ error: 'No bookings found for this user.' }); // Sending error if no bookings are found
        }
    } catch (error) {
        console.error("Error retrieving bookings:", error); // Logging any errors
        res.status(500).json({ error: 'Error retrieving bookings.' }); // Sending error response
    }
};

// Adding a comment to a workspace
const addComment = async (req, res) => {
    const { id } = req.params; // Extracting workspace ID from request parameters
    const { email } = req.email; // Extracting email from the request
    const { response } = req.body; // Extracting the response (comment) from the request body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such workspace exists in the database' }); // Checking if the workspace ID is valid
    }

    if (!response) {
        return res.status(400).json({ error: 'Please fill out the comment field', errorFields: ['Response'] }); // Checking if response is provided
    }

    const responseAppend = `${email};${response}`; // Formatting the comment with email as prefix
    try {
        const workspace = await Workspace.findOneAndUpdate(
            { _id: id },
            { $push: { responses: responseAppend } } // Adding the comment to the workspace's responses array
        );
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching updated workspaces
            io.emit('workspaces', allWorkspaces); // Emitting updated workspaces to the front-end using socket.io
            res.status(200).json({ message: 'Comment added' }); // Sending success response
        } else {
            res.status(404).json({ error: 'No such workspace exists in the database' }); // Sending error if workspace is not found
        }
    } catch (error) {
        console.error('Error adding comment:', error); // Logging any errors
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Fetching availability of tables in a workspace
const getAvailability = async (req, res) => {
    const { workspaceId } = req.query; // Extracting workspace ID from the query parameters

    if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required.' }); // Sending error if workspace ID is not provided
    }

    try {
        const workspace = await Workspace.findById(workspaceId); // Fetching workspace by ID
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' }); // Sending error if workspace is not found
        }

        const availability = workspace.tables.map((table) => ({
            tableNumber: table.tableNumber, // Returning the table number
            availabilityStatus: table.availability === 'available' ? 'Available' : 'Booked' // Returning availability status of the table
        }));

        res.status(200).json(availability); // Sending availability as response
    } catch (error) {
        console.error("Error fetching availability:", error); // Logging any errors
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Booking a workspace table
const bookWorkspace = async (req, res) => {
    const { workspaceId } = req.params; // Extracting workspace ID from request parameters
    const { tableNumber, firstName, email, date, time, room } = req.body; // Extracting the required booking data from request body

    if (!workspaceId || !room || !tableNumber || !firstName || !email || !date || !time) {
        return res.status(400).json({ error: 'All fields are required.' }); // Sending error if any required fields are missing
    }

    const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Parsing start time from the request
    const timeSlot = `${time} - ${moment(time, "HH:mm").add(1, "hour").format("HH:mm")}`; // Calculating time slot (1 hour duration)

    try {
        console.log("Booking request:", { workspaceId, tableNumber, date, timeSlot }); // Debugging: logging booking request
        const activeBookingsCount = await Booking.countDocuments({ email }); // Checking if the user already has 2 active bookings
        if (activeBookingsCount >= 2) {
            return res.status(400).json({ error: "Maximum of two active reservations allowed." }); // Sending error if the user exceeds the limit
        }

        const existingBooking = await Booking.findOne({
            workspace: workspaceId,
            tableNumber,
            date: startTime,
            timeSlot,
        }); // Checking if the table is already booked for the given date and time slot

        if (existingBooking) {
            return res.status(400).json({ error: "Table is already booked for the selected time slot." }); // Sending error if table is already booked
        }

        const booking = new Booking({
            workspace: workspaceId,
            room,
            tableNumber,
            firstName,
            email,
            date: startTime,
            timeSlot,
        });

        await booking.save(); // Saving the booking to the database

        await Workspace.updateOne(
            { _id: workspaceId, "tables.tableNumber": tableNumber },
            { $set: { "tables.$.availability": "booked" } } // Updating table availability to "booked"
        );

        console.log("Booking confirmed:", booking); // Debugging: logging the confirmed booking
        res.status(201).json({ message: "Table booking confirmed", booking }); // Sending success response
    } catch (error) {
        console.error("Error in booking workspace:", error); // Logging any errors
        res.status(500).json({ error: error.message }); // Sending error response
    }
};

// Canceling a booking
const cancelBooking = async (req, res) => {
    const { bookingId } = req.params; // Extracting booking ID from request parameters

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(404).json({ error: 'Invalid booking ID' }); // Sending error if the booking ID is invalid
    }

    try {
        const booking = await Booking.findByIdAndDelete(bookingId); // Deleting the booking
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' }); // Sending error if the booking is not found
        }

        await Workspace.updateOne(
            { _id: booking.workspace, "tables.tableNumber": booking.tableNumber },
            { $set: { "tables.$.availability": "available" } } // Updating table availability to "available"
        );

        const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching updated workspaces
        io.emit('workspaces', allWorkspaces); // Emitting updated workspaces to the front-end using socket.io

        res.status(200).json({ message: 'Booking cancelled successfully' }); // Sending success response
    } catch (error) {
        console.error("Error cancelling booking:", error); // Logging any errors
        res.status(500).json({ error: 'Error cancelling booking' }); // Sending error response
    }
};

// Fetching status of all tables for a specific date and time slot
const getAllTablesStatus = async (req, res) => {
    const { date, time } = req.query; // Extracting date and time from query parameters

    if (!date || !time) {
        return res.status(400).json({ error: 'Date and time are required.' }); // Sending error if date or time is not provided
    }

    try {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Parsing start time
        const timeSlot = `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}`; // Calculating time slot

        const bookings = await Booking.find({ date: startTime, timeSlot }); // Fetching all bookings for the given date and time slot
        const bookedTables = new Set(bookings.map((booking) => booking.tableNumber)); // Storing booked table numbers in a set

        const workspaces = await Workspace.find(); // Fetching all workspaces
        const tablesStatus = workspaces.flatMap((workspace) =>
            workspace.tables.map((table) => ({
                tableNumber: table.tableNumber, // Returning the table number
                availability: bookedTables.has(table.tableNumber) ? 'booked' : 'available', // Determining availability
            }))
        );

        res.status(200).json(tablesStatus); // Sending the tables' status as response
    } catch (error) {
        console.error("Error fetching tables' availability:", error); // Logging any errors
        res.status(500).json({ error: 'Error fetching tables.' }); // Sending error response
    }
};

// Deleting a workspace
const deleteSurvey = async (req, res) => {
    const { id } = req.params; // Extracting workspace ID from request parameters

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Sending error if the workspace ID is invalid
    }

    try {
        const workspace = await Workspace.findByIdAndDelete(id); // Deleting the workspace
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching updated workspaces
            io.emit('workspaces', allWorkspaces); // Emitting updated workspaces to the front-end using socket.io
            res.status(200).json({ message: 'Workspace deleted successfully' }); // Sending success response
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Sending error if workspace is not found
        }
    } catch (error) {
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Updating the visibility of a workspace
const surveyVisibility = async (req, res) => {
    const { id } = req.params; // Extracting workspace ID from request parameters

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Sending error if the workspace ID is invalid
    }

    try {
        const workspace = await Workspace.findOneAndUpdate({ _id: id }, { ...req.body }); // Updating workspace visibility
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetching updated workspaces
            io.emit('workspaces', allWorkspaces); // Emitting updated workspaces to the front-end using socket.io
            res.status(200).json({ message: 'Workspace visibility updated' }); // Sending success response
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Sending error if workspace is not found
        }
    } catch (error) {
        res.status(400).json({ error: error.message }); // Sending error response
    }
};

// Exporting the functions for use in the application
module.exports = {
    getSurveys,
    addComment,
    deleteSurvey,
    surveyVisibility,
    getAvailability,
    bookWorkspace,
    getUserBookings,
    cancelBooking,
    getAllTablesStatus
};
