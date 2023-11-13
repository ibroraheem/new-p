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
        min: 2,
        default: ' '
    },
    lastName: {
        type: String,
        min: 2,
        default: ' '
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
    availableFor: {
        type: [String]
    },
    coverPhoto: {
        CoverPhotoUrl: {
            type: String,

        },
        CoverPhotoName: { type: String }
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
        avatarUrl: {
            type: String,
            default: " "
        },
        avatarName: {
            type: String,
            default: " "
        }
    },
    termsAndConditions: {
        type: String,
        default: " "
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