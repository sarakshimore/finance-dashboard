const AppError = require("../utils/AppError");

function validate(schema, target = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new AppError(400, "Validation failed.", result.error.flatten()));
    }
    req[target] = result.data;
    return next();
  };
}

module.exports = validate;
