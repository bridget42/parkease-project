const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  serviceType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Tyre", "Battery"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  // Tyre-specific fields
  tyreSize: {
    type: String,
    default: ""
  },
  // Battery-specific fields
  batteryModel: {
    type: String,
    default: ""
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  serviceDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);