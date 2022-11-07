const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    video_name:{
        type: String,
        required: true
    },
    students: []
})

const Attendance = mongoose.model('Attendance', attendanceSchema)
module.exports = Attendance