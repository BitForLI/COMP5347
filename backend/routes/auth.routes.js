const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  sendRegistrationCode,
  register,
  login,
  me,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const sendRegisterCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register/send-code", sendRegisterCodeLimiter, sendRegistrationCode);
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, me);

module.exports = router;

