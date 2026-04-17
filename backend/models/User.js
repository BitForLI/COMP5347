const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["player", "admin"], default: "player" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

