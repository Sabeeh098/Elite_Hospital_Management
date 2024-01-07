const express = require("express");
const route = express.Router();
const public_routes = require("./public.routes");
const csvParser = require("csv-parser");
const csv = require("csv-parser");
const fs = require("fs");
const barcodeModel = require("../model/barcodeModel");
// const Patients = require("../model/patients");
const Admin = require("../model/admin");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const Patient = require("../model/patients");
const note = require("../model/note");
const Medicine = require("../model/medicine");
const Bill = require("../model/bill");
const Notice = require("../model/notice");
const Nurse = require("../model/nurseModel");
const Doctor = require("../model/doctorModel");
const Receptionist = require("../model/receptionist");
const doctors = require("../controller/doctorController");
const login = require("../controller/loginControll");
const nurse = require("../controller/nurseControll");
const patient = require("../controller/patientsControll");
const reception = require("../controller/receptionistController");
const auth = require("../middleware/auth");
const barcode = require("../controller/barcodeController");
const admin = require("../controller/AdminController");

const {
  isNurseLogin,
  isNurseLogout,
  isReceptionLogin,
  isLogin,
  isLogout,
  isDoctorLogin,
} = auth;


const {
  getAddDoctor,
  addDoctor,
  getDoctorHome,
  getDoctorsList,
  prescriptionPage,
  getDocProManager,
  getProDetailsPage,
  getProductDetailsByPatientId,
  updatePrescription,
  addnote,
  postAddNote,
  doctorShowNotices,
  listNotesDoctor,
} = doctors;

const { 
  getDashboard,
  deletePatientAdmin,
  editPatientAdmin,
  deleteDoctor,
  editDoctor,
 }
 = admin;
const {
  getBarcode,
  uploadBulkBarcode,
  addBarcode,
  getListBarcode,
  getScanBarcode,
  scanBarcode,
  barcodeDetails,
  processBarcode,
} = barcode;

const { doLogin, logout } = login;
const { getAddNurse, addNurse, getNurses, getNersHome, getPatientDetails,addNotesNurse ,listNotesNurse,submitNoteNurse,showNoticeNurse,getPatientedit,editPatientNurse} =
  nurse;


const {
  getAddPatients,
  addPatients,
  getpatientUpdateinNurse,
  PostPatientInNurse,
} = patient;




const {
  getReceptionistHome,
  addReceptionist,
  getAddReceptionist,
  getReceptionistList,
  getAddPatientRecep,
  addPatientRecep,
  patientdetailsRec,
  deletePatient,
  editPatientRece,
  addNotes,
  submitNotes,
  listNotes,
  receptionShowNotices,
} = reception;

route.use(express.json());
// Parse URL-encoded data
route.use(express.urlencoded({ extended: true }));

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/assets/barcode"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name
  },
});

const upload = multer({ storage: storage });

var LocalStorage = require("node-localstorage").LocalStorage,
  localStorage = new LocalStorage("./local-storage");

var selected_layout = "index";

var changeLayout = function (res) {
  setLayout();
  res.redirect(public_routes.dashboard);
};

route.use(function (req, res, next) {
  let url_replace_options = req.url.replace("?", "");
  res.locals.routes = public_routes;
  res.locals.current_routes = url_replace_options;
  next();
});

var setLayout = function () {
  let current_layout = localStorage.getItem("layout");
  if (current_layout == "index") {
    selected_layout = "index";
  }
  if (current_layout == "index-one") {
    selected_layout = "index-one";
  }
  if (current_layout == "index-two") {
    selected_layout = "index-two";
  }
  if (current_layout == "index-three") {
    selected_layout = "index-three";
  }
  if (current_layout == "index-four") {
    selected_layout = "index-four";
  }
};
setLayout();

route.get("/index", function (req, res) {
  console.log(res);
  localStorage.setItem("layout", "index");
  changeLayout(res);
});

route.get("/index-one", function (req, res) {
  localStorage.setItem("layout", "index-one");
  changeLayout(res);
});

route.get("/index-two", function (req, res) {
  localStorage.setItem("layout", "index-two");
  changeLayout(res);
});

route.get("/index-three", function (req, res) {
  localStorage.setItem("layout", "index-three");
  changeLayout(res);
});

route.get("/index-four", function (req, res) {
  localStorage.setItem("layout", "index-four");
  changeLayout(res);
});

// redirect
route.get("/", auth.isLogin, function (req, res) {
  res.redirect(public_routes.dashboard);
});
// redirect **

// auth
route.get(public_routes.login, auth.isLogout, (req, res, next) => {
  res.render("Auth/login");
});
route.get("/forget-password", (req, res, next) => {
  res.render("Auth/forgetPassword");
});
route.get(public_routes.signUp, (req, res, next) => {
  res.render("Auth/signup");
});
route.get("/reset-password", (req, res, next) => {
  res.render("Auth/resetPassword");
});

///////////////Receptionist/////////
route.get(public_routes.receptionistlogin, (req, res, next) => {
  res.render("receptionist/login");
});
////////////////////////////////////

route.get(public_routes.doctorlogin, (req, res, next) => {
  res.render("doctor/doclogin");
});
route.get(public_routes.doctorlogin, (req, res, next) => {
  res.render("doctor/doclogin");
});
// auth **
route.post("/login", auth.isLogout, doLogin);
route.get("/logout", auth.isLogin, logout);




