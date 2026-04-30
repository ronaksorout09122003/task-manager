import { describe, expect, it } from "vitest";
import { isOverdue, toInputDate } from "./date";

describe("date utilities", () => {
  it("formats ISO dates for form inputs", () => {
    expect(toInputDate("2026-05-12T12:00:00.000Z")).toBe("2026-05-12");
  });

  it("marks unfinished past-due tasks as overdue", () => {
    expect(isOverdue({ dueDate: "2020-01-01T00:00:00.000Z", status: "TODO" })).toBe(true);
    expect(isOverdue({ dueDate: "2020-01-01T00:00:00.000Z", status: "DONE" })).toBe(false);
  });
});
