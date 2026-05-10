const { z } = require("zod");
const Question = require("../models/Question");
const { ok, fail } = require("../utils/response");

const questionSchema = z.object({
  prompt: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(200)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  active: z.boolean().optional(),
  category: z.string().min(1).max(50).optional(),
  imageUrl: z.string().url().max(500).optional(),
  explanation: z.string().min(1).max(800).optional(),
  timeLimitSec: z.number().int().min(5).max(120).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(200).optional().default(""),
  active: z.enum(["all", "true", "false"]).optional().default("all"),
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function listQuestions(req, res) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message || "Invalid query", 400);
  const { page, pageSize, q, active } = parsed.data;

  const filter = {};
  if (q) filter.prompt = { $regex: escapeRegex(q), $options: "i" };
  if (active !== "all") filter.active = active === "true";

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Question.countDocuments(filter),
  ]);

  return ok(res, { questions: items, page, pageSize, total });
}

async function createQuestion(req, res) {
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message || "Invalid input", 400);
  const created = await Question.create(parsed.data);
  return ok(res, { question: created }, 201);
}

async function updateQuestion(req, res) {
  const parsed = questionSchema.partial().safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message || "Invalid input", 400);

  const updated = await Question.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return fail(res, "Not found", 404);
  return ok(res, { question: updated });
}

async function deleteQuestion(req, res) {
  const deleted = await Question.findByIdAndDelete(req.params.id);
  if (!deleted) return fail(res, "Not found", 404);
  return ok(res, { deleted: true });
}

async function toggleActive(req, res) {
  const q = await Question.findById(req.params.id);
  if (!q) return fail(res, "Not found", 404);
  q.active = !q.active;
  await q.save();
  return ok(res, { question: q });
}

async function bulkImport(req, res) {
  const bodySchema = z.object({
    json: z.string().min(2),
  });
  const parsedBody = bodySchema.safeParse(req.body);
  if (!parsedBody.success) return fail(res, parsedBody.error.issues[0]?.message || "Invalid input", 400);

  let arr;
  try {
    arr = JSON.parse(parsedBody.data.json);
  } catch {
    return fail(res, "Invalid JSON", 400);
  }
  if (!Array.isArray(arr)) return fail(res, "JSON must be an array", 400);
  if (arr.length < 1) return fail(res, "Empty array", 400);
  if (arr.length > 200) return fail(res, "Too many questions (max 200)", 400);

  const validated = [];
  for (let i = 0; i < arr.length; i++) {
    const parsed = questionSchema.safeParse(arr[i]);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const path = issue?.path?.length ? issue.path.join(".") : "(root)";
      const msg = issue?.message || "invalid";
      return fail(res, `Item ${i} (${path}): ${msg}`, 400);
    }
    validated.push(parsed.data);
  }

  const created = await Question.insertMany(validated, { ordered: true });
  return ok(res, { createdCount: created.length }, 201);
}

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleActive,
  bulkImport,
};

