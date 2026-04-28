const express = require("express");
const path = require("path");
const Payment = require("../models/Payment");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const { isAuthenticated, isAdmin, isManagerOrAdmin } = require("../middleware/auth");
const router = express.Router();

router.get("/admin-reports", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1 });
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    const services = await Service.find().sort({ serviceDate: -1 });
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const parkedCount = vehicles.filter(v => v.status === "parked").length;
    const signedOutCount = vehicles.filter(v => v.status === "signed-out").length;
    
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => new Date(p.paymentDate) >= today);
    const todayServices = services.filter(s => new Date(s.serviceDate) >= today);
    
    // Find most popular service
    const serviceCounts = {};
    services.forEach(s => {
      serviceCounts[s.serviceType] = (serviceCounts[s.serviceType] || 0) + 1;
    });
    const popularService = Object.keys(serviceCounts).reduce((a, b) => 
      serviceCounts[a] > serviceCounts[b] ? a : b, '-');

    res.render("admin-reports", { 
      title: "Admin Reports",
      totalRevenue,
      totalVehicles: vehicles.length,
      signedOutCount,
      todayRevenue: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      todayServices: todayServices.length,
      parkedCount,
      popularService,
      recentPayments: payments.slice(0, 20)
    });
  } catch (error) {
    console.error(error);
    res.send("Error loading admin reports");
  }
});

router.get("/reports", isAuthenticated, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1 });
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    const services = await Service.find().sort({ serviceDate: -1 });
    
    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => new Date(p.paymentDate) >= today);
    
    const parkingRevenue = todayPayments
      .filter(p => p.category === "Parking")
      .reduce((sum, p) => sum + p.amount, 0);

    const tyreRevenue = todayPayments
      .filter(p => p.category === "Tyre")
      .reduce((sum, p) => sum + p.amount, 0);

    const batteryRevenue = todayPayments
      .filter(p => p.category === "Battery")
      .reduce((sum, p) => sum + p.amount, 0);

    // Get signed out vehicles today
    const signedOutVehicles = vehicles.filter(v => 
      v.status === "signed-out" && new Date(v.exitTime) >= today
    );

    // Get today's services
    const tyreServices = services.filter(s => 
      s.category === "Tyre" && new Date(s.serviceDate) >= today
    );
    
    const batteryServices = services.filter(s => 
      s.category === "Battery" && new Date(s.serviceDate) >= today
    );

    res.render("reports", { 
      title: "Reports",
      parkingRevenue,
      tyreRevenue,
      batteryRevenue,
      totalRevenue: parkingRevenue + tyreRevenue + batteryRevenue,
      signedOutVehicles,
      tyreServices,
      batteryServices
    });
  } catch (error) {
    console.error(error);
    res.send("Error loading reports");
  }
});

// API endpoint for reports data
router.get("/api/reports-data", isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's payments
    const payments = await Payment.find({
      paymentDate: { $gte: today, $lt: tomorrow }
    });

    // Calculate revenue by category
    const parkingRevenue = payments
      .filter(p => p.category === "Parking")
      .reduce((sum, p) => sum + p.amount, 0);

    const tyreRevenue = payments
      .filter(p => p.category === "Tyre")
      .reduce((sum, p) => sum + p.amount, 0);

    const batteryRevenue = payments
      .filter(p => p.category === "Battery")
      .reduce((sum, p) => sum + p.amount, 0);

    // Get signed out vehicles today
    const signedOutVehicles = await Vehicle.find({
      status: "signed-out",
      exitTime: { $gte: today, $lt: tomorrow }
    }).sort({ exitTime: -1 });

    // Get tyre services today
    const tyreServices = await Service.find({
      category: "Tyre",
      serviceDate: { $gte: today, $lt: tomorrow }
    }).sort({ serviceDate: -1 });

    // Get battery services today
    const batteryServices = await Service.find({
      category: "Battery",
      serviceDate: { $gte: today, $lt: tomorrow }
    }).sort({ serviceDate: -1 });

    res.json({
      parkingRevenue,
      tyreRevenue,
      batteryRevenue,
      totalRevenue: parkingRevenue + tyreRevenue + batteryRevenue,
      signedOutVehicles,
      tyreServices,
      batteryServices
    });
  } catch (error) {
    console.error("Error fetching reports data:", error);
    res.status(500).json({ error: "Error loading reports data" });
  }
});

module.exports = router;