var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

// hashed passcode
const bcrypt = require("bcryptjs");
const getHashedPassword = password => {
  const hash = bcrypt.hashSync(password, 14);
  return hash;
};

// const crypto = require("crypto");
// const generateAuthToken = () => {
//   return crypto.randomBytes(30).toString("hex");
// };

// middleware
app.use((req, res, next) => {
  if (!(req.sesssion && req.session.userId)) {
    return next();
  }

  User.findById(req.session.userId, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next();
    }
    user.password = undefined;

    req.user = user;

    next();
  });
});
// end

app.get("/", (req, res) => {
  res.send("home");
});

function loginRequired(req, res, next) {
  if (!req.user) {
    returnres.send("please log in firsr");
  }
  next();
}

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
});

app.listen(5000, () => {
  console.log("server started at port 5000");
});
