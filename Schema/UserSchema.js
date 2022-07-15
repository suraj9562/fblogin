const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: String,
  token: String,
  email: String,
  name: String,
  gender: String,
  pic: String,
});

module.exports = mongoose.model("User", userSchema);
