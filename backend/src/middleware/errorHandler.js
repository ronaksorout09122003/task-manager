const ApiError = require("../utils/ApiError");

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  if (err.code === "P2002") {
    statusCode = 409;
    message = "A record with this value already exists";
    details = err.meta?.target || null;
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  const shouldLog =
    process.env.NODE_ENV === "development" ||
    (process.env.NODE_ENV !== "test" && statusCode >= 500);

  if (shouldLog) {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
