const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["Truck", "Personal Car", "Taxi", "Coaster", "Boda-boda", "Car"]
  },
  driverName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  parkingSlot: {
    type: String,
    required: true
  },
  receiptNumber: {
  type: String,
  unique: true
},
  modelColor: {
    type: String
  },
  ninNumber: {
    type: String
  },
  entryTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  parkingFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["parked", "signed-out"],
    default: "parked"
  }
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);