function generateRandomPassword(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

// Your existing route.post('/forgot-password', ...) handler
route.post('/forgot-password', async (req, res) => {
  try {
    const userEmail = req.body.email;

    // Search for the email in all collections
    const doctor = await Doctor.findOne({ email: userEmail });
    const nurse = await Nurse.findOne({ email: userEmail });
    const receptionist = await Receptionist.findOne({ email: userEmail });
    const admin = await Admin.findOne({ email: userEmail });

    if (!doctor && !nurse && !receptionist && !admin) {
      return res.status(400).json({ error: 'Email not found' });
    }

    let role;
    if (doctor) role = 'doctor';
    else if (nurse) role = 'nurse';
    else if (receptionist) role = 'receptionist';
    else if (admin) role = 'admin';

    const newPassword = generateRandomPassword(8); // Adjust the length as needed

    // Update the user's password in the corresponding collection
    switch (role) {
      case 'doctor':
        doctor.password = newPassword;
        await doctor.save();
        break;
      case 'nurse':
        nurse.password = newPassword;
        await nurse.save();
        break;
      case 'receptionist':
        receptionist.password = newPassword;
        await receptionist.save();
        break;
      case 'admin':
        admin.password = newPassword;
        await admin.save();
        break;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'frameexplore@gmail.com',
        pass: 'tghi pxwu wghk pnoq',
      },
    });

    const mailOptions = {
      from: 'frameexplore@gmail.com',
      to: userEmail,
      subject: 'Password Reset',
      html: `<p>Your new password is: ${newPassword}</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'New password sent to the email address' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


route.post('/import-medicine', upload.single('csvFile'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer.toString(); // Convert file buffer to string
    const rows = fileBuffer.split('\n'); // Split rows

    const headers = rows[0].split(','); // Assuming the first row contains headers

    // Iterate over remaining rows and create Medicine objects
    for (let i = 1; i < rows.length; i++) {
      const data = rows[i].split(',');

      const medicineData = {};

      // Map headers to data fields
      headers.forEach((header, index) => {
        medicineData[header.trim()] = data[index].trim();
      });

      // Create a new Medicine instance and save to MongoDB
      const newMedicine = new Medicine({
        medName: medicineData['Medicine Name'],
        medCategory: medicineData['Medicine Category'],
        medCompany: medicineData['Medicine Company'],
        medDescription: medicineData['Medicine Description'],
        medPrice: parseFloat(medicineData['Medicine Price']),
        medPhoto: medicineData['Medicine Photo'],
        medBarcode: medicineData['Medicine Barcode'],
        medBarcodeCode: medicineData['Medicine Barcode Code'],
      });

      await newMedicine.save();
    }

    res.status(200).json({ message: 'Medicine data imported successfully' });
  } catch (error) {
    console.error('Error importing medicine data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
////Send Mail//////////////
route.get(public_routes.send_mail, (req, res, next) => {
  res.render("layout", {
    page_path: "./application/sendMail",
    layout: selected_layout,
    title: "Send Mail",
  });
});


route.post("/send-mail", upload.single("attachment"), sendIndividualMail);

route.post("/send-bulk-mail", upload.single("attachmentList"), sendBulkMail);

function sendIndividualMail(req, res) {
  const { recipient, subject, body } = req.body;
  const attachment = req.file;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "frameexplore@gmail.com",
      pass: "tghi pxwu wghk pnoq",
    },
  });
  const mailOptions = {
    from: "frameexplore@gmail.com",
    to: recipient,
    subject: subject,
    text: body,
  };

  if (attachment) {
    mailOptions.attachments = [
      {
        filename: attachment.originalname,
        content: attachment.buffer,
      },
    ];
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.json({ success: false, error: error.message });
    }
    console.log("Mail send Successfully");
    res.redirect("/send-mail");
  });
}

async function sendBulkMail(req, res) {
  try {
    const { recipientList, subject, body } = req.body;
    const attachmentList = req.file;

    const recipients = recipientList.split(",").map((email) => email.trim());

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "frameexplore@gmail.com",
        pass: "tghi pxwu wghk pnoq",
      },
    });

    const mailOptions = {
      from: "frameexplore@gmail.com",
      to: recipients.join(","),
      subject: subject,
      text: body,
    };

    if (attachmentList) {
      const attachment = await processCSVAttachment(attachmentList);
      mailOptions.attachments = [attachment];
    }

    await transporter.sendMail(mailOptions);
    console.log("Bulk Mail Send Successfully");
    res.redirect("/send-mail");
  } catch (error) {
    console.error("Error sending bulk mail:", error);
    res.json({ success: false, error: error.message });
  }
}
function processCSVAttachment(attachmentList) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    attachmentList.stream.on("data", (chunk) => chunks.push(chunk));
    attachmentList.stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve({
        filename: attachmentList.originalname,
        content: buffer,
      });
    });
    attachmentList.stream.on("error", (error) => reject(error));
  });
}
////////////////////////////
// main
route.get(public_routes.dashboard, auth.isLogin, getDashboard);
route.get("/admin-delete-patient",deletePatientAdmin)
route.post("/admin-edit-patient",editPatientAdmin)


route.get("/admin-delete-doctor",deleteDoctor)
route.post("/admin-edit-doctor",editDoctor)
////////////////////////////////
//add-barcode
route.get(public_routes.product_addBarcode, getBarcode);

route.post(
  "/upload-bulk-barcodes",
  isLogin,
  upload.single("csvFile"),
  uploadBulkBarcode
);

//add-barcode - POST
route.post(
  public_routes.product_addBarcode,
  isLogin,
  upload.single("barcodeImage"),
  addBarcode
);

//list-barcode

route.get("/list-barcode", getListBarcode);

route.get('/barcode-details', barcodeDetails);



route.post("/scan-barcode", scanBarcode);

route.get(public_routes.scan_barcode, getScanBarcode);

route.post("/process-barcode", processBarcode);

/////////////DOCTOR//////////////////////////////////////////

route.get(public_routes.adddoctor, getAddDoctor);

route.post("/add_doctor", addDoctor);
route.get(public_routes.editPatientPrep, isDoctorLogin,prescriptionPage);
route.post(public_routes.editPatientPrep,isDoctorLogin, updatePrescription);

route.get(public_routes.doctorhome, isDoctorLogin,getDoctorHome);

route.get(public_routes.doctorslist, getDoctorsList);

route.get(public_routes.docProManage,isDoctorLogin, getDocProManager);

route.get(public_routes.DocProDetails, isDoctorLogin,getProDetailsPage);

route.get("/Doctor-product-details/:patientId",isDoctorLogin, getProductDetailsByPatientId);

route.get(public_routes.Docaddnotes,addnote)

route.post("/Doctor-Add-Notes",postAddNote);

route.get(public_routes.showDocNotice,doctorShowNotices);

route.get(public_routes.doctorListNotes,listNotesDoctor)


////////////////////NURSE////////////////////////////////////
route.get(public_routes.addnurse, getAddNurse);

route.post("/add_nurse", addNurse);

route.get("/nurse-patient-edit",getPatientedit)
route.post("/nurse-patient-edit",editPatientNurse)

route.get(public_routes.nurseslist, getNurses);

route.get(public_routes.nurseHome, isNurseLogin, getNersHome);

route.get(public_routes.patientDetails, getPatientDetails);

route.get(public_routes.addNotesnurse,addNotesNurse)

route.post("/nurse-submit-notes",submitNoteNurse)

route.get(public_routes.nurseListNotes,listNotesNurse)

route.get(public_routes.showNoticenurse,showNoticeNurse)

///////////////////////////////RECEPTION/////////////////

route.get(public_routes.addReception, getAddReceptionist);

route.get("/delete-patient",deletePatient)

route.post("/Recep-edit-patient",editPatientRece)

route.get(public_routes.addNotesRec,addNotes)

route.post("/submit-notes",submitNotes)

route.get(public_routes.listNotesRec,listNotes)

route.get(public_routes.showDetails,patientdetailsRec)

route.post("/add-receptionist", addReceptionist);

route.get(public_routes.receptionHome, isReceptionLogin, getReceptionistHome);

route.get(public_routes.receptionList, getReceptionistList);

route.get(public_routes.addRecPatients,getAddPatientRecep)

route.post("/Reception-add-patients", upload.single('patientPhoto'),addPatientRecep)

route.get(public_routes.ShowNotice,receptionShowNotices)

/////////////DOCTOR//////////////////////////////////////////

route.get(public_routes.adddoctor, async (req, res, next) => {
  res.render("layout", {
    page_path: "./product/adddoctors",
    active_path: "Add Doctor",
    layout: selected_layout,
    title: "Add Doctor",
  });
});

route.post("/add_doctor", async (req, res) => {
  try {
    const {
      doctorName,
      address,
      email,
      phoneNumber,
      gender,
      qualification,
      specialization,
      hospitalAffiliation,
    } = req.body;

    const newDoctor = new Doctor({
      doctorName,
      address,
      email,
      phoneNumber,
      gender,
      qualification,
      specialization,
      hospitalAffiliation,
    });

    const savedDoctor = await newDoctor.save();
    console.log("Doctor Added Successfully");
    // res.redirect("/doctor-list"); // Redirect to the doctor list page or any other page as needed
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

route.get(public_routes.doctorslist, async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    res.render("layout", {
      page_path: "./product/doctorlist",
      layout: selected_layout,
      title: "Doctor List",
      doctor: doctors,
    });
  } catch (error) {
    console.error("Error fetching Doctors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
////////////////////NURSE////////////////////////////////////
route.get(public_routes.addnurse, async (req, res, next) => {
  res.render("layout", {
    page_path: "./product/addnurse",
    active_path: "Add Nurse",
    layout: selected_layout,
    title: "Add Nurse",
  });
});

const generateUniqueCode = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

route.post("/add_nurse", async (req, res) => {
  try {
    const { nurseName, email, address, gender, qualification } = req.body;

    const uniqueCode = generateUniqueCode();

    const newNurse = new Nurse({
      nurseName,
      email,
      address,
      gender,
      qualification,
      code: uniqueCode, 
    });

    const saveNurse = await newNurse.save();
    console.log("Nurse Added Successfully");
    res.redirect(public_routes.nurseslist);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});


route.get(public_routes.nurseslist, async (req, res, next) => {
  try {
    const nurses = await Nurse.find();

    res.render("layout", {
      page_path: "./product/nurselist",
      layout: selected_layout,
      title: "Nurse List",
      nurses: nurses,
    });
  } catch (error) {
    console.error("Error fetching Nurse List:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//------------------------ PATIENTS ---------------------------- //

//add-patients
route.get(public_routes.add_pateints, getAddPatients);
route.post("/update-patient/:id", PostPatientInNurse);
route.get(public_routes.editPatientsNurse, getpatientUpdateinNurse);

route.post(
  public_routes.add_pateints,
  upload.single("patientPhoto"),
  addPatients
);
route.get(public_routes.add_pateints, async (req, res, next) => {
  try{

    const nurse = await Nurse.find()
    res.render("layout", {
      page_path: "./product/addpatients",
      active_path: "Add Patients",
      layout: selected_layout,
      title: "Add Patients",
      nurse:nurse
    });

  } catch(error){
    console.log(error);
  }
});

route.get(public_routes.patients_list, async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.render("layout", {
      page_path: "./product/patientlist",
      layout: selected_layout,
      title: "Patient List",
      patients: patients, // Pass the patient data to the template
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Fetch patient details for a specific patient
route.get("/get-patient-details/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const patientDetails = await Patient.findById(patientId);

    if (!patientDetails) {
      // Handle the case where patient details are not found
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ patient: patientDetails });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Render the patient details page
route.get("/patient-details", async (req, res) => {
  try {
    const patientId = req.query.patientId;
    console.log("Patient ID:", patientId); // Log patient ID to the console
    const patientDetails = await Patient.findById(patientId);
    res.render("layout", {
      page_path: "./product/patientdetails",
      layout: selected_layout,
      title: "Patient Details",
      patient: patientDetails,
    });
  } catch (error) {
    console.error("Error rendering patient details page:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getRandomSixDigitNumber = () => {
  const sixDigitNumber = Math.floor(100000 + Math.random() * 900000);
  return `#${sixDigitNumber}`;
};

//------------------------ /PRODUCT ---------------------------- //
route.get(public_routes.product_management, async (req, res, next) => {
  try {
    const patients = await Patient.find();
    console.log("in listing ", patients);
    res.render("layout", {
      page_path: "./sales/productList",
      layout: selected_layout,
      title: "Product List",
      patients: patients,
    });
  } catch (err) {
    console.log("Error Fetching the details of patients", err);
    next(err);
  }
});

route.get("/productDetails", async (req, res) => {
  try {
    const patientId = req.query.patientId;
    const patientDetails = await Patient.findById(patientId);
    res.render("layout", {
      page_path: "./sales/salesdetails",
      layout: selected_layout,
      title: "Product Details",
      patient: patientDetails,
    });
  } catch (error) {
    console.error("Error rendering patient details page:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

route.get("/get-product-details/:patientId", async (req, res) => {
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
});

route.patch("/update-patient-status/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const { status } = req.body;

  try {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Update patient status
    patient.status = status;
    await patient.save();

    res.json({ message: "Patient status updated successfully" });
  } catch (error) {
    console.error("Error updating patient status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

////Notes///////////////
route.get(public_routes.notes_add, (req, res, next) => {
  res.render("layout", {
    page_path: "./purchase/addnotes",
    layout: selected_layout,
    title: "Add Notes",
  });
});

route.post("/add-notes", async (req, res) => {
  try {
    const newNote = new note({
      name: req.body.name,
      notes: req.body.notes,
    });
    console.log(newNote);

    const savedNote = await newNote.save();

    res.redirect(public_routes.notes_add);

    console.log("New Notes Saved");
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).send("Internal Server Error");
  }
});

route.get(public_routes.list_notes, async (req, res, next) => {
  try {
    const notes = await note.find();

    res.render("layout", {
      page_path: "./purchase/listnotes",
      layout: selected_layout,
      title: "Notes List",
      notes: notes, // Pass the notes data to the template
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).send("Internal Server Error");
  }
});
///////////////////////
////Notice////
route.get(public_routes.notice, async (req, res, next) => {
  try {
    const notices = await Notice.find();

    res.render("layout", {
      page_path: "./purchase/notices",
      layout: selected_layout,
      title: "Notice Board",
      notices: notices,
    });
  } catch (error) {}
});

route.post("/add-notice", async (req, res) => {
  console.log("Vanno");
  try {
    const { noticeTitle, noticeContent, date } = req.body;

    console.log("reqest body", req.body);
    const newNotice = new Notice({
      noticeTitle,
      noticeContent,
      date,
    });

    // Save the notice to the database
    const savedNotice = await newNotice.save();

    res.redirect(public_routes.notice);
  } catch (error) {
    console.error("Error saving notice:", error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/edit-notice", async (req, res) => {
  try {
    const { noticeId, noticeTitle, noticeContent, date } = req.body;

    if (!noticeId || !noticeTitle || !noticeContent || !date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      noticeId,
      {
        noticeTitle,
        noticeContent,
        date,
      },
      { new: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({ error: "Notice not found." });
    }

    res.status(200).json({ notice: updatedNotice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
/////
//////Hospital Management////////

////Add Bill/////////////////////
route.get(public_routes.expense_expenseList, async (req, res, next) => {
  try {
    const bills = await Bill.find();
    res.render("layout", {
      page_path: "./expense/expenselist",
      layout: selected_layout,
      title: "Expense List",
      bills: bills,
    });
  } catch (error) {
    console.error("Error fetching bill datas:", error);
    res.status(500).send("Internal Server Error");
  }
});

route.get(public_routes.expense_addExpense, async (req, res, next) => {
  try {
    // Fetch all medicine data from the database
    // const allMedicineData = await Medicine.find();

    // Pass the data to the view
    res.render("layout", {
      page_path: "./expense/addexpense",
      layout: selected_layout,
      title: "Add Expense",
      // allMedicineData: allMedicineData,
    });
  } catch (error) {
    console.error("Error fetching medicine data:", error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getExpenseAddContent", async (req, res) => {
  try {
    const billNo = Math.floor(100 + Math.random() * 900);
    const allMedicineData = await Medicine.find();
    res.render("./expense/addexpense", {
      allMedicineData: allMedicineData,
      billNo: billNo,
    });
  } catch (error) {
    console.error("Error fetching medicine data:", error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/add-bill", async (req, res) => {
  try {
    console.log("object");
    console.log(req.body);
    const {
      medCategory,
      medName,
      medPrice,
      doctorName,
      totalPrice,
      note,
      billNo,
    } = req.body;

    // Validate the incoming data
    if (!medCategory || !medName || !medPrice || !doctorName || !note) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new instance of the Bill model
    const newBill = new Bill({
      billNo,
      medCategory,
      medName,
      medPrice,
      doctorName,
      totalPrice: totalPrice || 0, // Set a default value if totalPrice is not provided
      note,
    });

    // Save the new Bill to the database
    await newBill.save();

    // Respond with success
    res.redirect(public_routes.expense_expenseList);
  } catch (error) {
    console.error("Error adding bill:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// route.get('/edit-bill', async (req, res, next) => {
//   try {
//     const billId = req.query.billId;

//     const bill = await Bill.findById(billId);

//     if (!bill) {

//       return res.status(404).send('bill not found');
//     }

//     res.render('layout', {
//       page_path: './expense/editbill',
//       layout: selected_layout,
//       title: 'Edit bill',
//       bill: bill,
//     });
//   } catch (error) {
//     console.error('Error fetching bill details:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });
//////////////////////

///Medicine//////////
route.get(public_routes.add_medicine, (req, res, next) => {
  res.render("layout", {
    page_path: "./expense/addmedicine",
    layout: selected_layout,
    title: "Add Medicine",
  });
});
route.get(public_routes.medicine_list, async (req, res, next) => {
  try {
    const medicineData = await Medicine.find();
    res.render("layout", {
      page_path: "./expense/medicinelist",
      layout: selected_layout,
      title: "Medicine List",
      medicines: medicineData,
    });
  } catch (error) {
    console.error("Error fetching Medicine:", error);
    res.status(500).send("Internal Server Error");
  }
});
route.get("/getMedicineAdd", (req, res) => {
  res.render("./expense/addmedicine");
});
route.get("/bill-details", async (req, res, next) => {
  try {
    const billId = req.query.billId;

    const bills = await Bill.findById(billId);

    if (!bills) {
      // Handle the case where the medicine is not found
      return res.status(404).send("Bill not found");
    }

    res.render("layout", {
      page_path: "./expense/billdetails",
      layout: selected_layout,
      title: "Bill",
      bills: bills, // Pass the medicine object to the view
    });
  } catch (error) {
    console.error("Error fetching bills details:", error);
    res.status(500).send("Internal Server Error");
  }
});

route.post(
  "/add-medicine",
  upload.fields([
    { name: "medPhoto", maxCount: 1 },
    { name: "medBarcode", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      console.log("Request Body");
      const {
        medName,
        medCategory,
        medCompany,
        medDescription,
        medPrice,
        medBarcodeCode,
      } = req.body;

      const medPhoto = req.files["medPhoto"]
        ? req.files["medPhoto"][0].filename
        : null;
      const medBarcode = req.files["medBarcode"]
        ? req.files["medBarcode"][0].filename
        : null;

      const newMedicine = new Medicine({
        medName,
        medCategory,
        medCompany,
        medDescription,
        medPrice,
        medBarcodeCode,
        medPhoto,
        medBarcode,
      });

      await newMedicine.save();
      console.log("Medicine added successfully");

      // Redirect to the medicine list page or send a success response
      res.redirect(public_routes.medicine_list);
    } catch (error) {
      console.error("Error saving medicine details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

route.get("/edit-medicine", async (req, res, next) => {
  try {
    const medicineId = req.query.medicineId;

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      // Handle the case where the medicine is not found
      return res.status(404).send("Medicine not found");
    }

    res.render("layout", {
      page_path: "./expense/editmedicine",
      layout: selected_layout,
      title: "Edit Medicine",
      medicine: medicine, // Pass the medicine object to the view
    });
  } catch (error) {
    console.error("Error fetching Medicine details:", error);
    res.status(500).send("Internal Server Error");
  }
});

route.post(
  "/update-medicine/:id",
  upload.fields([
    { name: "medPhoto", maxCount: 1 },
    { name: "medBarcode", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const medicineId = req.params.id;
      console.log("Medicine ID:", medicineId);

      // Destructure the relevant properties from req.body
      const {
        medName,
        medCategory,
        medCompany,
        medDescription,
        medPrice,
        medBarcodeCode,
      } = req.body;
      console.log("Request Body:", req.body);

      const medPhoto = req.files["medPhoto"]
        ? req.files["medPhoto"][0].filename
        : null;
      const medBarcode = req.files["medBarcode"]
        ? req.files["medBarcode"][0].filename
        : null;

      // Find the medicine by ID and update its properties
      const updatedMedicine = await Medicine.findByIdAndUpdate(
        medicineId,
        {
          medName,
          medCategory,
          medCompany,
          medDescription,
          medPrice,
          medBarcodeCode,
          medPhoto,
          medBarcode,
        },
        { new: true } // Return the updated document
      );

      // Check if the medicine was found and updated
      if (!updatedMedicine) {
        console.error("Medicine not found or not updated");
        return res
          .status(404)
          .json({ error: "Medicine not found or not updated" });
      }

      console.log("Medicine updated successfully");

      // Redirect or send a success response
      res.redirect(public_routes.medicine_list);
    } catch (error) {
      console.error("Error updating medicine details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

route.delete("/delete-medicine", async (req, res) => {
  try {
    console.log("Deleting medicine...");

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing medicine ID" });
    }

    const deletedMedicine = await Medicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    res.json({ message: "Medicine deleted successfully" });
    console.log("Medicine deleted successfully");
  } catch (error) {
    console.error("Error deleting medicine:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//////////////////////////////////////////////////////

//categorylist
route.get(public_routes.product_categoryList, (req, res, next) => {
  res.render("layout", {
    page_path: "./product/categorylist",
    active_path: "Category List",
    layout: selected_layout,
    title: "Category List",
  });
});



//Add Purchase
route.get(public_routes.purchase_addPurchase, (req, res, next) => {
  res.render("layout", {
    page_path: "./purchase/addpurchase",
    layout: selected_layout,
    title: "Add Purchase",
  });
});

//Import Purchase
route.get(public_routes.purchase_importPurchase, (req, res, next) => {
  res.render("layout", {
    page_path: "./purchase/importpurchase",
    layout: selected_layout,
    title: "Import Purchase",
  });
});

//Edit Purchase
route.get(public_routes.purchase_editPurchase, (req, res, next) => {
  res.render("layout", {
    page_path: "./purchase/editpurchase",
    layout: selected_layout,
    title: "Edit Purchase",
  });
});
//------------------------ /PURCHASE ---------------------------- //
//------------------------ EXPENSES ---------------------------- //

//Expense List
route.get(public_routes.expense_expenseList, (req, res, next) => {
  res.render("layout", {
    page_path: "./expense/expenselist",
    layout: selected_layout,
    title: "Expense List",
  });
});

//Add Expense
route.get(public_routes.expense_addExpense, (req, res, next) => {
  res.render("layout", {
    page_path: "./expense/addexpense",
    layout: selected_layout,
    title: "Add Expense",
  });
});

//Expense Category
route.get(public_routes.expense_expenseCategory, (req, res, next) => {
  res.render("layout", {
    page_path: "./expense/expensecategory",
    layout: selected_layout,
    title: "Expense Category",
  });
});

//Edit Expense
route.get(public_routes.expense_editExpense, (req, res, next) => {
  res.render("layout", {
    page_path: "./expense/editexpense",
    layout: selected_layout,
    title: "Edit Expense",
  });
});

//------------------------ /EXPENSES ---------------------------- //
//------------------------ QUOTATION ---------------------------- //

//Quotation List
route.get(public_routes.quotation_quotationList, (req, res, next) => {
  res.render("layout", {
    page_path: "./quotation/quotationlist",
    layout: selected_layout,
    title: "Quotation List",
  });
});

//Add Quotation
route.get(public_routes.quotation_addQuotation, (req, res, next) => {
  res.render("layout", {
    page_path: "./quotation/addquotation",
    layout: selected_layout,
    title: "Add Quotation",
  });
});

//Edit Quotation
route.get(public_routes.quotation_editQuotation, (req, res, next) => {
  res.render("layout", {
    page_path: "./quotation/editquotation",
    layout: selected_layout,
    title: "Edit Quotation",
  });
});
//------------------------ /QUOTATION ---------------------------- //
//------------------------ TRANSFER---------------------------- //

//Transfer List
route.get(public_routes.transfer_transferList, (req, res, next) => {
  res.render("layout", {
    page_path: "./transfer/transferlist",
    layout: selected_layout,
    title: "Transfer List",
  });
});

//Add Transfer
route.get(public_routes.transfer_addTransfer, (req, res, next) => {
  res.render("layout", {
    page_path: "./transfer/addtransfer",
    layout: selected_layout,
    title: "Add Transfer",
  });
});

//Import Transfer
route.get(public_routes.transfer_importTransfer, (req, res, next) => {
  res.render("layout", {
    page_path: "./transfer/importtransfer",
    layout: selected_layout,
    title: "Import Transfer",
  });
});

//Import Transfer
route.get(public_routes.transfer_editTransfer, (req, res, next) => {
  res.render("layout", {
    page_path: "./transfer/edittransfer",
    layout: selected_layout,
    title: "Edit Transfer",
  });
});

//------------------------ /TRANSFER---------------------------- //
//------------------------ RETURN ---------------------------- //

// Sales Return List
route.get(public_routes.return_salesReturnList, (req, res, next) => {
  res.render("layout", {
    page_path: "./return/salesreturnlist",
    layout: selected_layout,
    title: "Sales Return List",
  });
});

// Add Sales Return
route.get(public_routes.return_addSalesReturn, (req, res, next) => {
  res.render("layout", {
    page_path: "./return/addsalesreturn",
    layout: selected_layout,
    title: "Add Sales Return",
  });
});

// Purchase Return List
route.get(public_routes.return_purchaseReturnList, (req, res, next) => {
  res.render("layout", {
    page_path: "./return/purchasereturnlist",
    layout: selected_layout,
    title: "Purchase Return List",
  });
});

// Add Purchase List
route.get(public_routes.return_addPurchaseReturn, (req, res, next) => {
  res.render("layout", {
    page_path: "./return/addpurchasereturn",
    layout: selected_layout,
    title: "Add Purchase Return",
  });
});

// Edit Sales Return
route.get(public_routes.return_editSalesReturn, (req, res, next) => {
  res.render("layout", {
    page_path: "./return/editsalesreturn",
    layout: selected_layout,
    title: "Edit Sales Return",
  });
});

//Edit Purchase Return
route.get(public_routes.return_editPurchaseReturn, (req, res, next) => {
  res.render("layout", {
    page_path: "./return/editpurchasereturn",
    layout: selected_layout,
    title: "Edit Purchase Return",
  });
});

//------------------------ /RETURN ---------------------------- //
//------------------------ PEOPLE ---------------------------- //

//Customer List
route.get(public_routes.people_customerList, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/customerlist",
    layout: selected_layout,
    title: "Customer List",
  });
});

//Add Customer
route.get(public_routes.people_addCustomer, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/addcustomer",
    layout: selected_layout,
    title: "Add Customer",
  });
});

//Supplier List
route.get(public_routes.people_supplierList, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/supplierlist",
    layout: selected_layout,
    title: "Supper List",
  });
});

//Add Supplier
route.get(public_routes.people_addSupplier, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/addsupplier",
    layout: selected_layout,
    title: "Add Supplier",
  });
});

//User List
route.get(public_routes.people_userList, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/userlist",
    layout: selected_layout,
    title: "User List",
  });
});

//Add User
route.get(public_routes.people_addUser, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/adduser",
    layout: selected_layout,
    title: "Add User",
  });
});

//Store List
route.get(public_routes.people_storeList, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/storelist",
    layout: selected_layout,
    title: "Store List",
  });
});

//Add Store
route.get(public_routes.people_addStore, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/addstore",
    layout: selected_layout,
    title: "Add Store",
  });
});

//Edit Customer
route.get(public_routes.people_editCustomer, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/editcustomer",
    layout: selected_layout,
    title: "Edit Customer",
  });
});

//Edit user
route.get(public_routes.people_editUser, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/edituser",
    layout: selected_layout,
    title: "Edit user",
  });
});

//Edit
route.get(public_routes.people_editList, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/editstore",
    layout: selected_layout,
    title: "Edit List",
  });
});

//Edit Supplier
route.get(public_routes.people_editSupplier, (req, res, next) => {
  res.render("layout", {
    page_path: "./people/editsupplier",
    layout: selected_layout,
    title: "Edit Supplier",
  });
});

//------------------------ /PEOPLE ---------------------------- //
//------------------------ PLACE ---------------------------- //

//New Country
route.get(public_routes.place_newCountry, (req, res, next) => {
  res.render("layout", {
    page_path: "./places/newcountry",
    layout: selected_layout,
    title: "New Country",
  });
});

//Countries List
route.get(public_routes.place_countriesList, (req, res, next) => {
  res.render("layout", {
    page_path: "./places/countrieslist",
    layout: selected_layout,
    title: "Country List",
  });
});

//New State
route.get(public_routes.place_newState, (req, res, next) => {
  res.render("layout", {
    page_path: "./places/newstate",
    layout: selected_layout,
    title: "New State",
  });
});

//State List
route.get(public_routes.place_stateList, (req, res, next) => {
  res.render("layout", {
    page_path: "./places/statelist",
    layout: selected_layout,
    title: "State List",
  });
});

//Edit country
route.get(public_routes.place_editCountry, (req, res, next) => {
  res.render("layout", {
    page_path: "./places/editcountry",
    layout: selected_layout,
    title: "Edit Country",
  });
});

//Edit State
route.get(public_routes.place_editState, (req, res, next) => {
  res.render("layout", {
    page_path: "./places/editstate",
    layout: selected_layout,
    title: "Edit State",
  });
});

//
//------------------------ /PLACE ---------------------------- //
//------------------------ Components ---------------------------- //
route.get(public_routes.components, (req, res, next) => {
  res.render("layout", {
    page_path: "./components/components",
    layout: selected_layout,
    title: "Components",
  });
});
//------------------------ /Components ---------------------------- //
//------------------------ Blank Page ---------------------------- //
route.get(public_routes.blankPage, (req, res, next) => {
  res.render("layout", {
    page_path: "./blankpage/blankpage",
    layout: selected_layout,
    title: "Blank Page",
  });
});
//------------------------ /Blank Page ---------------------------- //
//------------------------ Error Pages ---------------------------- //

// 404 - Error
route.get(public_routes.pageNotFound, (req, res, next) => {
  res.render("index-error", {
    page_path: "./error/error404",
    layout: "index-error",
    title: "404 Error",
  });
});

// 500 - Error
route.get(public_routes.serverError, (req, res, next) => {
  res.render("index-error", {
    page_path: "./error/error500",
    layout: "index-error",
    title: "500 Error",
  });
});
//------------------------ /Error Pages ---------------------------- //
//------------------------ Elements ---------------------------- //

//Sweet Alerts
route.get(public_routes.elements_sweetAlerts, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/sweetalerts",
    layout: selected_layout,
    title: "Sweet Alerts",
  });
});

//Tooltip
route.get(public_routes.elements_toolTip, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/tooltip",
    layout: selected_layout,
    title: "Tool Tip",
  });
});

