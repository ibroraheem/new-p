const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer')
require('dotenv').config()

const signup = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const { email, password } = req.body
        const user = await User.findOne({ email: email })
        if (user) return res.status(401).json({ message: "User Already exists!" })
        const hashedPassword = bcrypt.hashSync(password, 12)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const newUser = new User({
            method: 'local',
            local: {
                email: email,
                password: hashedPassword
            },
            otp: otp.toString(),
            otpExpires: Date.now() + 10 * 60 * 60
        });
        await newUser.save();
        console.log(newUser);
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        const mailContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                }
                .header {
                    color: #202124;
                    font-size: 20px;
                    font-weight: 500;
                }
                .message {
                    color: #5C6570;
                    font-size: 14px;
                }
                .otp {
                    color: #58CEA2;
                    font-size: 14px;
                    font-weight: 800;
                }
                .footer {
                    color: #5C6570;
                    font-size: 14px;
                }
                .copyright {
                    color: #999999;
                    font-size: 12px;
                }
                .follow-text {
                    color: white;
                    font-size: 12px;
                }
                .social-icon {
                    width: 24px;
                    margin-right: 10px;
                }
            </style>
        </head>
        <body>
            <table width="100%" cellspacing="0" cellpadding="20">
                <tr>
                    <td align="center">
                        <table width="600" cellspacing="0" cellpadding="10" border="0">
                            <tr>
                                <td>
                                    <!-- Shapes or icons can be placed here -->
                                    <!-- They will likely need to be images to ensure consistent rendering -->
                                </td>
                            </tr>
                            <tr>
                                <td>
                                <img src="https://i.postimg.cc/4mPZLqqV/Spikkr-Logo.png">
                                </td>
                            </tr>
                            <tr>
                                <td class="header">Welcome to Spikkr</td>
                            </tr>
                            <tr>
                                <td class="message">Hello!<br>Thank you for joining Spikkr. Please enter the code below to verify your identity and complete your registration.</td>
                            </tr>
                            <tr>
                                <td class="otp">${otp}</td>
                            </tr>
                            <tr>
                                <td class="footer">If you did not make this request, kindly ignore this email and take no further action.<br><br>Warm regards,<br>Spikkr</td>
                            </tr>
                            <tr>
                            <tr>
                                <td class="copyright" align="center">Copyright © 2023</td>
                            </tr>
                                <td bgcolor="#032628" align="center">
                                    <table width="100%" cellspacing="0" cellpadding="10" border="0">
                                    <tr>
                                    <td class="follow-text" align="center" >Follow us on social media</td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <table align="center" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <!-- Social icons with links -->
                                                <td>
                                                    <a href="https://twitter.com/spikkr" target="_blank"><img src="https://i.postimg.cc/Wd4VQScK/twitter.png" alt="Twitter" class="social-icon" background="#FFDE6A"></a>
                                                    <a href="https://linkedin.com/in/spikkr" target="_blank"><img src="https://i.postimg.cc/GHddjd7b/linkedin.png" alt="LinkedIn" class="social-icon" background="#FFDE6A"></a>
                                                </td>
                                            </tr>
                                        </table>   
                                    </td>     
                                </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
            `
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to Spikkr - Please verify",
            html: mailContent
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: error.message });
            } else {
                console.log("Email sent: " + info.response);
                res.status(201).json({ message: 'Successfully registered', token, email })
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
        if (user.otp !== otp) return res.status(403).json({ message: 'Invalid otp' })
        user.isVerified = true
        user.otp = null
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
        const user = await User.findOne({ email: email })
        if (!user) return res.status(404).json({ message: "User has not registered" })
        const isMatch = await bcrypt.compare(password, user.local.password)
        if (!isMatch) return res.status(403).json({ message: "Incorrect Password" })
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: "Login successful", token: token, email: user.local.email, firstName: user.firstName, lastName: user.lastName })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = { signup, verifyEmail, login }