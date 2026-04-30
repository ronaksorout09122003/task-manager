const ApiError = require("../utils/ApiError");

const validate =
  (schema, property = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || property,
        message: issue.message,
      }));

      return next(new ApiError(400, details[0]?.message || "Validation failed", details));
    }

    req[property] = result.data;
    return next();
  };

module.exports = validate;