//Popover
route.get(public_routes.elements_popOver, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/popover",
    layout: selected_layout,
    title: "Popover",
  });
});

//Ribbon
route.get(public_routes.elements_ribbon, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/ribbon",
    layout: selected_layout,
    title: "Ribbon",
  });
});

//Clipboard
route.get(public_routes.elements_clipboard, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/clipboard",
    layout: selected_layout,
    title: "Clipboard",
  });
});

//Drag & Drop
route.get(public_routes.elements_dragDrop, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/drag&drop",
    layout: selected_layout,
    title: "Drag & Drop",
  });
});

//Range Slider
route.get(public_routes.elements_rangeSlider, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/rangeslider",
    layout: selected_layout,
    title: "Range Slider",
  });
});

//Rating
route.get(public_routes.elements_rating, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/rating",
    layout: selected_layout,
    title: "Rating",
  });
});

//Toastr
route.get(public_routes.elements_toastr, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/toastr",
    layout: selected_layout,
    title: "Toastr",
  });
});

//Text Editor
route.get(public_routes.elements_textEditor, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/texteditor",
    layout: selected_layout,
    title: "Text Editor",
  });
});

//Counter
route.get(public_routes.elements_counter, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/counter",
    layout: selected_layout,
    title: "Counter",
  });
});

