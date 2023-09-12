const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { authorizeUser } = require('../middlewares/authorize')
const { signup, verifyEmail, login } = require('../controllers/auth')

router.post('/register', [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], signup)
router.post('/verify-email', authorizeUser, verifyEmail);
router.post('/login', login);

module.exports = router