const Bill = require("../model/bill");
const Medicine = require("../model/medicine");
const Patient = require("../model/patients");
const barcodeModel = require("../model/barcodeModel");
const Doctor = require("../model/doctorModel");

const admin = {
    getDashboard:async(req,res)=>{
        try {
            const patientCount = await Patient.countDocuments();
            const barcodeCount = await barcodeModel.countDocuments();
            const medicineCount = await Medicine.countDocuments();
            const billCount = await Bill.countDocuments();
            const bills = await Bill.find();
            res.render("layout", {
              page_path: "./dashboard/dashboard",
              layout: 'index',
              title: "Dashboard",
              patientCount: patientCount,
              barcodeCount: barcodeCount,
              medicineCount: medicineCount,
              billCount: billCount,
              bills: bills,
            });
          } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
          }
    },

    deletePatientAdmin : async (req,res) => {
      try{
       
        const { patientId } = req.query;

        if (!patientId) {
          return res.status(400).json({ error: 'Patient ID is required.' });
      }

      // Find and remove the patient from the database
      const deletedPatient = await Patient.findByIdAndDelete(patientId);

      // Check if the patient was found and deleted
      if (!deletedPatient) {
          return res.status(404).json({ error: 'Patient not found.' });
      }

      res.redirect("/dashboard")
      
      } catch(error){
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    editPatientAdmin: async (req,res) =>{
    const { patientId, patientName, dateOfBirth, gender, admitDate, otDate } = req.body;

      try {

        const updatedPatient = await Patient.findByIdAndUpdate(
          patientId,
          {
            patientName,
            dateOfbirth: dateOfBirth,
            gender,
            admitDate,
            otDate,
          },
          { new: true }
        );
    
       
        if (!updatedPatient) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        res.redirect("/patients-list")
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },


    deleteDoctor : async (req,res) => {
      try {
        const { doctorId } = req.query;
  
        // Check if the patientId is provided
        if (!doctorId) {
            return res.status(400).json({ error: 'Doctor ID is required.' });
        }
  
        // Find and remove the patient from the database
        const deletedDoctor = await Doctor.findByIdAndDelete(doctorId);
  
        // Check if the patient was found and deleted
        if (!deletedDoctor) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }
        res.redirect("/doctor-list")
      
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    },

    editDoctor: async (req, res) => {
      const { doctorId, doctorName, email, gender, qualification, specialization } = req.body;
  
      try {
          const updatedDoctor = await Doctor.findByIdAndUpdate(
              doctorId,
              {
                  doctorName,
                  email,
                  gender,
                  qualification,
                  specialization,
              },
              { new: true }
          );
  
          if (!updatedDoctor) {
              return res.status(404).json({ success: false, error: 'Doctor not found' });
          }
  
          res.redirect("/doctor-list")
        } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
  }
  
  }
  

module.exports = admin;