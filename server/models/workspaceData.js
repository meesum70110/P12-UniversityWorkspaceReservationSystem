const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workspaceSchema = new Schema({
    title: {
        type: String,
        required: false // Setting to `false` if optional
    },
    description: {
        type: String,
        required: false // Setting to `false` if optional
    },
    status: { 
        type: String, 
        enum: ['available', 'unavailable'], 
        default: 'available' 
    },
    responses: {
        type: [String],
        default: []
    },
    visibility: {
        type: String,
        required: false
    },
    room: {
        type: String,
        required: true
    },
    tables: [
        {
            tableNumber: { type: String, required: true },
            availability: { 
                type: String, 
                enum: ['available', 'booked'], 
                default: 'available' 
            },
            bookingDetails: {
                type: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
                default: [] // Using reference to Booking for detailed tracking
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
