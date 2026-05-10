import { describe, expect, it } from "vitest";
import { computeMonthlyIncome, computeBonus } from "./incomeCalculations";
import { Tax2025, Tax2026 } from "./taxCalculations";

describe("Tax2026", () => {
  const tax2026 = new Tax2026();

  it("Gross R$ 2.500", () => {
    const result = computeMonthlyIncome(2500, 0, tax2026);

    expect(result.inss).toBeCloseTo(200.68, 2);
    expect(result.ir).toBeCloseTo(0, 2);
    expect(result.netMonth).toBeCloseTo(2299.32, 2);
  });

  it("Gross R$ 5.000", () => {
    const result = computeMonthlyIncome(5000, 0, tax2026);

    expect(result.inss).toBeCloseTo(501.51, 2);
    expect(result.ir).toBeCloseTo(0, 2);
    expect(result.netMonth).toBeCloseTo(4498.49, 2);
  });

  it("Gross R$ 5.001", () => {
    const result = computeMonthlyIncome(5001, 0, tax2026);

    expect(result.inss).toBeCloseTo(501.65, 2);
    expect(result.ir).toBeCloseTo(0.35, 2);
    expect(result.netMonth).toBeCloseTo(4499, 2);
  });

  it("Gross R$ 6.500", () => {
    const result = computeMonthlyIncome(6500, 0, tax2026);

    expect(result.inss).toBeCloseTo(711.51, 2);
    expect(result.ir).toBeCloseTo(569.93, 2);
    expect(result.netMonth).toBeCloseTo(5218.56, 2);
  });

  it("Gross R$ 7.350", () => {
    const result = computeMonthlyIncome(7350, 0, tax2026);

    expect(result.inss).toBeCloseTo(830.51, 2);
    expect(result.ir).toBeCloseTo(884.13, 2);
    expect(result.netMonth).toBeCloseTo(5635.36, 2);
  });

  it("Gross R$ 7.351", () => {
    const result = computeMonthlyIncome(7351, 0, tax2026);

    expect(result.inss).toBeCloseTo(830.65, 2);
    expect(result.ir).toBeCloseTo(884.37, 2);
    expect(result.netMonth).toBeCloseTo(5635.98, 2);
  });

  it("Gross R$ 12.975", () => {
    const result = computeMonthlyIncome(12975, 0, tax2026);

    expect(result.inss).toBeCloseTo(988.09, 2);
    expect(result.ir).toBeCloseTo(2387.67, 2);
    expect(result.netMonth).toBeCloseTo(9599.24, 2);
  });
});

