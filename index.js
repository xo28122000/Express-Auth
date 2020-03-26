var express = require("express");
var app = express();
var bodyParser = require("body-parser");
// var multer = require("multer");
// var upload = multer();
// var session = require("express-session");
var cookieParser = require("cookie-parser");

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
const sessions = require("client-sessions");
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

// get the hashed passcode
const bcrypt = require("bcryptjs");
const getHashedPassword = password => {
  const hash = bcrypt.hashSync(password, 14);
  return hash;
};

// const crypto = require("crypto");
// const generateAuthToken = () => {
//   return crypto.randomBytes(30).toString("hex");
// };

app.get("/", (req, res) => {
  res.send("home");
});
app.get("/protected", (req, res) => {
  if (!(req.session && req.session.userId)) {
    // forbidden
    console.log("came here ");
    res.sendStatus(500);
  } else {
    User.findById(req.session.userId, (error, user) => {
      if (error || !user) {
        console.log("came here 2");
        res.sendStatus(500);
      } else {
        res.send(user);
      }
    });
  }
});

app.post("/signup", (req, res) => {
  req.body.password = getHashedPassword(req.body.password);
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
      res.redirect("/protected");
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
    if (
      error ||
      !user ||
      !bcrypt.compareSync(req.body.password, user.password)
    ) {
      res.send("username/pass incorrect");
    } else {
      req.session.userId = user._id; // storing the session object
      //   dont store email or password
      // cookies are encrypted
      res.redirect("/protected");
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
