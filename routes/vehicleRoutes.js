const express = require("express");
const path = require("path");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { isStaff } = require("../middleware/auth");
const calculateFee = require("../utils/calculateFee");

const router = express.Router();

// Helper function to get dashboard URL based on role
function getDashboardUrl(role) {
  switch (role) {
    case "admin":
      return "/admin-dashboard";
    case "manager":
      return "/manager-dashboard";
    case "attendant":
      return "/attendant-dashboard";
    default:
      return "/dashboard";
  }
}

// Generate unique receipt number
function generateReceiptNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PE${timestamp}${random}`;
}

// Validate plate number (must start with U, alphanumeric, max 6 chars)
function isValidPlateNumber(plate) {
  const plateRegex = /^U[A-Z0-9]{1,5}$/i;
  return plateRegex.test(plate);
}

// Validate Ugandan phone number
function isValidPhoneNumber(phone) {
  const phoneRegex = /^(\+256|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate name (must start with capital, no numbers)
function isValidName(name) {
  const nameRegex = /^[A-Z][a-zA-Z\s]*$/;
  return nameRegex.test(name);
}

// Dashboard page
router.get("/dashboard", isStaff, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    const payments = await Payment.find().sort({ paymentDate: -1 });
    
    const parkedCount = vehicles.filter(v => v.status === "parked").length;
    const signedOutCount = vehicles.filter(v => v.status === "signed-out").length;
    
    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => new Date(p.paymentDate) >= today);
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    // Get recent vehicles (last 5)
    const recentVehicles = vehicles.slice(0, 5);

    // Send dashboard HTML with data
    res.render("dashboard", {
      title: "Dashboard",
      parkedCount,
      signedOutCount,
      todayRevenue,
      totalVehicles: vehicles.length,
      recentVehicles,
      vehicles: vehicles.filter(v => v.status === "parked"),
      user: req.session.user
    });

  } catch (error) {
    console.log("Session user:", req.session.user);
    console.error(error);
    res.send("Error loading dashboard");
  }
});

// Admin Dashboard
router.get("/admin-dashboard", isStaff, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    const payments = await Payment.find().sort({ paymentDate: -1 });
    const users = await User.find();
    
    const parkedCount = vehicles.filter(v => v.status === "parked").length;
    const signedOutCount = vehicles.filter(v => v.status === "signed-out").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => new Date(p.paymentDate) >= today);
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    res.render("admin-dashboard", {
      title: "Admin Dashboard",
      parkedCount,
      signedOutCount,
      todayRevenue,
      totalVehicles: users.length,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.send("Error loading admin dashboard");
  }
});

// Manager Dashboard
router.get("/manager-dashboard", isStaff, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    const payments = await Payment.find().sort({ paymentDate: -1 });
    
    const parkedCount = vehicles.filter(v => v.status === "parked").length;
    const signedOutCount = vehicles.filter(v => v.status === "signed-out").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => new Date(p.paymentDate) >= today);
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    res.render("manager-dashboard", {
      title: "Manager Dashboard",
      parkedCount,
      signedOutCount,
      todayRevenue,
      totalVehicles: vehicles.length,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.send("Error loading manager dashboard");
  }
});

// Attendant Dashboard
router.get("/attendant-dashboard", isStaff, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    const payments = await Payment.find().sort({ paymentDate: -1 });
    
    const parkedCount = vehicles.filter(v => v.status === "parked").length;
    const signedOutCount = vehicles.filter(v => v.status === "signed-out").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => new Date(p.paymentDate) >= today);
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    res.render("attendant-dashboard", {
      title: "Attendant Dashboard",
      parkedCount,
      signedOutCount,
      todayRevenue,
      totalVehicles: vehicles.length,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.send("Error loading attendant dashboard");
  }
});

router.get("/register-vehicle", isStaff, (req, res) => {
  res.render("vehicle-registration", { title: "Register Vehicle" });
});

// Register vehicle (POST)
router.post("/register-vehicle", isStaff, async (req, res) => {
  try {
    const {
      plateNumber,
      vehicleType,
      driverName,
      phoneNumber,
      parkingSlot,
      entryTime,
      modelColor,
      ninNumber
    } = req.body;

    // Validate required fields
    if (!plateNumber || !vehicleType || !driverName || !phoneNumber || !parkingSlot || !entryTime) {
      return res.status(400).send("All fields are required: plateNumber, vehicleType, driverName, phoneNumber, parkingSlot, entryTime");
    }

    const cleanPlateNumber = plateNumber.toUpperCase().trim();

    const existing = await Vehicle.findOne({
      plateNumber: cleanPlateNumber,
      status: "parked"
    });

    if (existing) {
      return res.status(409).send("Vehicle already parked. Please sign out the existing entry first.");
    }

    // Generate receipt number
    const receiptNumber = generateReceiptNumber();

    const vehicle = new Vehicle({
      plateNumber: cleanPlateNumber,
      vehicleType,
      driverName: driverName.trim(),
      phoneNumber: phoneNumber.trim(),
      parkingSlot: parkingSlot.trim(),
      modelColor: modelColor?.trim() || "",
      ninNumber: ninNumber?.trim() || "",
      entryTime: new Date(entryTime),
      receiptNumber: receiptNumber,
      status: "parked"
    });

    await vehicle.save();
    console.log("✓ Vehicle registered successfully:", cleanPlateNumber, "Receipt:", receiptNumber);
    // Redirect to role-based dashboard
    const dashboardUrl = getDashboardUrl(req.session.user?.role);
    res.redirect(dashboardUrl);
  } catch (error) {
    console.error("Error registering vehicle:", error);
    
    // Provide specific error messages
    if (error.code === 11000) {
      return res.status(409).send("This vehicle plate is already registered. Plate numbers must be unique.");
    }
    if (error.name === "ValidationError") {
      return res.status(400).send(`Validation error: ${Object.values(error.errors).map(e => e.message).join(", ")}`);
    }
    
    res.status(500).send(`Error registering vehicle: ${error.message}`);
  }
});

router.get("/sign-out", isStaff, (req, res) => {
  res.render("sign-out", { title: "Sign Out Vehicle" });
});

// Search vehicle by plate or receipt
router.get("/api/search-vehicle", isStaff, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const searchTerm = query.toUpperCase().trim();
    
    // Search by plate number or receipt number
    const vehicle = await Vehicle.findOne({
      $or: [
        { plateNumber: searchTerm, status: "parked" },
        { receiptNumber: searchTerm, status: "parked" }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Calculate duration and fee
    const exitTime = new Date();
    const fee = calculateFee(vehicle.vehicleType, vehicle.entryTime, exitTime);
    
    res.json({
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      driverName: vehicle.driverName,
      phoneNumber: vehicle.phoneNumber,
      parkingSlot: vehicle.parkingSlot,
      entryTime: vehicle.entryTime,
      receiptNumber: vehicle.receiptNumber,
      parkingFee: fee
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Error searching vehicle" });
  }
});

// Sign out vehicle
router.post("/sign-out", isStaff, async (req, res) => {
  try {
    const { plateNumber, receiverName, receiverPhone, gender, ninNumber } = req.body;

    // Validate required fields
    if (!plateNumber || !receiverName || !receiverPhone || !gender) {
      return res.status(400).send("All fields are required: plateNumber, receiverName, receiverPhone, gender");
    }

    // Validate receiver name
    if (!isValidName(receiverName)) {
      return res.status(400).send("Invalid receiver name. Must start with capital letter and contain no numbers.");
    }

    // Validate phone number
    if (!isValidPhoneNumber(receiverPhone)) {
      return res.status(400).send("Invalid phone number. Must be a valid Ugandan number.");
    }

    const vehicle = await Vehicle.findOne({
      plateNumber: plateNumber.toUpperCase(),
      status: "parked"
    });

    if (!vehicle) {
      return res.send("Vehicle not found");
    }

    const exitTime = new Date();
    
    // Calculate fee using the updated function
    const fee = calculateFee(vehicle.vehicleType, vehicle.entryTime, exitTime);

    vehicle.status = "signed-out";
    vehicle.exitTime = exitTime;
    vehicle.parkingFee = fee;
    
    // Store receiver details
    vehicle.receiverName = receiverName.trim();
    vehicle.receiverPhone = receiverPhone.trim();
    vehicle.receiverGender = gender;
    vehicle.receiverNin = ninNumber?.trim() || "";
    
    await vehicle.save();

    // Save payment
    await Payment.create({
      plateNumber: vehicle.plateNumber,
      category: "Parking",
      amount: fee,
      customerName: receiverName.trim()
    });

    console.log("✓ Vehicle signed out:", vehicle.plateNumber, "Fee:", fee);
    // Redirect to role-based dashboard
    const dashboardUrl = getDashboardUrl(req.session.user?.role);
    res.redirect(dashboardUrl);

  } catch (error) {
    console.error(error);
    res.send("Error signing out vehicle");
  }
});

module.exports = router;