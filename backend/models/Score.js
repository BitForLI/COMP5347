const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
    isCorrect: { type: Boolean, required: true },
    // 为“计时题”变体预留：客户端可提交每题耗时/剩余时间（服务端仍需校验范围）
    timeRemainingSec: { type: Number, min: 0, max: 120 },
  },
  { _id: false }
);

const ScoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    answers: { type: [AnswerSchema], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", ScoreSchema);

