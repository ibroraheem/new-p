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
    const user = req.user
    const { media, fullBio } = req.body
    let pressKit;
    if (!user) return res.status(403).json({ message: "User not found" })
    presskit = PressKit.findOne({ user: user._id })
    if (presskit) {
      PressKit.findOneAndDelete({ user: user._id })
      pressKit = new PressKit({
        user: user._id,
        media: media,
        fullBio: fullBio
      });
      await pressKit.save();
      res.status(201).json({ message: "Created Successfully!", pressKit: pressKit });
    } else {
      pressKit = new PressKit({
        user: user._id,
        media: media,
        fullBio: fullBio
      });
      await pressKit.save();
      res.status(201).json({ message: "Created Successfully!", pressKit: pressKit });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

const getPressKit = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId })
    if (!user) return res.status(404).json({ message: "User not found" })
    const pressKit = await PressKit.findOne({ user: req.params.userId })
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
}

const updatePresskit = async (req, res) => {
  try {
    const user = req.user;
    const { media, fullBio } = req.body;
    if (!user) return res.status(403).json({ message: "User not found" });

    // Use await to get the actual document from the query
    const presskit = await PressKit.findOne({ user: user._id });

    if (!presskit) {
      return res.status(404).json({ message: "Press kit not found" });
    }

    presskit.media = media;
    presskit.fullBio = fullBio;

    // Use await to save the changes
    await presskit.save();

    res.status(200).json({ message: "Press kit updated successfully", presskit });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const giveTestimonial = async (req, res) => {
  const { name, testimonialText } = req.body;
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.testimonial.push({ name, text: testimonialText });
    await user.save();
    return res.status(200).json({ message: 'Testimonial added successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const searchUser = async (req, res) => {
  try {
    let users;

    if (!req.query.$search) {
      users = await User.find().select('-password -method -local -otp -otpExpires -isVerified -createdAt -updatedAt -__v').lean();
    } else {
      const searchRegex = new RegExp(req.query.$search, 'i');
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


module.exports = { searchUser, getUsers, getUser, createPressKit, getPressKit, updatePresskit, giveTestimonial } 