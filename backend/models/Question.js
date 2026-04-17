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

    // 变体预留字段（最终请只在 README 中声明并启用一种变体）
    category: { type: String, trim: true, maxlength: 50 },
    imageUrl: { type: String, trim: true, maxlength: 500 },
    explanation: { type: String, trim: true, maxlength: 800 },
    timeLimitSec: { type: Number, min: 5, max: 120 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);

