const Event = require('../models/events');
const User = require('../models/user');
const createEvent = async (req, res) => {
    try {
        const { title, date, topics, description, slide, coverPhoto } = req.body
        const user = req.user
        const event = await Event.findOne({ user: user._id, title: title })
        if (event) return res.status(403).json({ message: "Event exists" })
        const newEvent = new Event({
            user: user._id,
            date: date,
            title: title,
            topics: topics,
            description: description,
            coverPhoto: coverPhoto,
            slide: slide
        })
        await newEvent.save()
        res.status(201).json({ message: "Event created successfully", event: newEvent })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort("date")
        res.status(200).json({ events });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getEvent = async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id })
        if (!event) return res.status(404).json({ message: 'Event not found' })
        res.status(200).json({ event });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

const updateEvent = async (req, res) => {
    const { coverPhoto, description, date, topics, slide, title } = req.body
    try {
        const event = await Event.findOne({ _id: req.params.id })
        if (!event) return res.status(404).json({ message: 'Event not found' })
        // check for owner of the event
        if (!user || !user.events.includes(event._id)) {
            return res.status(403).json({ message: 'You are not authorized to perform this action.' });
        }
        if (title) event.title = title
        if (description) event.description = description
        if (coverPhoto) event.coverPhoto = coverPhoto
        if (slide) event.slide = slide
        if (topics && Array.isArray(topics)) event.topics = topics
        if (date) event.date = date
        await event.save();
        res.status(200).json({ message: 'Event updated', event });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getUserEvents = async (req, res) => {
    try {
        const userId = req.params.userId
        const events = await Event.find({ user: userId })
        res.status(200).json({ events })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const deleteEvent = async (req, res) => {
    try {
        let event = await Event.findOne({ _id: req.params.id })
        if (!event) return res.status(404).json({ message: 'Event not found' })
        // check for owner of the event
        const user = await User.findOne({ _id: event.user })
        if (user !== event.user) {
            return res.status(403).json({ message: 'You are not authorized to perform this action.' });
        }
        await Event.deleteOne({ _id: req.params.id })
        res.status(200).json({ message: 'Event deleted' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = { createEvent, getEvents, getEvent, updateEvent, getUserEvents, deleteEvent }