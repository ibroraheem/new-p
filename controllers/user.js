const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Event = require('../models/events');
const PressKit = require('../models/pressKit');
require('dotenv').config()
const baseUrl = 'https://spikkr-next-js.vercel.app/'


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
    res.status(500).json({ message: error.message })
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



const signupGoogle = async (req, res) => {
  try {

  } catch (error) {

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

module.exports = { searchUser, getUsers, getUser, getUserPressKit, createEvent } 