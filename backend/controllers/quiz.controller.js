const { z } = require("zod");
const Question = require("../models/Question");
const Score = require("../models/Score");
const { ok, fail } = require("../utils/response");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getQuiz(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit || 8), 6), 10);
  const category = (req.query.category || "").trim();

  const match = { active: true };
  if (category) match.category = category;

  const docs = await Question.aggregate([
    { $match: match },
    { $sample: { size: limit } },
  ]);

  const questions = docs.map((q) => ({
    id: String(q._id),
    prompt: q.prompt,
    options: q.options,
    category: q.category,
  }));

  return ok(res, { questions });
}

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedIndex: z.number().int().min(0).max(3),
        timeRemainingSec: z.number().int().min(0).max(120).optional(),
      }),
    )
    .min(6)
    .max(10),
});

async function getCategories(req, res) {
  const categories = await Question.distinct("category", { active: true });
  const cleaned = categories.filter(Boolean).sort();
  return ok(res, { categories: cleaned });
}
async function submitQuiz(req, res) {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, parsed.error.issues[0]?.message || "Invalid input", 400);

  const { answers } = parsed.data;
  const ids = answers.map((a) => a.questionId);

  const questions = await Question.find({ _id: { $in: ids } }).lean();
  const byId = new Map(questions.map((q) => [String(q._id), q]));

  let score = 0;
  const normalized = answers.map((a) => {
    const q = byId.get(a.questionId);
    const correct = !!q && a.selectedIndex === q.correctIndex;
    if (correct) score += 1;
    return {
      questionId: a.questionId,
      selectedIndex: a.selectedIndex,
      isCorrect: correct,
      timeRemainingSec: a.timeRemainingSec,
    };
  });

  const created = await Score.create({
    userId: req.user.id,
    score,
    answers: normalized,
  });

  return ok(res, { attemptId: String(created._id), score }, 201);
}

async function myAttempts(req, res) {
  const attempts = await Score.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const ids = [
    ...new Set(attempts.flatMap((a) => a.answers.map((x) => String(x.questionId)))),
  ];
  const questions = ids.length ? await Question.find({ _id: { $in: ids } }).lean() : [];
  const byId = new Map(questions.map((q) => [String(q._id), q]));

  const enriched = attempts.map((a) => ({
    ...a,
    id: String(a._id),
    userId: String(a.userId),
    answers: a.answers.map((ans) => {
      const q = byId.get(String(ans.questionId));
      const opts = q?.options || [];
      return {
        questionId: String(ans.questionId),
        selectedIndex: ans.selectedIndex,
        isCorrect: ans.isCorrect,
        timeRemainingSec: ans.timeRemainingSec,
        prompt: q?.prompt,
        options: opts,
        category: q?.category,
        selectedText: opts[ans.selectedIndex],
        correctIndex: q?.correctIndex,
        correctText: q?.correctIndex != null ? opts[q.correctIndex] : undefined,
      };
    }),
  }));

  return ok(res, { attempts: enriched });
}

async function leaderboard(req, res) {
  // 简单实现：展示所有 attempts（你们可改成每用户 best attempt，并在 README 说明）
  const attempts = await Score.find({})
    .sort({ score: -1, createdAt: -1 })
    .limit(50)
    .populate("userId", "name email")
    .lean();

  const rows = attempts.map((a) => ({
    name: a.userId?.name || "Unknown",
    email: a.userId?.email || "",
    score: a.score,
    createdAt: a.createdAt,
  }));

  return ok(res, { leaderboard: rows });
}

module.exports = {
  getQuiz,
  getCategories,
  submitQuiz,
  myAttempts,
  leaderboard,
};
