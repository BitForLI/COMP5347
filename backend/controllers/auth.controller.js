const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const RegistrationVerification = require("../models/RegistrationVerification");
const { sendRegistrationCodeEmail } = require("../services/email.service");
const { ok, fail } = require("../utils/response");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72)
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

const sendCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72),
});

async function sendRegistrationCode(req, res) {
  const parsed = sendCodeSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message || "Invalid input", 400);

  const { email } = parsed.data;
  const existing = await User.findOne({ email }).lean();
  if (existing) return fail(res, "This email is already registered", 409);

  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await RegistrationVerification.findOneAndUpdate(
    { email },
    { email, codeHash, expiresAt },
    { upsert: true, new: true }
  );

  try {
    await sendRegistrationCodeEmail(email, code);
  } catch (e) {
    await RegistrationVerification.deleteOne({ email });
    const status = e.status && Number.isInteger(e.status) ? e.status : 502;
    return fail(res, e.message || "Failed to send verification email", status);
  }

  return ok(res, { sent: true });
}

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message || "Invalid input", 400);

  const { email, password, code } = parsed.data;

  const existing = await User.findOne({ email }).lean();
  if (existing) return fail(res, "Email already registered", 409);

  const row = await RegistrationVerification.findOne({ email }).lean();
  if (!row || row.expiresAt < new Date())
    return fail(res, "Invalid or expired verification code", 400);

  const codeOk = await bcrypt.compare(code, row.codeHash);
  if (!codeOk) return fail(res, "Invalid or expired verification code", 400);

  const passwordHash = await bcrypt.hash(password, 12);
  const name = (email.split("@")[0] || "player").slice(0, 80);
  const user = await User.create({ name, email, passwordHash, role: "player" });
  await RegistrationVerification.deleteOne({ email });

  return ok(res, { id: String(user._id), name: user.name, email: user.email, role: user.role }, 201);
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message || "Invalid input", 400);

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return fail(res, "Invalid credentials", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return fail(res, "Invalid credentials", 401);

  const token = jwt.sign(
    { id: String(user._id), name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return ok(res, {
    token,
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
  });
}

async function me(req, res) {
  return ok(res, { user: req.user });
}

module.exports = {
  sendRegistrationCode,
  register,
  login,
  me,
};
