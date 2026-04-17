const { fail } = require("../utils/response");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = status >= 500 ? "Internal Server Error" : err.message;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }
  return fail(res, message, status);
}

module.exports = { errorHandler };

