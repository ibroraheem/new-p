const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['local', 'google', 'facebook', 'linkedin']
    },
    local: {
        email: String,
        password: String
    },
    google: {
        id: String,
        email: String
    },
    isVerified: {
        type: Boolean,
    },
    firstName: {
        type: String,
        min: 2
    },
    lastName: {
        type: String,
        min: 2
    },
    gender: {
        type: String,
        default: " "
    },
    role: {
        type: String,
        default: " "
    },
    bio: {
        type: String,
        default: " "
    },
    country: {
        type: String,
        default: " "
    },
    companyIndustry: {
        type: String,
        default: " "
    },
    topics: {
        type: [String]
    },
    socials: {
        linkedin: {
            type: String,
            default: " "
        },
        website: {
            type: String,
            default: " "
        },
        twitter: {
            type: String,
            default: " "
        }
    },
    headshot: {
        type: String
    },
    otp: {
        type: String,
        default: " "
    },
    resetToken: {
        type: String,
        default: " "
    },
    resetTokenExpires: {
        type: Date,
    },
    otpExpires: {
        type: Date
    },
    url: {
        type: String,
        default: " "
    },
    isVerified: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;