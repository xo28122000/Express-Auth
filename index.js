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
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true, // no js ccan access cookie
    secure: true, // only set cookie over https
    ephermeral: true // destroy cookie when browser closes
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

// CSRF protection
// this is cross site reference forgery
// example: if i sign in my token is created and send back,
// now if i go to some other site and that site sends a request to my server
// then it would still be sent with a secure cookie and hence would gain access to any
// info as necessary
// so all pages with form should be rendered as following
const csurf = require("csurf");
app.use(csurf());

app.get("/somepagewithform", (req, res) => {
  res.render("", { csurfToken: req.csrfToken });
});
// end

// helmet
const helmet = require("helmet");
app.use(helmet());
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

app.get("/protected", loginRequired, (req, res) => {
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
