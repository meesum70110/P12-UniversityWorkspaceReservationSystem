const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
const moment = require('moment'); 

const bookingSchema = new Schema({
    workspace: { 
        type: Schema.Types.ObjectId, 
        ref: 'Workspace', 
        required: true 
    },
    room: { 
        type: String, 
        required: true 
    },
    tableNumber: { 
        type: String, 
        required: true 
    },
    firstName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: { 
        type: Date, 
        required: true 
    },
    timeSlot: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);



