const session = require("express-session");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require("./routes/admin.js");
const apiRoutes = require("./routes/api.js");

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);

app.use(express.static(path.resolve("./public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure CORS to allow only requests from your frontend's origin
const allowedOrigin = 'https://rongotaan.onrender.com'; // Use env variable

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server or mobile apps)
    if (!origin) return callback(null, true);

    console.log(origin)

    // Check if the incoming origin matches your allowed origin
    if (allowedOrigin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./views/index.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.resolve("./views/register.html"));
});

app.get("/register-success", (req, res) => {
  res.sendFile(path.resolve("./views/register_success.html"));
});

app.get("/registration-failed", (req, res) => {
  res.sendFile(path.resolve("./views/error.html"));
});

app.get("/rate-exceeded", (req, res) => {
  res.sendFile(path.resolve("./views/rate-limit.html"));
});

app.use("/admin", adminRoutes);
app.use("/api", apiRoutes);

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.resolve("./views/admin/tokens.html"));
  } else {
    res.sendFile(path.resolve("./views/admin/login.html"));
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.user = { username: process.env.ADMIN_USERNAME };
    res.redirect("/admin");
  } else {
    res.redirect("/login?success=false");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("*", function (req, res) {
  res.status(404).sendFile(path.resolve("./views/404.html"));
});

app.listen(5000, () => console.log('Server started on http://localhost:5000/'));