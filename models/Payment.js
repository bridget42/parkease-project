const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  category: {
    type: String,
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
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);