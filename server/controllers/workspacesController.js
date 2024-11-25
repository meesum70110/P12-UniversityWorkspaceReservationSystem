// Importing necessary modules
const Workspace = require('../models/workspaceData'); // Workspace model to interact with workspaces in the database
const Booking = require('../models/booking'); // Booking model to interact with bookings
const mongoose = require('mongoose'); // MongoDB object modeling
const { io } = require('../server'); // Socket.IO for real-time updates
const moment = require('moment'); // Moment.js for date and time manipulation

// Fetching workspaces with optional filters, including bookings
const getSurveys = async (req, res) => {
    const { description, status, room, date, time } = req.query; // Extracting filters from query params
    const query = {}; // Query object to build search conditions

    // Applying filters based on the provided query parameters
    if (description && description !== 'All') query.description = description;
    if (status) query.status = status;
    if (room && room !== 'All') query.room = room;

    // If date and time are provided, check for table availability
    if (date && time) {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Parse the start time
        const endTime = moment(startTime).add(1, 'hour').toDate(); // Calculate the end time (1 hour later)
        query['tables.bookingDetails'] = { // Filtering tables based on booking details
            $not: {
                $elemMatch: {
                    date: startTime,
                    timeSlot: `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}` // Matching the exact time slot
                }
            }
        };
    }

    try {
        const workspaces = await Workspace.find(query).sort({ createdAt: -1 }); // Fetch workspaces based on query and sort by creation date
        res.status(200).json(workspaces); // Return the fetched workspaces
    } catch (error) {
        console.error('Error fetching workspaces:', error); // Log error if any
        res.status(400).json({ error: 'Error occurred while fetching workspaces' }); // Return error message
    }
};

// Retrieving user bookings
const getUserBookings = async (req, res) => {
    try {
        if (!req.email) {
            return res.status(400).json({ error: 'User email not provided.' }); // Check if the user's email is available in the request
        }

        const userEmail = req.email.email; // Extract user's email from the request object
        const bookings = await Booking.find({ email: userEmail }); // Find bookings associated with the user's email

        if (bookings.length > 0) {
            res.status(200).json(bookings); // Return the bookings if found
        } else {
            res.status(404).json({ error: 'No bookings found for this user.' }); // Return error if no bookings are found
        }
    } catch (error) {
        console.error("Error retrieving bookings:", error); // Log error if any
        res.status(500).json({ error: 'Error retrieving bookings.' }); // Return server error message
    }
};

// Adding a comment to a workspace
const addComment = async (req, res) => {
    const { id } = req.params; // Extract workspace ID from route parameters
    const { email } = req.email; // Extract user email from the request object
    const { response } = req.body; // Extract comment from request body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such workspace exists in the database' }); // Check if the workspace ID is valid
    }

    if (!response) {
        return res.status(400).json({ error: 'Please fill out the comment field', errorFields: ['Response'] }); // Check if the response/comment is provided
    }

    const responseAppend = `${email};${response}`; // Format the comment with email and response
    try {
        const workspace = await Workspace.findOneAndUpdate(
            { _id: id },
            { $push: { responses: responseAppend } } // Append the comment to the workspace's responses
        );
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetch all workspaces to emit updates
            io.emit('workspaces', allWorkspaces); // Emit the updated list of workspaces through Socket.IO
            res.status(200).json({ message: 'Comment added' }); // Return success message
        } else {
            res.status(404).json({ error: 'No such workspace exists in the database' }); // Return error if workspace not found
        }
    } catch (error) {
        console.error('Error adding comment:', error); // Log error if any
        res.status(400).json({ error: error.message }); // Return error message
    }
};

// Fetching availability of tables in a workspace
const getAvailability = async (req, res) => {
    const { workspaceId } = req.query; // Extract workspace ID from query params

    if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required.' }); // Return error if workspace ID is not provided
    }

    try {
        const workspace = await Workspace.findById(workspaceId); // Fetch the workspace by ID
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' }); // Return error if workspace not found
        }

        const availability = workspace.tables.map((table) => ({ // Map table availability
            tableNumber: table.tableNumber,
            availabilityStatus: table.availability === 'available' ? 'Available' : 'Booked' // Check the availability status of each table
        }));

        res.status(200).json(availability); // Return table availability status
    } catch (error) {
        console.error("Error fetching availability:", error); // Log error if any
        res.status(400).json({ error: error.message }); // Return error message
    }
};

