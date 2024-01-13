const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patientName: {
    type: String,
    
  },
  nurseName: {
    type: String,
    
  },
  patientCode: {
    type: String,
    unique: true,
    
  },
  dateOfbirth: {
    type: Date,
    
  },
  discription : {
    type: String,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  
  },
  admitDate: {
    type: Date,
    
  },
  otDate: {
    type: Date,
   
  },
  operationSide: {
    type: String,
   
  },
  operationJoint: {
    type: String,
   
  },
  femurProsthesisSize: {
    type: [String], 

},
  tibialSize: {
    type: [String], 
  
  },
  plasticInsertSize: {
    type: [String], 
   
  },
  patellaSize: {
    type: String,
   
  },
  status: {
    type: String,
    enum: ["approved", "pending", "needsTraining"], 
    default: "pending",
  },
  
  patientRequirements: {
    type: [String],
    default: [],
  },
  patientPhoto: {
    type: String,
    
  },
  doctors:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  nurse:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nurse'
  },

});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;