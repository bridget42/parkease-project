const express = require("express");
// const path = require("path");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

// Login page
router.get("/", (req, res) => {
  res.render("index", { title: "Login" });
});

// Handle Login with role-based redirect
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      console.log("Login failed");
      return res.redirect("/");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      // keep your session logic
      req.session.user = {
        id: user._id,
        username: user.username,
        role: user.role
      };

      console.log("LOGIN SUCCESS:", user.username);

      // 🔥 CRITICAL FIX (this is what you were missing)
      req.session.save(() => {
        if (user.role === "admin") return res.redirect("/admin-dashboard");
        if (user.role === "manager") return res.redirect("/manager-dashboard");
        if (user.role === "attendant") return res.redirect("/attendant-dashboard");

        return res.redirect("/dashboard");
      });
    });
  })(req, res, next);
});

//signu route
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// Show Sign Up page
router.post("/signup", (req, res) => {
  const { username, password, role } = req.body;
  const newUser = new User({ username, role });

  process.nextTick(() => {
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.error("Signup error:", err);
        return res.status(500).send(err.message);
      }

    console.log("USER CREATED:", user.username);

    // OPTIONAL: auto login after signup (improves UX)
    req.logIn(user, (err) => {
      if (err) {
        console.error("Auto login error:", err);
        return res.redirect("/");
      }

      req.session.user = user;

      req.session.save(() => {
        return res.redirect("/admin-reports");
      });
    });
  });
  });
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
