const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// View Engine Setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// import routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(session({
  secret: process.env.SESSION_SECRET || "parkease_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false}
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/html", express.static(path.join(__dirname, "html")));
app.use(express.static(path.join(__dirname, "public")));
// routes
app.use("/", authRoutes);
app.use("/", vehicleRoutes);
app.use("/", serviceRoutes);
app.use("/", reportRoutes);

// Default route
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "html", "index.html"));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ParkEase server running on http://localhost:${PORT}`);
});