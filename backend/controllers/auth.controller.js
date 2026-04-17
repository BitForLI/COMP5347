const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const { ok, fail } = require("../utils/response");

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72),
});

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message || "Invalid input", 400);

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email }).lean();
  if (existing) return fail(res, "Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: "player" });

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

module.exports = { register, login, me };

