import { describe, expect, it } from "vitest";
import { calcEmi, estimateCost, formatINR, formatLakhCr, unitPrice } from "./finance.js";

describe("calcEmi", () => {
  it("matches the standard EMI formula", () => {
    // ₹95 L at 8.5% for 20 years is about ₹82,443 a month
    expect(Math.round(calcEmi(9_500_000, 8.5, 20).emi)).toBe(82_443);
  });
  it("handles a zero interest rate", () => {
    expect(calcEmi(1_200_000, 0, 10).emi).toBe(10_000);
  });
  it("returns zeros for invalid input instead of NaN", () => {
    expect(calcEmi(0, 8, 20).emi).toBe(0);
    expect(calcEmi(100, 8, 0).emi).toBe(0);
  });
  it("principal share and interest add up to the total", () => {
    const r = calcEmi(5_000_000, 9, 15);
    expect(r.total).toBeCloseTo(5_000_000 + r.interest, 4);
    expect(r.principalShare).toBeGreaterThan(0);
    expect(r.principalShare).toBeLessThan(1);
  });
});

describe("formatting", () => {
  it("uses Indian digit grouping", () => expect(formatINR(1234567)).toBe("₹ 12,34,567"));
  it("formats lakhs and crores", () => {
    expect(formatLakhCr(9_200_000)).toBe("₹ 92 L");
    expect(formatLakhCr(12_800_000)).toBe("₹ 1.28 Cr");
  });
});

describe("estimateCost", () => {
  it("multiplies area by the tier rate and splits it into parts", () => {
    const r = estimateCost(2400, "premium");
    expect(r.total).toBe(5_880_000);
    const sum = r.breakdown.reduce((s, b) => s + b.amount, 0);
    expect(sum).toBeCloseTo(r.total, 6);
  });
  it("falls back to premium for an unknown tier", () => {
    expect(estimateCost(1000, "nope").total).toBe(2_450_000);
  });
});

describe("unitPrice", () => {
  it("adds a floor-rise premium above the 5th floor", () => {
    expect(unitPrice({ superArea: 1000, floor: 5, ratePerSqft: 7000 })).toBe(7_000_000);
    expect(unitPrice({ superArea: 1000, floor: 7, ratePerSqft: 7000 })).toBe(7_080_000);
  });
});
