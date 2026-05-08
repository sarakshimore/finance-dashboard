const { ACTIONS } = require("./actions");
const { ROLES } = require("./roles");

const PERMISSIONS = Object.freeze({
  [ROLES.VIEWER]: [ACTIONS.VIEW_DASHBOARD, ACTIONS.VIEW_RECORDS],
  [ROLES.ADMIN]: [
    ACTIONS.VIEW_DASHBOARD,
    ACTIONS.VIEW_RECORDS,
    ACTIONS.MANAGE_RECORDS,
    ACTIONS.MANAGE_USERS,
  ],
});

function hasPermission(role, action) {
  const allowed = PERMISSIONS[role] || [];
  return allowed.includes(action);
}

module.exports = { PERMISSIONS, hasPermission };