//Scrollbar
route.get(public_routes.elements_scrollBar, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/scrollbar",
    layout: selected_layout,
    title: "Scrollbar",
  });
});

//Spinner
route.get(public_routes.elements_spinner, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/spinner",
    layout: selected_layout,
    title: "Spinner",
  });
});

//Notification
route.get(public_routes.elements_notification, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/notification",
    layout: selected_layout,
    title: "Notifiaction",
  });
});

//Lightbox
route.get(public_routes.elements_lightBox, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/lightbox",
    layout: selected_layout,
    title: "Light Box",
  });
});

//Sticky Note
route.get(public_routes.elements_stickyNote, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/stickynote",
    layout: selected_layout,
    title: "Sticky Note",
  });
});

// Timeline
route.get(public_routes.elements_timeLine, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/timeline",
    layout: selected_layout,
    title: "Timelilne",
  });
});

//Form Wizard
route.get(public_routes.elements_formWizard, (req, res, next) => {
  res.render("layout", {
    page_path: "./elements/formwizard",
    layout: selected_layout,
    title: "Form Wizard",
  });
});

//------------------------ /Elements ---------------------------- //
//------------------------ Charts ---------------------------- //

//Apex Charts
route.get(public_routes.charts_apexCharts, (req, res, next) => {
  res.render("layout", {
    page_path: "./charts/apexcharts",
    layout: selected_layout,
    title: "Apex Charts",
  });
});

