const Event = require('../models/events');
const createEvent = async (req, res) => {
    try {
        const { title, date, topics, description, slides, coverPhoto } = req.body
        const user = req.user
        const event = await Event.findOne({ user: user._id, title: title })
        if (event) return res.status(403).json({ message: "Event exists" })
        const newEvent = new Event({
            user: user._id,
            date: date,
            topics: topics,
            description: description,
            slides: slides,
            coverPhoto: coverPhoto
        })
        await newEvent.save()
        res.status(201).json({ message: "Event created successfully", event: newEvent })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = { createEvent }