const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Event = require('../models/events');
const PressKit = require('../models/pressKit');
require('dotenv').config()
const baseUrl = 'http://localhost:5000/'

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
        const hashedPassword = bcrypt.hashSync(password, 12)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpires = Date.now() + 10 * 3600
        const newUser = new User({
            method: 'local',
            local: {
                email: email,
                password: hashedPassword
            },
            url: baseUrl + email.split('@')[0],
            otp: otp.toString(),
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
        const welcomeMessage = `
<!DOCTYPE html>
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
        const mailContent = welcomeMessage
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
        if (otp !== user.otp) return res.status(400).json({ message: 'Invalid OTP' })
        if (user.otpExpires > Date.now()) return res.status(400).json({ message: "OTP Expired" })
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
        const user = await User.findOne({ 'local.email': email })
        if (!user) return res.status(404).json({ message: "User has not registered" })
        const isMatch = bcrypt.compare(password, user.local.password)
        if (!isMatch) return res.status(403).json({ message: "Incorrect Password" })
        const token = jwt.sign({ email: user.local.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: "Login successful", token: token, email: user.local.email, firstName: user.firstName, lastName: user.lastName })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, gender, role, bio, companyIndustry, topics, headshot, socials } = req.body
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
        await user.save()
        res.status(200).json({ message: "User updated", user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const user = await User.findOne({ email: email })
        const name = user.firstName
        if (!user) return res.status(404).json({ errors: "User does not exist" })
        const generateToken = () => {
            return crypto.randomBytes(32).toString('hex');
        };
        const passwordToken = generateToken()
        const passwordTokenExpires = Date.now() + 60 * 60 * 10
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const resetPass = `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
        }

        .header {
            color: #202124;
            font-size: 20px;
            font-weight: 500;
            line-height: 28px;
        }

        .message {
            color: #5C6570;
            font-size: 14px;
            font-weight: 300;
            line-height: 19.60px;
        }

        .otp {
            color: #58CEA2;
            font-size: 14px;
            font-weight: 800;
        }

        .footer {
            color: #5C6570;
            font-size: 14px;
            padding-top: 12px;
        }

        .copyright {
            color: #999999;
            font-size: 12px;
            text-align: center;
            padding-top: 40px;
        }

        .follow-text {
            color: white;
            font-size: 12px;
            text-align: center;
            padding-top: 8px;
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
            <td>
                <img src="https://i.postimg.cc/4mPZLqqV/Spikkr-Logo.png" style="display: block; margin-left: 0; margin-right: auto;">
            </td>
        </tr>
        <tr>
            <td class="header">Reset your password</td>
        </tr>
        <tr>
            <td class="message">Hi ${name},<br><br>You recently tried to request a password change for your account. As a security measure, you need to click the link below to verify your identity:</td>
        </tr>
        <tr>
            <td style="color: #58CEA2; font-size: 14px; font-weight: 500;">${baseUrl}${passwordToken}</td>
        </tr>
        <tr>
            <td class="footer">If you do not recognize this activity, please contact us at support@spikkr.com or simply reply to this email to secure your account.<br><br>Warm regards,<br>Spikkr</td>
        </tr>
        <tr>
            <td class="copyright">Copyright © 2023</td>
        </tr>
        <tr>
            <td bgcolor="#032628" style="padding: 8px 0; border-radius: 8px;">
                <div class="follow-text">Follow us on social media</div>
                <table align="center" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <!-- Social icons with links -->
                        <td>
                            <a href="https://twitter.com/spikkr" target="_blank"><img src="https://i.postimg.cc/Wd4VQScK/twitter.png" alt="Twitter" class="social-icon"></a>
                            <a href="https://linkedin.com/in/spikkr" target="_blank"><img src="https://i.postimg.cc/GHddjd7b/linkedin.png" alt="LinkedIn" class="social-icon"></a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`



        const mailContent = resetPass
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Spikkr - Password Reset",
            html: mailContent
        };
        user.passwordToken = passwordToken;
        user.passwordTokenExpires = passwordTokenExpires;
        await user.save();
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: error.message });
            } else {
                console.log("Email sent: " + info.response);
                res.status(200).json({ message: 'Password reset email sent successfully', email })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg)
            return res.status(422).json({ errors: errorMessages })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email })
        if (!user) return res.status(404).json({ message: "User not found" })
        if (Date.now < user.passwordTokenExpires) return res.status(403).json({ message: "Token has expired" })
        if (token !== user.passwordToken) return res.status(404).json({ message: "Invalid Token" })
        const hashedPassword = bcrypt.hashSync(password, 12)
        user.password = hashedPassword
        user.passwordToken = null
        user.passwordTokenExpires = null
        await user.save()
        res.status(200).json({ message: "Password changed successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getMe = async (req, res) => {
    const user = req.user
    res.status(200).json({
        id: user._id,
        name: user.firstName + " " + user.lastName,
        gender: user.gender,
        role: user.role,
        bio: user.bio,
        country: user.country,
        companyIndustry: user.companyIndustry,
        topics: user.topics,
        socials: user.socials,
        headshot: user.headshot,
        url: user.url,
    })
}

const getUserEvents = async (req, res) => {
    try {
        const { userId } = req.params
        const events = await Event.findOne({ user: userId }).sort({ created_at: -1 })
        if (!events) return res.status(404).json({ message: 'No events found for this User' })
        res.status(200).json({ message: 'Events fetched Successfully', events })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const searchUser = async (req, res) => {
    try {
        let users;

        if (!req.query.$search) {
            users = await User.find().select('-password -method -local -otp -otpExpires -isVerified -createdAt -updatedAt -__v').lean();
        } else {
            const searchRegex = new RegExp(req.query.$search, 'i'); // Case-insensitive regex
            users = await User.find({
                $or: [
                    { firstName: { $regex: searchRegex } },
                    { lastName: { $regex: searchRegex } },
                    { url: { $regex: searchRegex } },
                    { topics: { $regex: searchRegex } }
                ]
            }, {
                password: 0
            })
                .populate('event')
                .lean();
        }
        res.status(200).json({ message: 'Search results', users });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -method -local -otp -otpExpires -isVerified -createdAt -updatedAt -__v').lean();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (!user) return res.status(404).json({ message: "User not found" })
        res.status(200).json({ message: "User successfully fetched", user: user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: errror })
    }
}

const getUserPressKit = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (!user) return res.status(404).json({ message: "User not found" })
        const pressKit = await PressKit.findOne({ user: req.params.id })
        if (!pressKit) return res.status(404).json({ message: "Press kit not found for user" })
        res.status(200).json({ message: "Successful", pressKit })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const createEvent = async (req, res) => {
    try {
        const { title, details, tags, media, date } = req.body
        const user = req.user
        const event = await Event.findOne({ user: user._id, title: title })
        if (event) return res.status(403).json({ message: "Event exists" })
        const newEvent = new Event({
            title: title,
            details: details,
            tags: tags,
            media: media,
            date: date,
        })
        await event.save()
        res.status(201).json({ message: "Event created successfully", event: newEvent })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: message.error })
    }
}

const signupGoogle = async (req, res) => {

}


module.exports = { signup, verifyEmail, login, updateProfile, forgotPassword, resetPassword, getMe, getUserEvents, searchUser, getUsers, getUser, getUserPressKit, createEvent } 