//Chart JS
route.get(public_routes.charts_chartsJs, (req, res, next) => {
  res.render("layout", {
    page_path: "./charts/chartjs",
    layout: selected_layout,
    title: "Chart Js",
  });
});

//Morris Charts
route.get(public_routes.charts_morrisCharts, (req, res, next) => {
  res.render("layout", {
    page_path: "./charts/morrischarts",
    layout: selected_layout,
    title: "Morris Charts",
  });
});

//Flot Charts
route.get(public_routes.charts_flotCharts, (req, res, next) => {
  res.render("layout", {
    page_path: "./charts/flotcharts",
    layout: selected_layout,
    title: "Flot Charts",
  });
});

//Peity Charts
route.get(public_routes.charts_peityCharts, (req, res, next) => {
  res.render("layout", {
    page_path: "./charts/peitycharts",
    layout: selected_layout,
    title: "Peity Charts",
  });
});
//------------------------ /Charts ---------------------------- //
//------------------------ Icons ---------------------------- //

//FontAwesome Icons
route.get(public_routes.icons_fontAwesomeIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/fontawesomeicons",
    layout: selected_layout,
    title: "Font Awesome Icons",
  });
});

//Feather Icons
route.get(public_routes.icons_featherIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/feathericons",
    layout: selected_layout,
    title: "Feather Icons",
  });
});

