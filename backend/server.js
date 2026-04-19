require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDb } = require("./config/db");
const { ok, fail } = require("./utils/response");
const { errorHandler } = require("./middleware/error.middleware");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Question = require("./models/Question");

const authRoutes = require("./routes/auth.routes");
const quizRoutes = require("./routes/quiz.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

/**
 * CORS：除 CORS_ORIGIN 显式列表外，可设 CORS_CLOUDFLARE_PAGES_PROJECT=comp5347test
 * 以同时允许正式站与每次构建的预览站，如
 * https://comp5347test.pages.dev 与 https://6092caaf.comp5347test.pages.dev
 */
function createCorsOriginOption() {
  const explicit = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const pagesSlug = (process.env.CORS_CLOUDFLARE_PAGES_PROJECT || "").trim();

  if (!explicit.length && !pagesSlug) return true;

  return (origin, callback) => {
    if (!origin) return callback(null, true);
    if (explicit.includes(origin)) return callback(null, true);
    if (pagesSlug) {
      const esc = pagesSlug.replace(/\./g, "\\.");
      const re = new RegExp(`^https://([a-z0-9-]+\\.)?${esc}\\.pages\\.dev$`, "i");
      if (re.test(origin)) return callback(null, true);
    }
    callback(null, false);
  };
}

app.use(helmet());
app.use(cors({ origin: createCorsOriginOption() }));
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

/** 与 getCategories 一致：无有效分类名时插入演示题，避免分类页空白 */
async function ensureDemoQuestions() {
  const raw = await Question.distinct("category", { active: true });
  if (raw.filter(Boolean).length > 0) return;

  const mk = (category, i, prompt, correctIndex = 1) => ({
    prompt,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctIndex,
    active: true,
    category,
    explanation: `Demo question ${i + 1} in ${category}.`,
  });

  const general = Array.from({ length: 8 }, (_, i) =>
    mk("General", i, `Demo — General #${i + 1}: Pick option B.`, 1),
  );
  const science = Array.from({ length: 8 }, (_, i) =>
    mk("Science", i, `Demo — Science #${i + 1}: Pick option B.`, 1),
  );
  const history = Array.from({ length: 8 }, (_, i) =>
    mk("History", i, `Demo — History #${i + 1}: Pick option B.`, 1),
  );

  await Question.insertMany([...general, ...science, ...history]);
  // eslint-disable-next-line no-console
  console.log("[demo] seeded questions: General, Science, History (8 each)");
}

async function start() {
  await connectDb(process.env.MONGODB_URI);
  await ensureDemoUser();
  await ensureDemoQuestions();
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

