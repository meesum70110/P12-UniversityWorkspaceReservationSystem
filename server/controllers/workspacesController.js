// Importing necessary modules
const Workspace = require('../models/workspaceData');
const Booking = require('../models/booking');
const mongoose = require('mongoose');
const { io } = require('../server');
const moment = require('moment');

// Fetching workspaces with optional filters, including bookings
const getSurveys = async (req, res) => {
    const { description, status, room, date, time } = req.query;
    const query = {};

    if (description && description !== 'All') query.description = description;
    if (status) query.status = status;
    if (room && room !== 'All') query.room = room;

    if (date && time) {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate();
        const endTime = moment(startTime).add(1, 'hour').toDate();
        query['tables.bookingDetails'] = {
            $not: {
                $elemMatch: {
                    date: startTime,
                    timeSlot: `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}`
                }
            }
        };
    }

    try {
        const workspaces = await Workspace.find(query).sort({ createdAt: -1 });
        res.status(200).json(workspaces);
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(400).json({ error: 'Error occurred while fetching workspaces' });
    }
};

// Retrieving user bookings
const getUserBookings = async (req, res) => {
    try {
        if (!req.email) {
            return res.status(400).json({ error: 'User email not provided.' });
        }

        const userEmail = req.email.email;
        const bookings = await Booking.find({ email: userEmail });

        if (bookings.length > 0) {
            res.status(200).json(bookings);
        } else {
            res.status(404).json({ error: 'No bookings found for this user.' });
        }
    } catch (error) {
        console.error("Error retrieving bookings:", error);
        res.status(500).json({ error: 'Error retrieving bookings.' });
    }
};

// Adding a comment to a workspace
const addComment = async (req, res) => {
    const { id } = req.params;
    const { email } = req.email;
    const { response } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such workspace exists in the database' });
    }

    if (!response) {
        return res.status(400).json({ error: 'Please fill out the comment field', errorFields: ['Response'] });
    }

    const responseAppend = `${email};${response}`;
    try {
        const workspace = await Workspace.findOneAndUpdate(
            { _id: id },
            { $push: { responses: responseAppend } }
        );
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 });
            io.emit('workspaces', allWorkspaces);
            res.status(200).json({ message: 'Comment added' });
        } else {
            res.status(404).json({ error: 'No such workspace exists in the database' });
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).json({ error: error.message });
    }
};

// Fetching availability of tables in a workspace
const getAvailability = async (req, res) => {
    const { workspaceId } = req.query;

    if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required.' });
    }

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const availability = workspace.tables.map((table) => ({
            tableNumber: table.tableNumber,
            availabilityStatus: table.availability === 'available' ? 'Available' : 'Booked'
        }));

        res.status(200).json(availability);
    } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(400).json({ error: error.message });
    }
};

// Booking a workspace table
const bookWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const { tableNumber, firstName, email, date, time, room } = req.body;

    if (!workspaceId || !room || !tableNumber || !firstName || !email || !date || !time) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate();
    const timeSlot = `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}`;

    try {
        const activeBookingsCount = await Booking.countDocuments({ email });
        if (activeBookingsCount >= 2) {
            return res.status(400).json({ error: 'Maximum of two active reservations allowed.' });
        }

        const existingBooking = await Booking.findOne({
            workspace: workspaceId,
            tableNumber,
            date: startTime,
            timeSlot
        });

        if (existingBooking) {
            return res.status(400).json({ error: 'Table is already booked for the selected time slot.' });
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

        await booking.save();

        await Workspace.updateOne(
            { _id: workspaceId, "tables.tableNumber": tableNumber },
            { $set: { "tables.$.availability": "booked" } }
        );

        const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 });
        io.emit('workspaces', allWorkspaces);

        res.status(201).json({ message: 'Table booking confirmed', booking });
    } catch (error) {
        console.error("Error in booking workspace:", error);
        res.status(500).json({ error: error.message });
    }
};

// Cancelling a booking
const cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(404).json({ error: 'Invalid booking ID' });
    }

    try {
        const booking = await Booking.findByIdAndDelete(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        await Workspace.updateOne(
            { _id: booking.workspace, "tables.tableNumber": booking.tableNumber },
            { $set: { "tables.$.availability": "available" } }
        );

        const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 });
        io.emit('workspaces', allWorkspaces);

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ error: 'Error cancelling booking' });
    }
};

// Fetching all tables' availability for a specific date and time slot
const getAllTablesStatus = async (req, res) => {
    const { date, time } = req.query;

    if (!date || !time) {
        return res.status(400).json({ error: 'Date and time are required.' });
    }

    try {
        const startTime = moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm").toDate();
        const timeSlot = `${time} - ${moment(time, 'HH:mm').add(1, 'hour').format('HH:mm')}`;

        // Fetching bookings for the given date and time slot
        const bookings = await Booking.find({ date: startTime, timeSlot });
        console.log("Fetched bookings:", bookings);

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
        res.status(200).json(tablesStatus);
    } catch (error) {
        console.error("Error fetching tables' availability:", error);
        res.status(500).json({ error: 'Error fetching tables.' });
    }
};


// Deleting a workspace
const deleteSurvey = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workspace ID' });
    }

    try {
        const workspace = await Workspace.findByIdAndDelete(id);
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 });
            io.emit('workspaces', allWorkspaces);
            res.status(200).json({ message: 'Workspace deleted successfully' });
        } else {
            res.status(404).json({ error: 'Workspace not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Updating workspace visibility
const surveyVisibility = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workspace ID' });
    }

    try {
        const workspace = await Workspace.findOneAndUpdate({ _id: id }, { ...req.body });
        if (workspace) {
            const allWorkspaces = await Workspace.find({}).sort({ createdAt: -1 });
            io.emit('workspaces', allWorkspaces);
            res.status(200).json({ message: 'Workspace visibility updated' });
        } else {
            res.status(404).json({ error: 'Workspace not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
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
