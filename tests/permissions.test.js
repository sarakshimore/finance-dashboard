const assert = require("node:assert/strict");
const { hasPermission } = require("../src/constants/permissions");
const { ROLES } = require("../src/constants/roles");
const { ACTIONS } = require("../src/constants/actions");

function run() {
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.VIEW_DASHBOARD), true);
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.VIEW_RECORDS), false);
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.MANAGE_RECORDS), false);
  assert.equal(hasPermission(ROLES.VIEWER, ACTIONS.MANAGE_USERS), false);

  assert.equal(hasPermission(ROLES.ANALYST, ACTIONS.VIEW_DASHBOARD), true);
  assert.equal(hasPermission(ROLES.ANALYST, ACTIONS.VIEW_RECORDS), true);
  assert.equal(hasPermission(ROLES.ANALYST, ACTIONS.MANAGE_RECORDS), false);

  for (const action of Object.values(ACTIONS)) {
    assert.equal(hasPermission(ROLES.ADMIN, action), true);
  }

  console.log("Permission tests passed.");
}

run();
