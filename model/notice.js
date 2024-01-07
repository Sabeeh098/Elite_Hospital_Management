const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    noticeTitle: {
        type: String,
        required: true,
    },
    noticeContent: {
        type: String,
        required: true,
    },
    date: { 
        type: Date,
         default: Date.now
 },
})

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
