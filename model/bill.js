const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    billNo: {
        type: Number,
        required: true,
        unique: true,
    },
    medCategory: {
        type: String,
        required: true,
    },
    medName: {
        type: String,
        required: true,
    },
    medPrice: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
    },
    doctorName: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;
