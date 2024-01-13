const Doctor = require("../model/doctorModel");
const Patient = require("../model/patients");
const Nurse = require("../model/nurseModel");
const Barcode = require("../model/barcodeModel");
const Notice = require("../model/notice");

const genPass = require("../config/bcript");
const doctors = {
  getAddDoctor: async (req, res) => {
    res.render("layout", {
      page_path: "./product/adddoctors",
      active_path: "Add Doctor",
      layout: "index",
      title: "Add Doctor",
    });
  },

  addDoctor: async (req, res) => {
    try {
      const {
        doctorName,
        address,
        email,
        phoneNumber,
        gender,
        qualification,
        specialization,
        password,
      } = req.body;
      const newPassword = await genPass.password(password);
      const newDoctor = new Doctor({
        doctorName,
        address,
        email,
        password: newPassword,
        phoneNumber,
        gender,
        qualification,
        specialization,
      });

      const savedDoctor = await newDoctor.save();
      console.log(savedDoctor);
      console.log("Doctor Added Successfully");
      res.redirect("/doctor-list"); // Redirect to the doctor list page or any other page as needed
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getDoctorsList: async (req, res) => {
    try {
      const doctors = await Doctor.find();
      res.render("layout", {
        page_path: "./product/doctorlist",
        layout: "index",
        title: "Doctor List",
        doctor: doctors,
      });
    } catch (error) {
      console.error("Error fetching Doctors:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getDoctorHome: async (req, res) => {
    try {
      const doctorId = req.session.doctorId;
      const doctor = await Doctor.findOne({ _id: doctorId });
      const patients = await Patient.find({ doctors: doctorId }).populate('doctors');
      res.render("layoutDoctor", {
        page_path: "./doctor/doctorHome",
        layout: "index-doctor",
        title: "Doctorhome",
        patients: patients,
        doctor: doctor.doctorName,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  },

  prescriptionPage: async (req, res) => {
    try {
      const doctorId = req.session.doctorId;
      const doctor = await Doctor.findOne({ _id: doctorId });
      const patientId = req.query.patientId;
      console.log(patientId, "asdfgh");
      const nurse = await Nurse.find();
      const patientDetails = await Patient.findById(patientId);
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
      // Render the edit prescription page with patient details
      res.render("layoutDoctor", {
        page_path: "./doctor/updatePrescription",
        layout: "index-doctor",
        title: "Edit Prescription",
        patientDetails: patientDetails,
        nurse: nurse,
        dataAfterKeyword: dataAfterKeyword,
        doctor: doctor.doctorName,
        formatDate: formatDate,
      });
    } catch (error) {
      console.error("Error in doctor-prescription route:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  updatePrescription: async (req, res) => {
    try {
      const {
        patientId,
        nurseId,
        discription,
        operationSide,
        operationJoint,
        leftFemurProsthesisSize,
        rightFemurProsthesisSize,
        leftTibialSize,
        rightTibialSize,
        plasticInsertSize,
        patellaSize,
      } = req.body;

      const tibialSize = [...leftTibialSize, ...rightTibialSize];
      const femurProsthesisSize = [...leftFemurProsthesisSize, ...rightFemurProsthesisSize];
      const requirementsArray = Array.isArray(req.body.patientRequirements)
        ? req.body.patientRequirements
        : [req.body.patientRequirements];

      console.log(req.body, requirementsArray, "this is body and requirement");

      const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        {
          $set: {
            nurse: nurseId,
            discription,
            operationSide,
            operationJoint,
            femurProsthesisSize,
            tibialSize,
            plasticInsertSize,
            patellaSize,
            patientRequirements: requirementsArray,
          },
        },
        { new: true }
      );

      if (!updatedPatient) {
        return res.status(404).send("Patient not found");
      }

      res.redirect("/doctorHome");
    } catch (error) {
      console.error("Error updating prescription:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  addnote: async (req, res) => {
    try {
      const doctorId = req.session.doctorId;
      const doctor = await Doctor.findOne({ _id: doctorId });
      res.render("layoutDoctor", {
        page_path: "./doctor/addNotes",
        layout: "index-doctor",
        title: "Add note",
        doctor: doctor.doctorName,

      });
      console.log(doctor.doctorName);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  },
  postAddNote: async (req, res) => {
    try {
      const doctorId = req.session.doctorId;
      const { notes } = req.body;
      const doctor = await Doctor.findOne({ _id: doctorId });

      if (doctor) {
        const currentDate = new Date().toLocaleString(); // Adjust date format as needed
        doctor.notes = doctor.notes
          ? `${doctor.notes}\n${currentDate}: ${notes}`
          : `${currentDate}: ${notes}`;

        await doctor.save();

        res.redirect("/Doctor-add-notes");
      } else {
        res.status(404).send("Doctor not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  listNotesDoctor: async (req, res) => {
    try {
      const doctorId = req.session.doctorId;
      const doctor = await Doctor.findOne({ _id: doctorId });

      if (doctor) {
        res.render("layoutDoctor", {
          page_path: "./doctor/listnotes",
          layout: "index-doctor",
          title: "Add note",
          doctor: doctor.doctorName,
          notes: doctor.notes,
        });
      } else {
        res.status(404).send("Doctor not found");
      }
    } catch (error) {
      console.log(error);
    }
  },
  getDocProManager: async (req, res) => {
    try {
      const patients = await Patient.find();
      const doctorId = req.session.doctorId;
      const doctor = await Doctor.findOne({ _id: doctorId });
      res.render("layoutDoctor", {
        page_path: "./doctor/DocProManage",
        layout: "index-doctor",
        title: "Product Manage",
        patients: patients,
        doctor: doctor.doctorName,
      });
    } catch (err) {
      console.log("Error Fetching the details of patients", err);
      next(err);
    }
  },

  getProDetailsPage: async (req, res) => {
    try {
      const patientId = req.query.patientId;
      const patientDetails = await Patient.findById(patientId);
      const doctorId = req.session.doctorId;
      const doctor = await Doctor.findOne({ _id: doctorId });
      res.render("layoutDoctor", {
        page_path: "./doctor/ProDetails",
        layout: "index-doctor",
        title: "Product Details",
        patient: patientDetails,
        doctor: doctor.doctorName,
      });
    } catch (error) {
      console.error("Error rendering patient details page:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getProductDetailsByPatientId: async (req, res) => {
    try {
      const patientId = req.params.patientId;

      const patientDetails = await Patient.findById(patientId);

      if (!patientDetails) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json({ patient: patientDetails });
    } catch (error) {
      console.error("Error fetching patient details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  doctorShowNotices: async (req, res) => {
    try {
      const notices = await Notice.find().sort({ _id: -1 });
      const doctorId = req.session.doctorId;
      const doctor = await Doctor.findOne({ _id: doctorId });
      res.render("layoutDoctor", {
        page_path: "./doctor/notices",
        layout: "index-doctor",
        title: "Show Notice",
        notices: notices,
        doctor: doctor.doctorName,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  },
};
module.exports = doctors;
