const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
    email_id: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
    },
    attachment: {
        type: String,
    },
    standing: {
        type: String,
        required: true
    }

}, {timestamps : true});

module.exports = mongoose.model('Leave', leaveSchema)