const mongoose = require('mongoose');

const PressKitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    media: {
        type: String,
    },
    fullBio: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    testimonials: {
        name: { type: String, required: true },
        content: { type: String, required: true }
    }
}, { timestamps: true })

const PressKit = mongoose.model('PressKit', PressKitSchema);

module.exports = PressKit;