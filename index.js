var express = require("express");
var app = express();
var bodyParser = require("body-parser");
// var multer = require("multer");
// var upload = multer();
// var session = require("express-session");
var cookieParser = require("cookie-parser");
const crypto = require("crypto");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(upload.array());
// app.use(session({ secret: "Your secret key" }));

// mongo
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test");
let User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  })
);
// end

// sessions
const sesions = require("client-sessions");
app.use(
  sessions({
    cookieName: "session",
    secret: "mfwjfwfnwfn", //dont upload online
    duration: 30 * 60 * 1000
  })
);
// end

// const users = [
//   {
//     name: "John Doe",
//     email: "johndoe@email.com",
//     password: "XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg="
//   }
// ];

// // get the hashed passcode
// const getHashedPassword = password => {
//   const sha256 = crypto.createHash("sha256");
//   const hash = sha256.update(password).digest("base64");
//   return hash;
// };

// const generateAuthToken = () => {
//   return crypto.randomBytes(30).toString("hex");
// };

app.get("/", (req, res) => {
  res.send("home");
});
app.get("/protected", (req, res) => {
  if (!(req.session && req.session.userId)) {
    // forbidden
    res.send(600);
  } else {
    User.findById(req.session.userId, (error, user) => {
      if (error || !user) {
        res.send(600);
      } else {
        res.send(user, "some protected data");
      }
    });
  }
});

app.post("/signup", (req, res) => {
  let user = new User(req.body);

  user.save(error => {
    if (error) {
      if (error.code === 11000) {
        console.log("email not unique");
        res.send("use a unique email");
      } else {
        console.log("error in post: signup");
        res.sendStatus(500);
      }
    } else {
      // no error occured
      res.send("secret data");
    }
  });
  //   // // no mongo example
  //     if (email && name && password) {
  //       if (users.find(user => user.email === email)) {
  //         res.send("already registered");
  //       } else {
  //         const hash = getHashedPassword(password);
  //         users.push({
  //           name,
  //           email,
  //           password: hash
  //       });
  //       res.send("Signed up");
  //     }
  //   } else {
  //     console.log("data missing!");
  //     res.sendStatus(400);
  //   }
});

app.post("/signin", (req, res) => {
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error || !user || req.body.password !== user.password) {
      res.send("username/pass incorrect");
    } else {
      req.session.userId = user._id; // storing the session object
      //   dont store email or password
      // cookies are encrypted
      res.send("secret data");
    }
  });
  // // // // for local user object
  //   const { email, password } = req.body;
  //   if (email && password) {
  //     const hashedPassword = getHashedPassword(password);
  //     const user = users.find(u => {
  //       return u.email === email && hashedPassword === u.password;
  //     });

  //     if (user) {
  //       const authToken = generateAuthToken();
  //       authTokens[authToken] = user;
  //       res.cookie("AuthToken", authToken);
  //       res.send("some protected data");
  //     } else {
  //       res.send("not accessable");
  //     }
  //   } else {
  //     console.log("data missing!");
  //     res.sendStatus(400);
  //   }
});

app.listen(5000, () => {
  console.log("server started at port 5000");
});
