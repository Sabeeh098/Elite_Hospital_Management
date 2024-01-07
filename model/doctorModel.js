const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
      },
    phoneNumber: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    qualification: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
    },
    hospitalAffiliation: {
        type: String,
    },
    notes: {
        type: String, 
    },
    patients:[{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient'
        }]
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;