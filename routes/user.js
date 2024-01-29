const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { authorizeUser, isEmailVerified } = require('../middlewares/authorize')
const { searchUser, getUsers, getUser, createPressKit, getPressKit, updatePresskit, giveTestimonial, addMedia } = require('../controllers/user')
const { signup, verifyEmail, login, accountUpdate, updateProfile, forgotPassword, resetPassword, } = require('../controllers/auth')
const { createEvent, getEvents, getEvent, deleteEvent, updateEvent, getUserEvents } = require('../controllers/event')
const passport = require('../controllers/oauth')

router.post('/register', [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], signup)
router.post('/verify-email', authorizeUser, verifyEmail);
router.post('/login', login);
router.patch('/account-update', isEmailVerified, accountUpdate);
router.patch('/update-profile', isEmailVerified, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users/', getUsers);
router.get('/users/:id', getUser)
router.post('/add-presskit', isEmailVerified, createPressKit);
router.get('/presskit/:userId', getPressKit);
router.patch('/update-presskit/:userId', isEmailVerified, updatePresskit);
router.post('/add-event', isEmailVerified, createEvent);
router.get('/events/', getEvents);
router.get('/events/:id', getEvent);
router.patch('/events/:id', authorizeUser, updateEvent);
router.get('/events/user/:userId', getUserEvents);
router.patch('/events/:id', updateEvent);
router.post('/testimonial/:id', giveTestimonial);
router.post('/add-media/', isEmailVerified, addMedia);
router.delete('/events/:id', authorizeUser, deleteEvent);
router.get('/users/:query', searchUser);
router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile')
    }
);

module.exports = router