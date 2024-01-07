const Doctor = require("../model/doctorModel");
const Patient = require("../model/patients");
const patient = {
    // role:null,
    getAddPatients:async(req,res)=>{
        try {
            role = req.session.role 
            console.log(req.session);
            const doctor = await Doctor.find()
            res.render("layout", {
              page_path: "./product/addpatients",
              active_path: "Add Patients",
              layout: role === "admin" ? "index" : "index-two",
              title: "Add Patients",
              doctor: doctor
            });
          } catch (error) {
            console.log(error);
          }
    },

    addPatients:async(req,res)=>{
        try {
            const getRandomSixDigitNumber = () => {
                const sixDigitNumber = Math.floor(100000 + Math.random() * 900000);
                return `#${sixDigitNumber}`;
              };
            const patientCode = getRandomSixDigitNumber();
            const {
              patientName,
              doctorId,
              dateOfbirth,
              gender,
              admitDate,
              otDate,
            } = req.body;
      
            
      
            const patientPhoto = req.file ? req.file.filename : null;
      
            const patientData = new Patient({
              patientName,
              doctors:doctorId,
              patientCode,
              dateOfbirth,
              gender,
              admitDate,
              otDate,
              patientPhoto,
            });
      
            console.log(patientData,"Full undo");
            await patientData.save();
      
            res.redirect(req.originalUrl);
      
          } catch (error) {
            console.error("Error saving patient details:", error);
            res.status(500).json({ error: "Internal Server Error" });
          }
    },

    getpatientUpdateinNurse : async(req,res) =>{
      try{
        const patientId = req.query.patientId;

        const patient = await Patient.findById(patientId);
        function formatDate(date) {
          date = new Date(date);
          const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
          const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
          const year = date.getFullYear();
          return `${year}-${month}-${day}`;
      }
        if(!patient){
      return res.status(404).send("Patient not found");
        }
        res.render("layoutNurse", {
          page_path: "./nurse/editPatients",
          layout: 'index-nurse',
          title: "Nurse Home",
          patient: patient,
          formatDate: formatDate

        });
      } catch(error){
          console.log(error); 
      }
    },

    PostPatientInNurse : async(req,res) => {
      try{
        const patientId = req.params.id
        const { patientName,dateOfBirth,admitDate,otDate } = req.body;
        const updatePatient = await Patient.findByIdAndUpdate(patientId,
          {
          patientName,
          dateOfBirth,
          admitDate,
          otDate,

        },
        {new : true}
        );
        if (!updatePatient) {
          console.error("Patient not found or not updated");
          return res
            .status(404)
            .json({ error: "Patient not found or not updated" });
        }
        res.redirect("/nurseHome")
      } catch(error){
        console.log(error);
      res.status(500).json({ error: "Internal Server Error" });

      }
    } 

}

module.exports = patient;