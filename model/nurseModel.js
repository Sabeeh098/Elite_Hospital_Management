const mongoose = require("mongoose")

const nurseSchema = new mongoose.Schema({
    nurseName : {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
    },
    password : {
        type: String,
        unique:true,
        required:true,
    },
    address : {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
      },
    qualification : {
        type: String,
        required: true,
    },
    notes: {
        type: String, 
    },
    passId: {
        type: String,
    },
    code: {
        type: Number,
        unique: true,
        sparse: true, 
        required: false,
    },
})

const Nurse = mongoose.model("Nurse",nurseSchema);

module.exports = Nurse