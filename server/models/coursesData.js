const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    title: {
        type: String,       // Data type is String
        required: true      // This field is required
    },
    description: {
        type: String,       // Data type is String
        required: true      // This field is required
    },
    status: { 
        type: String, 
        enum: ['available', 'unavailable'], 
        default: 'available' 
    },
    website: {
        type: String,
        required: true
    }
}, {timestamps : true});

module.exports = mongoose.model('Course', courseSchema)


