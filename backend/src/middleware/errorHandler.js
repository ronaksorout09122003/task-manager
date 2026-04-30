const ApiError = require("../utils/ApiError");

const notFound = (req, _res, next) => {
  next(new ApiError(404, "The requested resource was not found"));
};

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong. Please try again.";
  let details = err.details || null;

  if (err.code === "P2002") {
    statusCode = 409;
    message = "This record already exists";
    details = err.meta?.target || null;
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "The requested resource was not found";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired. Please sign in again.";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Please sign in again.";
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== "development") {
    message = "Something went wrong. Please try again.";
    details = null;
  }

  const shouldLog =
    process.env.NODE_ENV === "development" ||
    (process.env.NODE_ENV !== "test" && statusCode >= 500);

  if (shouldLog) {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(details && statusCode < 500 ? { details } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
