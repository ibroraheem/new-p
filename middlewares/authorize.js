const User = require('../models/user')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config()

const authorizeUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token)
            return res.status(403).json({ message: "Token is required" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.email)
            return res.status(403).json({ message: "Invalid Token" });
        const user = await User.findOne({ email: decoded.email })
        if (!user) return res.status(404).json({ message: "User not found" });
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const isEmailVerified = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token)
            return res.status(403).json({ message: "Token is required" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded.email);
        if (!decoded.email)
            return res.status(403).json({ message: "Invalid Token" });
        const user = await User.findOne({ email: decoded.email })
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified !== true) return res.status(403).json({ message: "User not verified" });
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { authorizeUser, isEmailVerified };