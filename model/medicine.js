const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
    medName: {
        type: String,
        required: true,
    },
    medCategory: {
        type: String,
        required: true,
        
    },
    medCompany: {
        type: String,
        required: true,
        
    },
    medDescription: {
        type: String,
        required: true,
        
    },
    medPrice: {
        type: Number,
        required: true,
        min: 0, // Ensures the price is non-negative
    },
    medPhoto: {
        type: String,
        required: true,
        
    },
    medBarcode: {
        type: String,
        required: true,
    },
    medBarcodeCode: {
        type: String,
        required: true,
        unique: true, 
    }
});

const Medicine = mongoose.model("Medicine",medicineSchema);

module.exports=Medicine;