// Booking a workspace table
const bookWorkspace = async (req, res) => {
    const { workspaceId } = req.params; // Extract workspace ID from URL parameters
    const { tableNumber, firstName, email, date, time, room } = req.body; // Extract booking details from request body

    if (!workspaceId || !room || !tableNumber || !firstName || !email || !date || !time) {
        return res.status(400).json({ error: 'All fields are required.' }); // Validate that all fields are provided
    }

    const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Calculate start time from date and time
    const timeSlot = `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}`; // Generate time slot range

    try {
        const activeBookingsCount = await Booking.countDocuments({ email }); // Check if the user has more than 2 active bookings
        if (activeBookingsCount >= 2) {
            return res.status(400).json({ error: 'Maximum of two active reservations allowed.' }); // Return error if the user already has 2 bookings
        }

        const existingBooking = await Booking.findOne({
            workspace: workspaceId,
            tableNumber,
            date: startTime,
            timeSlot
        }); // Check if the table is already booked for the selected time slot

        if (existingBooking) {
            return res.status(400).json({ error: 'Table is already booked for the selected time slot.' }); // Return error if the table is already booked
        }

        const booking = new Booking({
            workspace: workspaceId,
            room,
            tableNumber,
            firstName,
            email,
            date: startTime,
            timeSlot
        });

        await booking.save(); // Save the new booking in the database

        await Workspace.updateOne(
            { _id: workspaceId, "tables.tableNumber": tableNumber },
            { $set: { "tables.$.availability": "booked" } } // Update the table's availability to booked
        );

        const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetch updated workspaces
        io.emit('workspaces', allWorkspaces); // Emit the updated workspaces via Socket.IO

        res.status(201).json({ message: 'Table booking confirmed', booking }); // Return success message with booking details
    } catch (error) {
        console.error("Error in booking workspace:", error); // Log error if any
        res.status(500).json({ error: error.message }); // Return server error message
    }
};

// Cancelling a booking
const cancelBooking = async (req, res) => {
    const { bookingId } = req.params; // Extract booking ID from URL parameters

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(404).json({ error: 'Invalid booking ID' }); // Validate the booking ID
    }

    try {
        const booking = await Booking.findByIdAndDelete(bookingId); // Delete the booking from the database
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' }); // Return error if booking is not found
        }

        await Workspace.updateOne(
            { _id: booking.workspace, "tables.tableNumber": booking.tableNumber },
            { $set: { "tables.$.availability": "available" } } // Update the table's availability to available
        );

        const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetch updated workspaces
        io.emit('workspaces', allWorkspaces); // Emit the updated workspaces via Socket.IO

        res.status(200).json({ message: 'Booking cancelled successfully' }); // Return success message
    } catch (error) {
        console.error("Error cancelling booking:", error); // Log error if any
        res.status(500).json({ error: 'Error cancelling booking' }); // Return server error message
    }
};

// Fetching all tables' availability for a specific date and time slot
const getAllTablesStatus = async (req, res) => {
    const { date, time } = req.query; // Extract date and time from query parameters

    if (!date || !time) {
        return res.status(400).json({ error: '' }); // Return error if date or time are missing
    }

    try {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate(); // Calculate start time from date and time
        const timeSlot = `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}`; // Generate time slot range

        // Fetching bookings for the given date and time slot
        const bookings = await Booking.find({ date: startTime, timeSlot });
        console.log("Fetched bookings:", bookings); // Debugging

        // Mapping booked table numbers for quick lookup
        const bookedTables = new Set(bookings.map((booking) => booking.tableNumber));

        // Fetching all workspaces and map table availability
        const workspaces = await Workspace.find();
        const tablesStatus = workspaces.flatMap((workspace) =>
            workspace.tables.map((table) => ({
                tableNumber: table.tableNumber,
                availability: bookedTables.has(table.tableNumber) ? 'booked' : 'available',
            }))
        );

        console.log("Tables status:", tablesStatus); // Debugging
        res.status(200).json(tablesStatus); // Return tables status
    } catch (error) {
        console.error("Error fetching tables' availability:", error); // Log error if any
        res.status(500).json({ error: 'Error fetching tables.' }); // Return server error message
    }
};

// Deleting a workspace
const deleteSurvey = async (req, res) => {
    const { id } = req.params; // Extract workspace ID from URL parameters

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Validate the workspace ID
    }

    try {
        const workspace = await Workspace.findByIdAndDelete(id); // Delete the workspace from the database
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetch updated workspaces
            io.emit('workspaces', allWorkspaces); // Emit the updated workspaces via Socket.IO
            res.status(200).json({ message: 'Workspace deleted successfully' }); // Return success message
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Return error if workspace not found
        }
    } catch (error) {
        res.status(400).json({ error: error.message }); // Return error message if deletion fails
    }
};

// Updating workspace visibility
const surveyVisibility = async (req, res) => {
    const { id } = req.params; // Extract workspace ID from URL parameters

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workspace ID' }); // Validate the workspace ID
    }

    try {
        const workspace = await Workspace.findOneAndUpdate({ _id: id }, { ...req.body }); // Update workspace visibility
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 }); // Fetch updated workspaces
            io.emit('workspaces', allWorkspaces); // Emit the updated workspaces via Socket.IO
            res.status(200).json({ message: 'Workspace visibility updated' }); // Return success message
        } else {
            res.status(404).json({ error: 'Workspace not found' }); // Return error if workspace not found
        }
    } catch (error) {
        res.status(400).json({ error: error.message }); // Return error message if update fails
    }
};

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