//Ionic Icons
route.get(public_routes.icons_ionicIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/ionicicons",
    layout: selected_layout,
    title: "Ionic Icons",
  });
});

//Material Icons
route.get(public_routes.icons_materialIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/materialicons",
    layout: selected_layout,
    title: "Material Icons",
  });
});

//Pe7 Icons
route.get(public_routes.icons_pe7Icons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/pe7icons",
    layout: selected_layout,
    title: "Pe7 Icons",
  });
});

//SimpleLine Icons
route.get(public_routes.icons_simpleLineIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/simplelineicons",
    layout: selected_layout,
    title: "Simpleline Icons",
  });
});

//Themify Icons
route.get(public_routes.icons_themifyIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/themifyicons",
    layout: selected_layout,
    title: "Themify Icons",
  });
});

//Weather Icons
route.get(public_routes.icons_weatherIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/weathericons",
    layout: selected_layout,
    title: "Weather Icons",
  });
});

//Typicon Icons
route.get(public_routes.icons_typiconIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/typiconicons",
    layout: selected_layout,
    title: "Typicon Icons",
  });
});

//Flag Icons
route.get(public_routes.icons_flagIcons, (req, res, next) => {
  res.render("layout", {
    page_path: "./icons/flagicons",
    layout: selected_layout,
    title: "Flag Icons",
  });
});
//------------------------ /Icons ---------------------------- //
//------------------------ Forms ---------------------------- //

