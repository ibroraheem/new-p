const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
    },
    date: {
        type: Date,
        required: true
    },
    coverPhoto: {
        coverPhotoName: { type: String, default: " " },
        coverPhotoUrl: { type: String, default: " " }
    },
    description: {
        type: String,
        default: "",
        required: true
    },
    slide: {
        slideName: {
            type: String,
            default: " "
        },
        slideUrl: {
            type: String,
            default: " "
        }
    },
    topics: [
        { type: String }
    ],

}, { timestamps: true })

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
