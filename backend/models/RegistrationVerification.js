const mongoose = require("mongoose");

const RegistrationVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

RegistrationVerificationSchema.index({ email: 1 }, { unique: true });
RegistrationVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RegistrationVerification", RegistrationVerificationSchema);
