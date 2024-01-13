const Nurse = require("../model/nurseModel");
const Patient = require("../model/patients");
const genPass = require("../config/bcript");
const Notice = require("../model/notice");
const Barcode = require("../model/barcodeModel");

const nurse = {
    getAddNurse:async(req,res)=>{
        res.render("layout", {
            page_path: "./product/addnurse",
            active_path: "Add Nurse",
            layout: 'index',
            title: "Add Nurse",
          });
    },

    addNurse: async (req, res) => {
      try {
        const { nurseName, email, password, address, gender, qualification } = req.body;
    
        const generateUniqueCode = () => {
          return Math.floor(1000 + Math.random() * 9000);
        };
    

        const existingNullCodeDocs = await Nurse.find({ code: null });
    
        existingNullCodeDocs.forEach(async (doc) => {
          doc.code = generateUniqueCode();
          await doc.save();
        });
    
      
        let uniqueCode;
        do {
          uniqueCode = generateUniqueCode();
        } while (await Nurse.exists({ code: uniqueCode }));
    
        const newPassword = await genPass.password(password);
    
        const newNurse = new Nurse({
          nurseName,
          email,
          password: newPassword,
          address,
          gender,
          qualification,
          passId: uniqueCode,
        });
    
        const saveNurse = await newNurse.save();
        console.log("Nurse Added Successfully");
        res.redirect('/nurse-list');
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    },
    

    getNurses:async(req,res)=>{
        try {
            const nurses = await Nurse.find();
        
            res.render("layout", {
              page_path: "./product/nurselist",
              layout: 'index',
              title: "Nurse List",
              nurses: nurses,
            });
          } catch (error) {
            console.error("Error fetching Nurse List:", error);
            res.status(500).json({ error: "Internal Server Error" });
          }
    },

    getNersHome: async (req, res) => {
      try {
          const nurseId = req.session.nurseId; 
         console.log(nurseId);
         const patients = await Patient.find({ nurse: nurseId }).populate('nurse');
  
          res.render("layoutNurse", {
              page_path: "./nurse/nurseHome",
              layout: 'index-nurse',
              title: "Nurse Home",
              patients: patients
          });
      } catch (error) {
          console.log(error);
          res.status(500).send('Internal Server Error');
      }
  },

    getPatientDetails : async (req,res) => {
      try {
        const patientId = req.query.patientId
        const patient = await Patient.findById(patientId);

        res.render("layoutNurse", {
          page_path: "./nurse/patientDetailsNurse",
          layout: 'index-nurse',
          title: "Patient Details",
          patient: patient,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');

      }
    },

    addNotesNurse : async (req,res) => {
      try{
        const nurseId = req.session.nurseId;
        const nurse = await Nurse.findOne({_id:nurseId});
        res.render("layoutNurse", {
          page_path: "./nurse/addNoteNurse",
          layout: 'index-nurse',
          title: "Patient Details",
          nurse:nurse
        });

      } catch (error){
        console.log(error);
      res.status(500).send("Internal Server Error");

      }

    },

    submitNoteNurse : async(req,res) => {
      try{
        const nurseId = req.session.nurseId;
        const {notes} = req.body;

        const nurse = await Nurse.findOne({_id:nurseId})

        if(nurse) {
          const currentDate = new Date().toLocaleString(); // Adjust date format as needed
 
          nurse.notes = nurse.notes
          ? `${nurse.notes}\n${currentDate}: ${notes}`
          : `${currentDate}: ${notes}`;

      await  nurse.save();
          res.redirect("/Nurse-Add-Notes")

        }
        else{
          res.status(404).send('Nurse not found');

        }
      } catch(error) {
        console.log(error);
        res.status(500).send('Internal Server Error');

      }
    },

    listNotesNurse : async (req,res) => {
      try{
        const nurseId = req.session.nurseId;

        const nurse = await Nurse.findOne({_id:nurseId});

        if(nurse){
          res.render("layoutNurse", {
            page_path: "./nurse/listNotes",
            layout: 'index-nurse',
            title: "Patient Details",
           notes:nurse.notes,
          });
        }
        else{
          res.status(404).send('Nurse not found');

        }
      } catch(error) {
        console.log(error);
        res.status(500).send('Internal Server Error');

      }
    },

    showNoticeNurse : async (req,res) => {
      try{
        const notices = await Notice.find().sort({_id:-1})
        res.render("layoutNurse", {
          page_path: "./nurse/notices",
          layout: 'index-nurse',
          title: "Patient Details",
          notices:notices,
        });
      } catch(error) {
        console.log(error);
    res.status(500).send('Internal Server Error');

      }
    },

    getPatientedit : async (req,res) => {
      try{
        console.log("Vanno")
        const patientId = req.query.patientId;
        console.log(patientId,"Vanno")
        const nurse = await Nurse.find();
        const patient = await Patient.findById(patientId);
        const barcodeResults = await Barcode.find({
          productDescription: {
            $regex: /(Left|Right)/i, // Match "Left" or "Right" with case-insensitivity
          },
        });
  
        const dataAfterKeyword = {
          left: [],
          right: [],
        };
  
        barcodeResults.forEach((result) => {
          const trimmedDescription = result.productDescription.trim();
          if (trimmedDescription.toLowerCase().includes("left")) {
            dataAfterKeyword.left.push(trimmedDescription);
          }
          if (trimmedDescription.toLowerCase().includes("right")) {
            dataAfterKeyword.right.push(trimmedDescription);
          }
        });
        function formatDate(date) {
          date = new Date(date);
          const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
          const month = `${date.getMonth() + 1 < 10 ? "0" : ""}${
            date.getMonth() + 1
          }`;
          const year = date.getFullYear();
          return `${year}-${month}-${day}`;
        }
        res.render("layoutNurse", {
          page_path: "./nurse/editPatients",
          layout: 'index-nurse',
          title: "Edit Patients",
          patient:patient,
          nurse:nurse,
          dataAfterKeyword: dataAfterKeyword,
          formatDate: formatDate,

        });
      } catch(error){
        console.log(error);
    res.status(500).send('Internal Server Error');

      }
    },

    editPatientNurse : async (req,res) => {
      try {
        const { patientId, nurseId, description, operationSide, operationJoint,  leftFemurProsthesisSize,
          rightFemurProsthesisSize, leftTibialSize,rightTibialSize, plasticInsertSize, patellaSize, patientRequirements } = req.body;
    
        const tibialSize = [...leftTibialSize, ...rightTibialSize];
        const femurProsthesisSize = [...leftFemurProsthesisSize, ...rightFemurProsthesisSize];
        
        const requirementsArray = Array.isArray(req.body.patientRequirements)
        ? req.body.patientRequirements
        : JSON.parse(req.body.patientRequirements || "[]");
        const updatedPatient = await Patient.findByIdAndUpdate(
          patientId,
          {
            nurseId,
            description,
            operationSide,
            operationJoint,
            femurProsthesisSize,
            tibialSize,
            plasticInsertSize,
            patellaSize,
            patientRequirements: requirementsArray,
          },
          { new: true } // This option returns the updated patient
        );
          res.redirect("/nurseHome")
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    }
};

module.exports = nurse;