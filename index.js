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
    name: "John Doe",
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

app.get("/", (req, res) => {
  res.render("<HTML><body>hi!</body></HTML>");
});

app.post("/signup", (req, res) => {
  console.log(req.body);
  const { email, name, password } = req.body;
  if (email & name & password) {
    if (users.find(user => user.email === email)) {
      res.send("already registered");
    } else {
      const hash = getHashedPassword(password);
      users.push({
        name,
        email,
        password: hash
      });
      res.send("Signed up");
    }
  } else {
    console.log("data missing!");
    res.sendStatus(400);
  }
  console.log(users);
});

app.listen(5000, () => {
  console.log("server started at port 5000");
});
