const test = require("node:test");
const assert = require("node:assert/strict");
const { isAdmin, canPatchTaskStatus, canViewTask } = require("../utils/permissions");

test("isAdmin returns true only for admin users", () => {
  assert.equal(isAdmin({ role: "ADMIN" }), true);
  assert.equal(isAdmin({ role: "MEMBER" }), false);
  assert.equal(isAdmin(null), false);
});

test("members can update and view only their assigned tasks", () => {
  const member = { id: "user-1", role: "MEMBER" };
  const assignedTask = { id: "task-1", assignedToId: "user-1" };
  const otherTask = { id: "task-2", assignedToId: "user-2" };

  assert.equal(canPatchTaskStatus(member, assignedTask), true);
  assert.equal(canPatchTaskStatus(member, otherTask), false);
  assert.equal(canViewTask(member, assignedTask), true);
  assert.equal(canViewTask(member, otherTask), false);
});

test("admins can update and view any task", () => {
  const admin = { id: "admin-1", role: "ADMIN" };
  const task = { id: "task-1", assignedToId: "user-1" };

  assert.equal(canPatchTaskStatus(admin, task), true);
  assert.equal(canViewTask(admin, task), true);
});
