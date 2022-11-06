const mongoose = require('mongoose')
const validator = require('validator')

const recordSchema = new mongoose.Schema({
    teacher_email:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    year:{
        type: String,
        required: true
    },
    class:{
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    video_name: {
        type: String,
        required: true
    },
    is_processed:{
        type: Boolean,
        default: false
    }
})

const Record = mongoose.model('Record', recordSchema)
module.exports = Record