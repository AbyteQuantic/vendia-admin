import { describe, it, expect } from "vitest";
import { formatCOP, paymentMethodLabel, cn } from "../utils";

describe("formatCOP", () => {
  it("formats zero", () => {
    expect(formatCOP(0)).toMatch(/\$\s*0/);
  });

  it("formats thousands with dot separator", () => {
    const result = formatCOP(150000);
    expect(result).toContain("150");
    expect(result).toContain("000");
  });

  it("formats small amounts", () => {
    const result = formatCOP(2500);
    expect(result).toContain("2");
    expect(result).toContain("500");
  });

  it("does not include decimals", () => {
    const result = formatCOP(1500);
    expect(result).not.toMatch(/,\d{2}$/);
  });
});

describe("paymentMethodLabel", () => {
  it("returns Efectivo for cash", () => {
    expect(paymentMethodLabel("cash")).toBe("Efectivo");
  });

  it("returns Transferencia for transfer", () => {
    expect(paymentMethodLabel("transfer")).toBe("Transferencia");
  });

  it("returns Tarjeta for card", () => {
    expect(paymentMethodLabel("card")).toBe("Tarjeta");
  });

  it("returns raw value for unknown methods", () => {
    expect(paymentMethodLabel("bitcoin")).toBe("bitcoin");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("merges conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
