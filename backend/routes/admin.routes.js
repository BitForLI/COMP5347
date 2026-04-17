const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/admin.middleware");
const {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleActive,
  bulkImport,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/questions", listQuestions);
router.post("/questions", createQuestion);
router.patch("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);
router.post("/questions/:id/toggle", toggleActive);
router.post("/bulk-import", bulkImport);

module.exports = router;

