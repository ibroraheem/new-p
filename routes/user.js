const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { authorizeUser, isEmailVerified } = require('../middlewares/authorize')
const { signup, verifyEmail, login, updateProfile, forgotPassword, resetPassword, searchUser, getUsers, getUser, getUserPressKit, createEvent } = require('../controllers/user')

router.post('/register', [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], signup)
router.post('/verify-email', authorizeUser, verifyEmail);
router.post('/login', login);
router.post('/profile-update', isEmailVerified, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// router.get('/users/:query', searchUser);
router.get('/users/', getUsers);
router.get('/users/:id', getUser)
router.get('/users/press-kit/:id', getUserPressKit);
router.post('/add-event', isEmailVerified, createEvent);

module.exports = router