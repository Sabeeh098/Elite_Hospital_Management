const genPass = require("../config/bcript");
const Admin = require("../model/admin");
const Doctor = require("../model/doctorModel");
const Nurse = require("../model/nurseModel");
const Receptionist = require("../model/receptionist");

const login = {
    doLogin:async(req,res)=>{
        try {
            console.log("ivide veruundo");
            const { email, password, role } = req.body;
            console.log(req.body);
            if (role === "admin") {
                // const checkPassword = await genPass.compairePass(password)
              const existingAdmin = await Admin.findOne({ email });
              if (!existingAdmin || password !== existingAdmin.password) {
                return res.status(401).send("Invalid credentials");
              }
              req.session.role = role;
              console.log(req.session, "====================");
              res.redirect("/dashboard");
            } else if (role === "doctor") {
                const doctor = await Doctor.findOne({ email });
                const checkPassword = await genPass.compairePass(password,doctor.password)
                console.log(checkPassword,"ithano");
              if (!doctor || !checkPassword) {
                return res.status(401).send("Invalid credentials");
              }
              req.session.role = role
              req.session.doctorId = doctor._id
              console.log(req.session.role, "====================");
             res.redirect('/doctorhome')
            }else if (role === "nurse") {
              const nurse = await Nurse.findOne({ email });
              const checkPassword = await genPass.compairePass(password,nurse.password)
              if (!nurse || !checkPassword) {
                console.log(nurse,"dfgh");
                return res.status(401).send("Invalid credentials");
              }
              req.session.role = role
              req.session.nurseId = nurse._id 
              res.redirect("/nurseHome")
            }else if (role === "receptionist") {
              const receptionist = await Receptionist.findOne({ email });
              const checkPassword = await genPass.compairePass(password,receptionist.password)

              if (!receptionist || !checkPassword ) {
                console.log(receptionist);
                return res.status(401).send("Invalid credentials");
              }
              req.session.role = role
              req.session.receptionistId = receptionist._id
              res.redirect("/receptionHome")
            }
          } catch (error) {
            console.error("Error logging in:", error.message);
            res.status(500).send("Internal Server Error");
          }
    },

    logout: async(req,res)=>{
        try {
            req.session.role = null
            res.redirect('/')
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = login;