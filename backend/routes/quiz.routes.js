const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  getQuiz,
  getCategories,
  submitQuiz,
  myAttempts,
  leaderboard,
} = require("../controllers/quiz.controller");

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", requireAuth, getQuiz);
router.post("/submit", requireAuth, submitLimiter, submitQuiz);
router.get("/attempts", requireAuth, myAttempts);
router.get("/leaderboard", requireAuth, leaderboard);
router.get("/categories", requireAuth, getCategories);

module.exports = router;
