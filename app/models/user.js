// load the things we need
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    local: {
      email: { type: String, lowercase: true, trim: true },
      password: String,
    },
  },
  { timestamps: true },
);

// hash a plain-text password (returns a Promise)
userSchema.methods.generateHash = function (password) {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// compare a plain-text password against the stored hash (returns a Promise<boolean>)
userSchema.methods.validPassword = function (password) {
  return bcrypt.compare(password, this.local.password);
};

module.exports = mongoose.model("User", userSchema);
