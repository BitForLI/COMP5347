const jwt = require("jsonwebtoken");
const { fail } = require("../utils/response");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, "Unauthorized", 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, name, email, role }
    return next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
}

module.exports = { requireAuth };

