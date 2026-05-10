const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true, maxlength: 500 },
    options: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 4 && arr.every((s) => typeof s === "string" && s.trim().length > 0),
        message: "Options must be an array of 4 non-empty strings",
      },
      required: true,
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    active: { type: Boolean, default: true },

    // Chosen variation: category-based question banks (see README)
    category: { type: String, trim: true, maxlength: 50 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);

