require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDb } = require("./config/db");
const { ok, fail } = require("./utils/response");
const { errorHandler } = require("./middleware/error.middleware");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const authRoutes = require("./routes/auth.routes");
const quizRoutes = require("./routes/quiz.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true }));
app.use(express.json({ limit: "200kb" }));

function sanitizeNoSql(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (val && typeof val === "object") sanitizeNoSql(val);
  }
}

app.use((req, _res, next) => {
  sanitizeNoSql(req.body);
  sanitizeNoSql(req.query);
  sanitizeNoSql(req.params);
  next();
});

app.get("/api/health", (req, res) => ok(res, { status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => fail(res, "Not found", 404));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function ensureDemoUser() {
  const email = (process.env.DEMO_EMAIL || "demo@quizgame.test").trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD || "DemoPassword123!";
  const name = (process.env.DEMO_NAME || "Demo User").trim();

  const existing = await User.findOne({ email }).lean();
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: "admin" });
  // eslint-disable-next-line no-console
  console.log(`[demo] created user: ${email} / ${password}`);
}

async function start() {
  await connectDb(process.env.MONGODB_URI);
  await ensureDemoUser();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

