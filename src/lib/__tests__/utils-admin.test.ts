import { describe, it, expect } from "vitest";
import { formatCOP, formatDate } from "../utils";

describe("formatCOP — large admin numbers", () => {
  it("formats millions correctly", () => {
    const result = formatCOP(45230000);
    expect(result).toContain("45");
    expect(result).toContain("230");
    expect(result).toContain("000");
  });

  it("formats zero", () => {
    expect(formatCOP(0)).toMatch(/\$\s*0/);
  });
});

describe("formatDate", () => {
  it("formats a valid ISO string", () => {
    const result = formatDate("2026-03-22T10:30:00Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
