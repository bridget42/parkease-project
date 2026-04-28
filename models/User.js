const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const PLM = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "manager", "attendant"]
  }
});

userSchema.plugin(PLM);
module.exports = mongoose.model("User", userSchema);