describe("Tax2026 - computeBonus", () => {
  const tax2026 = new Tax2026();

  it("Bonus below IR threshold (R$ 5.000)", () => {
    const result = computeBonus(5000, tax2026);

    expect(result.grossBonus).toBe(5000);
    expect(result.irBonus).toBeCloseTo(0, 2);
    expect(result.netBonus).toBeCloseTo(5000, 2);
  });

  it("Bonus at first IR bracket (R$ 8.214,40)", () => {
    const result = computeBonus(8214.4, tax2026);

    expect(result.grossBonus).toBe(8214.4);
    expect(result.irBonus).toBeCloseTo(0, 2);
    expect(result.netBonus).toBeCloseTo(8214.4, 2);
  });

  it("Bonus just above IR threshold (R$ 8.214,41)", () => {
    const result = computeBonus(8214.41, tax2026);

    expect(result.grossBonus).toBeCloseTo(8214.41, 2);
    expect(result.irBonus).toBeCloseTo(0, 2);
    expect(result.netBonus).toBeCloseTo(8214.41, 2);
  });

  it("Bonus in second IR bracket (R$ 9.922,28)", () => {
    const result = computeBonus(9922.28, tax2026);

    expect(result.grossBonus).toBeCloseTo(9922.28, 2);
    expect(result.irBonus).toBeCloseTo(128.09, 2);
    expect(result.netBonus).toBeCloseTo(9794.19, 2);
  });

  it("Bonus in third IR bracket (R$ 13.167,00)", () => {
    const result = computeBonus(13167, tax2026);

    expect(result.grossBonus).toBe(13167);
    expect(result.irBonus).toBeCloseTo(614.8, 2);
    expect(result.netBonus).toBeCloseTo(12552.2, 2);
  });

  it("Bonus in fourth IR bracket (R$ 16.380,38)", () => {
    const result = computeBonus(16380.38, tax2026);

    expect(result.grossBonus).toBeCloseTo(16380.38, 2);
    expect(result.irBonus).toBeCloseTo(1337.81, 2);
    expect(result.netBonus).toBeCloseTo(15042.57, 2);
  });

  it("Bonus in highest IR bracket (R$ 30.000)", () => {
    const result = computeBonus(30000, tax2026);

    expect(result.grossBonus).toBe(30000);
    expect(result.irBonus).toBeCloseTo(5083.2, 2);
    expect(result.netBonus).toBeCloseTo(24916.8, 2);
  });

  it("Large bonus (R$ 50.000)", () => {
    const result = computeBonus(50000, tax2026);

    expect(result.grossBonus).toBe(50000);
    expect(result.irBonus).toBeCloseTo(10583.2, 2);
    expect(result.netBonus).toBeCloseTo(39416.8, 2);
  });

  it("Small bonus (R$ 100)", () => {
    const result = computeBonus(100, tax2026);

    expect(result.grossBonus).toBe(100);
    expect(result.irBonus).toBeCloseTo(0, 2);
    expect(result.netBonus).toBeCloseTo(100, 2);
  });

  it("Zero bonus", () => {
    const result = computeBonus(0, tax2026);

    expect(result.grossBonus).toBe(0);
    expect(result.irBonus).toBe(0);
    expect(result.netBonus).toBe(0);
  });
});

describe("Tax2025", () => {
  const tax2025 = new Tax2025();

  it("Gross R$ 2.500", () => {
    const result2025 = computeMonthlyIncome(2500, 0, tax2025);

    expect(result2025.inss).toBeCloseTo(202.23, 2);
    expect(result2025.ir).toBeCloseTo(0, 2);
    expect(result2025.netMonth).toBeCloseTo(2297.77, 2);
  });

  it("Gross R$ 4.000", () => {
    const result2025 = computeMonthlyIncome(4000, 0, tax2025);

    expect(result2025.inss).toBeCloseTo(373.41, 2);
    expect(result2025.ir).toBeCloseTo(114.76, 2);
    expect(result2025.netMonth).toBeCloseTo(3511.83, 2);
  });

  it("Gross R$ 5.000", () => {
    const result2025 = computeMonthlyIncome(5000, 0, tax2025);

    expect(result2025.inss).toBeCloseTo(509.6, 2);
    expect(result2025.ir).toBeCloseTo(312.89, 2);
    expect(result2025.netMonth).toBeCloseTo(4177.51, 2);
  });

  it("Gross R$ 6.500", () => {
    const result2025 = computeMonthlyIncome(6500, 0, tax2025);

    expect(result2025.inss).toBeCloseTo(719.6, 2);
    expect(result2025.ir).toBeCloseTo(680.88, 2);
    expect(result2025.netMonth).toBeCloseTo(5099.52, 2);
  });

  it("Gross R$ 8.000", () => {
    const result2025 = computeMonthlyIncome(8000, 0, tax2025);

    expect(result2025.inss).toBeCloseTo(929.6, 2);
    expect(result2025.ir).toBeCloseTo(1035.63, 2);
    expect(result2025.netMonth).toBeCloseTo(6034.77, 2);
  });

  it("Gross R$ 12.975", () => {
    const result2025 = computeMonthlyIncome(12975, 0, tax2025);

    expect(result2025.inss).toBeCloseTo(951.64, 2);
    expect(result2025.ir).toBeCloseTo(2397.69, 2);
    expect(result2025.netMonth).toBeCloseTo(9625.67, 2);
  });
});
