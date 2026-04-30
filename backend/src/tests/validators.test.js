const test = require("node:test");
const assert = require("node:assert/strict");
const { signupSchema, projectCreateSchema, taskCreateSchema } = require("../utils/validators");

test("signup validation rejects invalid email and short password", () => {
  const result = signupSchema.safeParse({
    name: "Riley",
    email: "not-an-email",
    password: "123",
  });

  assert.equal(result.success, false);
  assert.equal(
    result.error.issues.some((issue) => issue.path.includes("email")),
    true,
  );
  assert.equal(
    result.error.issues.some((issue) => issue.path.includes("password")),
    true,
  );
});

test("project validation coerces dates and defaults active status", () => {
  const result = projectCreateSchema.safeParse({
    title: "Roadmap",
    description: "Q2 work",
    startDate: "2026-05-01",
    dueDate: "",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.status, "ACTIVE");
  assert.equal(result.data.startDate instanceof Date, true);
  assert.equal(result.data.dueDate, undefined);
});

test("task validation requires project member assignment input and a valid due date", () => {
  const result = taskCreateSchema.safeParse({
    title: "Write tests",
    priority: "HIGH",
    status: "TODO",
    dueDate: "2026-05-10",
    assignedToId: "user-1",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.priority, "HIGH");
  assert.equal(result.data.dueDate instanceof Date, true);
});
