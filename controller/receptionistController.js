const Doctor = require("../model/doctorModel");
const Patient = require("../model/patients");
const Receptionist = require("../model/receptionist");
const genPass = require("../config/bcript");
const Nurse = require("../model/nurseModel");
const Notice = require("../model/notice");

const receptionists = {
  getAddReceptionist: async (req, res) => {
    res.render("layout", {
      page_path: "./product/addreceptionist",
      layout: 'index',
      title: "Add Receptionist",
    });
  },

  addReceptionist: async (req, res) => {
    try {
      const {
        receptionistName,
        email,
        password,
        address,
        gender,
        qualification
      } = req.body;

      const newPassword = await genPass.password(password)
  
      const newReceptionist = new Receptionist({
        receptionistName,
        email,
        password:newPassword,
        address,
        gender,
        qualification
      });
  
      await newReceptionist.save();
  
      res.redirect("/Reception-list"); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getReceptionistHome: async (req, res) => {
    try {
      const patients = await Patient.find().sort({ _id: -1 });
      function formatDate(date) {
        date = new Date(date);
        const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
        const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }
      if(patients){
          res.render("layoutReception", {
            page_path: "./receptionist/receptionHome",
            layout: "index-reception",
            title: "Reception Home",
            patients: patients,
            formatDate:formatDate,
          });

      }else{
        return res.status(400).json("Ptients not scheduled today");
      }
    } catch (error) {
      console.error("Error fetching Nurse List:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAddPatientRecep:async(req,res)=>{
    try {
      const nurse = await Nurse.find()
        const doctor = await Doctor.find()
        res.render("layoutReception", {
          page_path: "./receptionist/addpatients",
          active_path: "Add Patients",
          layout: "index-reception",
          title: "Add Patients",
          doctor: doctor,
          nurse:nurse,
        });
      } catch (error) {
        console.log(error);
      }
  },

  addPatientRecep:async(req,res)=>{
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
  
        console.log(req.body,"req.body");
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
  
        console.log(patientCode);
        await patientData.save();
  
        res.redirect("/receptionHome")
      } catch (error) {
        console.error("Error saving patient details:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
  },
  
  getReceptionistList : async (req,res) => {
    try {
      const receptionist = await Receptionist.find();
  
      res.render("layout", {
        page_path: "./product/receptionList",
        layout: 'index',
        title: "Reception List",
        receptionist: receptionist,
      });
    } catch (error) {
      console.error("Error fetching Reception List:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  patientdetailsRec : async (req,res) => {
    try{
      const patientId = req.query.patientId;
      const patient = await Patient.findById(patientId);

      res.render("layoutReception", {
        page_path: "./receptionist/patientDetails",
        layout: "index-reception",
        title: "Patients Lisr",
        patient: patient,
      });
      
    } catch(error){
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  },

  deletePatient : async(req,res) => {
    try {
      const { patientId } = req.query;

      // Check if the patientId is provided
      if (!patientId) {
          return res.status(400).json({ error: 'Patient ID is required.' });
      }

      // Find and remove the patient from the database
      const deletedPatient = await Patient.findByIdAndDelete(patientId);

      // Check if the patient was found and deleted
      if (!deletedPatient) {
          return res.status(404).json({ error: 'Patient not found.' });
      }
      res.redirect("/receptionHome")
    
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
  },


  editPatientRece : async(req,res) => {
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
    res.redirect("/receptionHome")
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  },

  addNotes : async (req,res) => {
    try{

      const receptionId = req.session.receptionistId
      const reception = await Receptionist.findOne({_id:receptionId})
      res.render("layoutReception", {
        page_path: "./receptionist/addNotes",
        layout: "index-reception",
        title: "Add Notes",
        reception:reception,
      
      });
    } catch(error) {
      console.log((error));
      res.status(500).send("Internal Server Error");
    }
  },

  submitNotes: async (req, res) => {
    try {
        const receptionId = req.session.receptionistId;
        console.log(receptionId);
        const { notes } = req.body;
        console.log(notes);

        const receptionist = await Receptionist.findOne({ _id: receptionId });
        if (receptionist) {
            // Append the new note with date to the existing notes
            const currentDate = new Date().toLocaleString(); // Adjust date format as needed
            receptionist.notes = receptionist.notes
                ? `${receptionist.notes}\n${currentDate}: ${notes}`
                : `${currentDate}: ${notes}`;

            await receptionist.save();

            res.redirect("/Reception-Add-Note");
        } else {
            // Handle case where receptionist with the given _id is not found
            res.status(404).send('Receptionist not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
},


  listNotes: async (req, res) => {
    try {
        const receptionId = req.session.receptionistId;
        
        // Fetch the receptionist details, including the notes, from the database
        const receptionist = await Receptionist.findOne({ _id: receptionId });

        if (receptionist) {
            // Render the frontend and pass the notes to the view
            res.render("layoutReception", {
                page_path: "./receptionist/listnotes",
                layout: "index-reception",
                title: "List Notes",
                notes: receptionist.notes,
            });
        } else {
            // Handle case where receptionist with the given _id is not found
            res.status(404).send('Receptionist not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
},

receptionShowNotices : async (req,res) => {
  try{

    const notices = await Notice.find().sort({ _id: -1 })
    res.render("layoutReception", {
      page_path: "./receptionist/notices",
      layout: "index-reception",
      title: "Notices",
      notices:notices,
      
  });
  } catch(error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}



};

module.exports = receptionists;