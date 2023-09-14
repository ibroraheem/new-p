const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { authorizeUser, isEmailVerified } = require('../middlewares/authorize')
const { signup, verifyEmail, login, updateProfile, forgotPassword, resetPassword } = require('../controllers/auth')

router.post('/register', [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], signup)
router.post('/verify-email', authorizeUser, verifyEmail);
router.post('/login', login);
router.post('/profile-update', isEmailVerified, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword)

module.exports = router