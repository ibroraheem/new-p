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
    },
    coverPhoto: {
        coverPhotoName: { type: String },
        coverPhotoUrl: { type: String }
    },
    description: {
        type: String,
    },
    slides: {
        slideName: {
            type: String,
        },
        slideUrl: {
            type: String
        }
    },
    topics: [
        { type: String }
    ],

}, { timestamps: true },)

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
