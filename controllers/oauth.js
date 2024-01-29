// passport-config.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const callbackURL = (provider) => `http://localhost:3000/${provider}/callback`;

const generateToken = (user) => {
    const payload = {
        userId: user._id,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const handleOAuthProfile = (profile, provider, done) => {
    const oauthIdField = `${provider}Id`;

    User.findOne({ [oauthIdField]: profile.id })
        .then(existingUser => {
            if (existingUser) {
                const token = generateToken(existingUser);
                done(null, { user: existingUser, token });
            } else {
                const newUser = {
                    [oauthIdField]: profile.id,
                    name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
                };

                if (provider === 'google') {
                    newUser.google = {
                        id: profile.id,
                        email: profile.emails[0].value,
                    };
                    newUser.emailVerified = true;
                    newUser.firstName = profile.name.givenName;
                    newUser.lastName = profile.name.familyName;
                } else if (provider === 'facebook') {
                    newUser.facebook = {
                        id: profile.id,
                        email: profile.emails[0].value,
                    };
                } else if (provider === 'linkedin') {
                    newUser.linkedin = {
                        id: profile.id,
                        email: profile.emails[0].value,
                    };
                }

                new User(newUser)
                    .save()
                    .then(user => {
                        const token = generateToken(user);
                        done(null, { user, token });
                    })
                    .catch(err => {
                        done(err);
                    });
            }
        })
        .catch(err => {
            done(err);
        });
};

// Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL('google')
}, (accessToken, refreshToken, profile, done) => {
    handleOAuthProfile(profile, 'google', done);
}));

// Facebook
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: callbackURL('facebook'),
    profileFields: ['id', 'emails', 'name', 'photos']
}, (accessToken, refreshToken, profile, done) => {
    handleOAuthProfile(profile, 'facebook', done);
}));

// LinkedIn
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: callbackURL('linkedin'),
    scope: ['r_emailaddress', 'r_liteprofile'],
}, (accessToken, refreshToken, profile, done) => {
    handleOAuthProfile(profile, 'linkedin', done);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = passport;
