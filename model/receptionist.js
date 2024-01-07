const mongoose = require("mongoose")

const receptionistSchema = new mongoose.Schema({
    receptionistName : {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
    },
    password : {
        type: String,
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
})

const Receptionist = mongoose.model("Receptionist",receptionistSchema);

module.exports = Receptionist