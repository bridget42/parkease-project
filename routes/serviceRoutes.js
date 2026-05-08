const express = require("express");
const Service = require("../models/Service");
const Payment = require("../models/Payment");
const { isStaff } = require("../middleware/auth");

const router = express.Router();

// Tyre service
router.get("/tyre-service", isStaff, async (req, res) => {
  try {
    const recentServices = await Service.find({ category: "Tyre" })
      .sort({ serviceDate: -1 })
      .limit(10);
    res.render("tyre-clinic", { title: "Tyre Clinic", recentServices });
  } catch (error) {
    res.render("tyre-clinic", { title: "Tyre Clinic", recentServices: [] });
  }
});

router.post("/tyre-service", isStaff, async (req, res) => {
  try {
    const { plateNumber, serviceType, amount, customerName, tyreSize } =
      req.body;

    // Validate required fields
    if (!plateNumber || !serviceType || !amount || !customerName) {
      return res
        .status(400)
        .send(
          "All fields are required: plateNumber, serviceType, amount, customerName",
        );
    }

    const cleanPlateNumber = plateNumber.toUpperCase().trim();
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).send("Invalid amount. Must be a positive number.");
    }

    // Create service record
    await Service.create({
      plateNumber: cleanPlateNumber,
      serviceType,
      category: "Tyre",
      amount: amountNum,
      customerName: customerName.trim(),
      tyreSize: tyreSize?.trim() || "",
    });

    // Create payment record
    await Payment.create({
      plateNumber: cleanPlateNumber,
      category: "Tyre",
      amount: amountNum,
      customerName: customerName.trim(),
    });

    console.log(
      "✓ Tyre service recorded successfully:",
      cleanPlateNumber,
      serviceType,
      amountNum,
    );
    // Redirect to role-based dashboard
    const role = req.session.user?.role;
    const dashboardUrl =
      role === "admin"
        ? "/admin-dashboard"
        : role === "manager"
          ? "/manager-dashboard"
          : role === "attendant"
            ? "/attendant-dashboard"
            : "/dashboard";
    res.redirect(dashboardUrl);
  } catch (error) {
    console.error("Error saving tyre service:", error);

    if (error.code === 11000) {
      return res
        .status(409)
        .send("This service has already been recorded for this vehicle.");
    }
    if (error.name === "ValidationError") {
      return res.status(400).send(
        `Validation error: ${Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")}`,
      );
    }

    res.status(500).send(`Error saving tyre service: ${error.message}`);
  }
});

// Battery service
router.get("/battery-service", isStaff, async (req, res) => {
  try {
    const recentServices = await Service.find({ category: "Battery" })
      .sort({ serviceDate: -1 })
      .limit(10);
    res.render("battery-section", { title: "Battery Section", recentServices });
  } catch (error) {
    res.render("battery-section", {
      title: "Battery Section",
      recentServices: [],
    });
  }
});

router.post("/battery-service", isStaff, async (req, res) => {
  try {
    const {
      plateNumber,
      serviceType,
      amount,
      customerName,
      batteryModel,
      phoneNumber,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !plateNumber ||
      !serviceType ||
      !amount ||
      !customerName ||
      !batteryModel
    ) {
      return res
        .status(400)
        .send(
          "All fields are required: plateNumber, serviceType, amount, customerName, batteryModel",
        );
    }

    const cleanPlateNumber = plateNumber.toUpperCase().trim();
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).send("Invalid amount. Must be a positive number.");
    }

    // Create service record
    await Service.create({
      plateNumber: cleanPlateNumber,
      serviceType,
      category: "Battery",
      amount: amountNum,
      customerName: customerName.trim(),
      batteryModel: batteryModel.trim(),
      phoneNumber: phoneNumber?.trim() || "",
      notes: notes?.trim() || "",
    });

    // Create payment record
    await Payment.create({
      plateNumber: cleanPlateNumber,
      category: "Battery",
      amount: amountNum,
      customerName: customerName.trim(),
    });

    console.log(
      "✓ Battery service recorded successfully:",
      cleanPlateNumber,
      serviceType,
      amountNum,
    );
    // Redirect to role-based dashboard
    const role = req.session.user?.role;
    const dashboardUrl =
      role === "admin"
        ? "/admin-dashboard"
        : role === "manager"
          ? "/manager-dashboard"
          : role === "attendant"
            ? "/attendant-dashboard"
            : "/dashboard";
    res.redirect(dashboardUrl);
  } catch (error) {
    console.error("Error saving battery service:", error);

    if (error.code === 11000) {
      return res
        .status(409)
        .send("This service has already been recorded for this vehicle.");
    }
    if (error.name === "ValidationError") {
      return res.status(400).send(
        `Validation error: ${Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")}`,
      );
    }

    res.status(500).send(`Error saving battery service: ${error.message}`);
  }
});

module.exports = router;
