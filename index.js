const express = require("express");
const app = express();
const path = require("path");
const route = require("./Routes/routes");
const ejs = require("ejs").__express;
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nocache = require('nocache');
const connectDB = require("./config/db");

dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));
app.engine("ejs", ejs);

app.set("layout", "layout");

app.use(express.static(__dirname + "/public"));

connectDB()
 
app.use(cookieParser());
app.use(session({
    secret:"sessionSecretKey",
    saveUninitialized:true,
    resave:false,
    cookie:{
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}));
app.use(nocache());

app.use("/", route);

// For deployment use
// https
//   .createServer(
//     {
//       key: fs.readFileSync("sslcert/ssl.key"),
//       cert: fs.readFileSync("sslcert/ssl.cert"),
//     },
//     app
//   )
//   .listen(PORT, function () {
//     console.log(
//       "Server is up and running on port number " + PORT + " for Https"
//     );
//   });

// // For Development use
const http = require("http").createServer(app);
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
