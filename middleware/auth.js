const auth = {
    isLogin: async(req,res,next)=>{
        try {
            if(req.session.role === "admin"){
                next()
            }else{
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error.message);
        }
    },

    isLogout: async(req,res,next)=>{
        try {
            if(req.session.role === "admin"){
                res.redirect('/')
            }else{
                next()
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    isNurseLogin: async(req,res,next)=>{
        try {
            if(req.session.role === "nurse"){
                next()
            }else{
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    isNurseLogout: async(req,res,next)=>{
        try {
            if(req.session.role === "nurse"){
                res.redirect('/nurseHome')
            }else{
                next()
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    isReceptionLogin: async(req,res,next) => {
        try {
            if(req.session.role === "receptionist"){
                next()
            }else{
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    isReceptionLogout: async (req,res,next) => {
        try {
            if(req.session.role === "receptionist"){
                res.redirect("/receptionHome")
            }else{
                next()
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    isDoctorLogin: async(req,res,next)=>{
        try {
            if(req.session.role === "doctor"){
                next()
            }else{
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    isDoctorLogout: async(req,res,next)=>{
        try {
            if(req.session.role === "doctor"){
                res.redirect('/doctor')
            }else{
                next()
            }
        } catch (error) {
            console.log(error.message);
        }
    },
}

module.exports = auth