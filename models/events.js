const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    user: {
        type: String,
    },
    title: {
        type: String,
    },
    details: {
        type: String,
    },
    tags: {
        type: [String]
    },
    media: {
        type: [String]
    },
    date: {
        type: Date,
        required: true,
    }

}, { timestamps: true },)

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
