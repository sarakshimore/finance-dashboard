const assert = require("node:assert/strict");
const { hasPermission } = require("../constants/permissions");
const { ROLES } = require("../constants/roles");
const { ACTIONS } = require("../constants/actions");

function run() {
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.VIEW_DASHBOARD), true);
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.VIEW_RECORDS), true);
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.MANAGE_RECORDS), false);
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.MANAGE_USERS), false);

  for (const action of Object.values(ACTIONS)) {
    assert.equal(hasPermission(ROLES.ADMIN, action), true);
  }

  console.log("Permission tests passed.");
}

run();
