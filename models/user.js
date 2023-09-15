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
    },
    role: {
        type: String,
    },
    bio: {
        type: String,
    },
    country: {
        type: String,
    },
    companyIndustry: {
        type: String,
    },
    topics: {
        type: [String]
    },
    socials: {
        linkedin: {
            type: String,
        },
        website: {
            type: String,
        },
        twitter: {
            type: String,
        }
    },
    headshot: {
        type: String
    },
    otp: {
        type: String,
    },
    passwordToken: {
        type: String,
    },
    passwordTokenExpires: {
        type: Date,
    },
    otpExpires: {
        type: Date
    },
    url: {
        type: String,
    },
},
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;