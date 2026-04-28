const express = require("express");
// const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

// Login page
router.get("/", (req, res) => {
  res.render("index", { title: "Login" });
});

// Handle Login with role-based redirect
router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Store user info in session
      req.session.user = {
        id: user._id,
        username: user.username,
        role: user.role
      };
      // Role-based redirect
      switch (user.role) {
        case "admin":
          return res.redirect("/admin-dashboard");
        case "manager":
          return res.redirect("/manager-dashboard");
        case "attendant":
          return res.redirect("/attendant-dashboard");
      }
    });
  })(req, res, next);
});

// Show Sign Up page
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// Handle Sign Up
router.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, role } = req.body;
    const newUser = new User({ username, role });
    await User.register(newUser, password);

    res.redirect("/admin-reports");
  } catch (error) {
    console.error(error);
    res.send("Not able to send user to the database");
  }
});

// Handle Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", username);
    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found");
      return res.send("Invalid username or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Wrong password");
      return res.send("Invalid username or password");
    }
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };
    console.log("Login success:", user.username);
    req.session.save((err) => {
      if (err) {
        console.error("Session save failed:", err);
        return res.status(500).send("Session error");
      }
      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Server error during login");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Current logged-in user
router.get("/api/current-user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  res.json(req.session.user);
});

module.exports = router;
