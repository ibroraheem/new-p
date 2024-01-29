const mongoose = require('mongoose');

const PressKitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    media: [],
    fullBio: {
        type: String,
    },

    testimonials: [
        {
            name: { type: String, default: "" },
            content: { type: String, default: "" },
        },
    ],
}, { timestamps: true });

const PressKit = mongoose.model('PressKit', PressKitSchema);

module.exports = PressKit;
