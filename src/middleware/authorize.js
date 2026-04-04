const AppError = require("../utils/AppError");
const { hasPermission } = require("../constants/permissions");

function authorize(action) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role || !hasPermission(role, action)) {
      return next(new AppError(403, "You do not have permission for this action."));
    }
    return next();
  };
}

module.exports = authorize;
