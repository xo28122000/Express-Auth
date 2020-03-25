var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();
var session = require("express-session");
var cookieParser = require("cookie-parser");
const crypto = require("crypto");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(upload.array());
app.use(cookieParser());
// app.use(session({ secret: "Your secret key" }));

const users = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@email.com",
    password: "XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg="
  }
];

// get the hashed passcode
const getHashedPassword = password => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("base64");
  return hash;
};

app.get("/", (req, res) => {});

app.post("/signup", (req, res) => {
  console.log("came here");
  res.send("workings");
});

app.listen(5000, () => {
  console.log("server started at port 5000");
});
