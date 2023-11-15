const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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

const createPressKit = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    const { media, fullBio } = req.body
    let pressKit;
    if (!user) return res.status(403).json({ message: "User not found" })
    pressKit = new PressKit({
      user: req.params.id,
      media: media,
      fullBio: fullBio
    });
    await pressKit.save();
    res.status(201).json({ message: "Created Successfully!" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

const getPressKit = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    if (!user) return res.status(404).json({ message: "User not found" })
    const pressKit = await PressKit.findOne({ user: req.params.id })
      .populate({
        path: 'user',
        select: 'firstName lastName role topics bio socials'
      })
      .exec();

    if (!pressKit) {
      return res.status(404).json({ error: 'Press Kit not found for the user' });
    }

    return res.status(200).json(pressKit);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
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
}

module.exports = { searchUser, getUsers, getUser, createPressKit, getPressKit } 