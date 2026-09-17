const mongoose = require('mongoose')
const nanoId = require('nanoid')

const shortUrlSchema = new mongoose.Schema({
    full: {
        type: String,
        required: true
    },
    short: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        default: () => nanoId.nanoid(8)
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    },
    anonymousUserID: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('ShortUrl', shortUrlSchema)