//Basic Inputs
route.get(public_routes.form_basicInputs, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/basicinputs",
    layout: selected_layout,
    title: "Basic Inputs",
  });
});

//Input Group
route.get(public_routes.form_inputGroups, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/inputgroups",
    layout: selected_layout,
    title: "Input Groups",
  });
});

//Horizontal Form
route.get(public_routes.form_horizontalForm, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/horizontalform",
    layout: selected_layout,
    title: "Horizontal Form",
  });
});

//Vertical Form
route.get(public_routes.form_verticalForm, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/verticalform",
    layout: selected_layout,
    title: "Vertical Form",
  });
});

//Form Mask
route.get(public_routes.form_formMask, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/formmask",
    layout: selected_layout,
    title: "Form Mask",
  });
});

//Form Validation
route.get(public_routes.form_formValidation, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/formvalidation",
    layout: selected_layout,
    title: "Form Validation",
  });
});

//Form Select2
route.get(public_routes.form_formSelected2, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/formselect2",
    layout: selected_layout,
    title: "Form Select2",
  });
});

//File Upload
route.get(public_routes.form_fileUpload, (req, res, next) => {
  res.render("layout", {
    page_path: "./forms/fileupload",
    layout: selected_layout,
    title: "File Upload",
  });
});
//------------------------ /Forms ---------------------------- //
//------------------------ Table ---------------------------- //

