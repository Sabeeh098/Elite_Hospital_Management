const mongoose = require('mongoose');
const { Schema } = mongoose;

const barcodeSchema = new Schema({
    productCode : {
        type: String,
        required: true,
    },
    productDescription : {
        type: String,
        required: true,
    },
    productBrand : {
        type: String,
        required: true,
    },
    sterile : {
        type: String,
        required: true,
    },
    meterialOfConstruct : {
        type: String,
        required: true,
    },
    subCategory : {
        type: String,
    },
    productType : {
        type: String,
    },
    eachPack : {
        type: String,
    },
    unitOfMeasure : {
        type: String,
        required: true,
    },
    medicalDeviceClassification : {
        type: String,
        required: true,
    },
    gs1Code: {
        type: String,
        required: true,
    },
    barcodeCode: {  
        type: String,
        required: true,
    },
    barcodeImage : {
        type: String,
        required: true,
    }
});

const Barcode = mongoose.model('Barcode', barcodeSchema);

module.exports = Barcode;
