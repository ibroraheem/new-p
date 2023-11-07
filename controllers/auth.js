const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

require('dotenv').config()
const baseUrl = 'https://spikkr-next-js.vercel.app/'

const signup = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const { email, password } = req.body
        const user = await User.findOne({ 'local.email': email })
        if (user) {
            console.log("user already exists")
            return res.status(401).json({ message: "User Already exists!" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpires = Date.now() + 10 * 3600
        const newUser = new User({
            method: 'local',
            local: {
                email: email,
                password: hashedPassword
            },
            url: baseUrl + email.split('@')[0],
            otp: otp,
            otpExpires: otpExpires
        });
        await newUser.save();
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        const emailTemplatePath = path.join(__dirname, '..', 'helper', 'mailTemplates', 'welcomeEmail.html');
        const welcomeMessage = fs.readFileSync(emailTemplatePath, 'utf8');
        const mailContent = welcomeMessage.replace('${otp}', otp)
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to Spikkr - Please verify",
            html: mailContent
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({ message: error.message });
            } else {
                console.log(token, email, newUser.url)
                console.log("Email sent: " + info.response);
                res.status(201).json({ message: 'Successfully registered', token, email, url: newUser.url })
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const { otp } = req.body
        const user = req.user
        console.log(user.otp)
        if (otp !== user.otp) return res.status(400).json({ message: 'Invalid OTP' })
        if (user.otpExpires > Date.now()) return res.status(400).json({ message: "OTP Expired" })
        user.isVerified = true
        user.otp = null
        user.isVerified = true
        user.save()

        res.status(200).json({ message: 'Email verified successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}
const login = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const { email, password } = req.body
        const user = await User.findOne({ 'local.email': email })
        if (!user) return res.status(404).json({ message: "User has not registered" })
        const isMatch = await bcrypt.compare(password, user.local.password)
        if (!isMatch) return res.status(403).json({ message: "Invalid Password" })
        const token = jwt.sign({ email: user.local.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: "Login successful", token: token, email: user.local.email, firstName: user.firstName, lastName: user.lastName })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, gender, role, bio, companyIndustry, country, topics, headshot, socials } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const user = req.user
        user.firstName = firstName
        user.lastName = lastName
        user.gender = gender
        user.headshot = headshot
        user.role = role
        user.bio = bio
        user.topics = topics
        user.socials = socials
        user.companyIndustry = companyIndustry
        user.country = country
        await user.save()
        res.status(200).json({ message: "User updated", user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(422).json({ errors: errorMessages });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ errors: "User does not exist" });

        // Generate a unique reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 60 * 60 * 10;

        // Save the token and its expiration time in the user's document
        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await user.save();

        // Send an email to the user with a link that includes the reset token
        const resetLink = `${baseUrl}/reset-password/${resetToken}`;
        const firstName = user.firstName

        // Send the email with the reset link
        const emailTemplatePath = path.join(__dirname, '..', 'helper', 'mailTemplates', 'passwordEmail.html');
        const welcomeMessage = fs.readFileSync(emailTemplatePath, 'utf8');
        const mailContent = welcomeMessage.replace('${resetLink}', resetLink).replace('${user.firstName}', firstName)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Spikkr - Password Reset",
            html: mailContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: error.message });
            } else {
                console.log("Email sent: " + info.response);
                res.status(200).json({ message: 'Password reset email sent successfully', email });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => error.msg);
            return res.status(422).json({ errors: errorMessages });
        }

        const user = await User.findOne({ resetToken: token });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (Date.now() < user.resetTokenExpires) return res.status(403).json({ message: "Token has expired" });
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.local.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, verifyEmail, login, updateProfile, forgotPassword, resetPassword }