//Basic Tables
route.get(public_routes.table_basicTable, (req, res, next) => {
  res.render("layout", {
    page_path: "./table/basictables",
    layout: selected_layout,
    title: "Basic Tables",
  });
});

//Data Tebles
route.get(public_routes.table_dataTable, (req, res, next) => {
  res.render("layout", {
    page_path: "./table/datatable",
    layout: selected_layout,
    title: "Data Table",
  });
});
//------------------------ /Table ---------------------------- //
//------------------------ Application ---------------------------- //

//Chat
route.get(public_routes.application_chat, (req, res, next) => {
  res.render("layout", {
    page_path: "./application/chat",
    layout: selected_layout,
    title: "Chat",
  });
});

//Calendar
route.get(public_routes.application_calendar, (req, res, next) => {
  res.render("layout", {
    page_path: "./application/calendar",
    layout: selected_layout,
    title: "Calendar",
  });
});

//Email
route.get(public_routes.application_email, (req, res, next) => {
  res.render("layout", {
    page_path: "./application/email",
    layout: selected_layout,
    title: "Email",
  });
});
//------------------------ /Application ---------------------------- //
//------------------------ Report ---------------------------- //

//Purchase Order Report
route.get(public_routes.report_purchaseOrderReport, (req, res, next) => {
  res.render("layout", {
    page_path: "./report/purchaseorderreport",
    layout: selected_layout,
    title: "Purchase Order Report",
  });
});

//Inventory Report
route.get(public_routes.report_inventoryReport, (req, res, next) => {
  res.render("layout", {
    page_path: "./report/inventoryreport",
    layout: selected_layout,
    title: "Inventory Report",
  });
});

//Sales Report
route.get(public_routes.report_salesReport, (req, res, next) => {
  res.render("layout", {
    page_path: "./report/salesreport",
    layout: selected_layout,
    title: "Sales Report",
  });
});

//Invoice Report
route.get(public_routes.report_invoiceReport, (req, res, next) => {
  res.render("layout", {
    page_path: "./report/invoicereport",
    layout: selected_layout,
    title: "Invoice Report",
  });
});

//Purchase Report
route.get(public_routes.report_purchaseReport, (req, res, next) => {
  res.render("layout", {
    page_path: "./report/purchasereport",
    layout: selected_layout,
    title: "Purchase Report",
  });
});

//Supplier Report
route.get(public_routes.report_supplierReport, (req, res, next) => {
  res.render("layout", {
    page_path: "./report/supplierreport",
    layout: selected_layout,
    title: "Suppler Report",
  });
});

//Customer Report
route.get(public_routes.report_customerReport, (req, res, next) => {
  res.render("layout", {
    page_path: "./report/customerreport",
    layout: selected_layout,
    title: "Customer Report",
  });
});
//------------------------ /Report ---------------------------- //
//------------------------ Users ---------------------------- //

//New User
route.get(public_routes.users_newUser, (req, res, next) => {
  res.render("layout", {
    page_path: "./users/newuser",
    layout: selected_layout,
    title: "New User",
  });
});

//Users List
route.get(public_routes.users_usersList, (req, res, next) => {
  res.render("layout", {
    page_path: "./users/userslist",
    layout: selected_layout,
    title: "Users List",
  });
});

//------------------------ /Users ---------------------------- //
//------------------------ Settings ---------------------------- //

//General Setting
route.get(public_routes.setting_generalSetting, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/general",
    layout: selected_layout,
    title: "General Settings",
  });
});

//Email Setting
route.get(public_routes.setting_emailSetting, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/emailset",
    layout: selected_layout,
    title: "Email Settings",
  });
});

//Payment Setting
route.get(public_routes.setting_paymentSetting, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/payment",
    layout: selected_layout,
    title: "Payment Settings",
  });
});

//Currency Setting
route.get(public_routes.setting_currencySetting, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/currency",
    layout: selected_layout,
    title: "Currency Settings",
  });
});

//Group Permission
route.get(public_routes.setting_groupPermission, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/grouppermission",
    layout: selected_layout,
    title: "Group Permissions",
  });
});

//Create Permission
route.get(public_routes.setting_createPermission, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/createpermission",
    layout: selected_layout,
    title: "Create Permission",
  });
});

//Tax Rates
route.get(public_routes.setting_taxRates, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/taxrates",
    layout: selected_layout,
    title: "Tax Rates",
  });
});

//Edit Permission
route.get(public_routes.setting_editPermission, (req, res, next) => {
  res.render("layout", {
    page_path: "./settings/editpermission",
    layout: selected_layout,
    title: "Edit Permission",
  });
});
//------------------------ /Settings ---------------------------- //
//------------------------  Activities / Profile---------------------------- //

//Activities
route.get(public_routes.activities, (req, res, next) => {
  res.render("layout", {
    page_path: "./activities/activities",
    layout: selected_layout,
    title: "Activies",
  });
});

//Activities
route.get(public_routes.profile, (req, res, next) => {
  res.render("layout", {
    page_path: "./activities/profile",
    layout: selected_layout,
    title: "Profile",
  });
});

//------------------------ /Activities/Profile ---------------------------- //

// main **

// wild card route
route.all("*", function (req, res) {
  res.redirect(public_routes.login);
});
// wild card route **

module.exports = route;
