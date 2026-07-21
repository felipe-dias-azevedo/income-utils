import { describe, expect, it } from "vitest";
import {
  calculateCompoundInterest,
  calculateTimeToGoal,
  calculateTimeToYield,
  calculateInflationAdjustedResult
} from "./compoundInterestCalculations";

describe("calculateCompoundInterest", () => {
  it("calculates zero interest correctly for monthly contributions", () => {
    const result = calculateCompoundInterest({
      initialValue: 1000,
      monthlyContribution: 100,
      interestRate: 0,
      interestRateType: "monthly",
      periodAmount: 12,
      periodType: "months"
    });

    expect(result.totalInvested).toBe(2200);
    expect(result.totalFinal).toBe(2200);
    expect(result.totalInterest).toBe(0);
    expect(result.timeline).toHaveLength(12);
    expect(result.timeline[11].invested).toBe(2200);
    expect(result.timeline[11].interest).toBe(0);
  });

  it("calculates monthly compounding correctly from an annual interest rate", () => {
    const result = calculateCompoundInterest({
      initialValue: 1000,
      monthlyContribution: 0,
      interestRate: 12,
      interestRateType: "annual",
      periodAmount: 1,
      periodType: "years"
    });

    // 12% annual interest compounded monthly:
    // 1000 * (1 + 0.12 / 12)^12 = 1126.825...
    expect(result.totalInvested).toBe(1000);
    expect(result.totalFinal).toBeCloseTo(1120, 2);
    expect(result.totalInterest).toBeCloseTo(120, 2);

    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0].label).toBe("1 ano");
    expect(result.timeline[0].invested).toBeCloseTo(1000, 2);
    expect(result.timeline[0].interest).toBeCloseTo(120, 2);
  });

  it("builds a timeline with monthly labels", () => {
    const result = calculateCompoundInterest({
      initialValue: 500,
      monthlyContribution: 50,
      interestRate: 1,
      interestRateType: "monthly",
      periodAmount: 6,
      periodType: "months"
    });

    expect(result.timeline).toHaveLength(6);
    expect(result.timeline[0].label).toBe("1m");
    expect(result.timeline[5].label).toBe("6m");
    expect(result.timeline[5].interest).toBeGreaterThan(0);
  });

  it("builds a timeline with yearly labels", () => {
    const result = calculateCompoundInterest({
      initialValue: 500,
      monthlyContribution: 50,
      interestRate: 12,
      interestRateType: "annual",
      periodAmount: 2,
      periodType: "years"
    });

    expect(result.timeline).toHaveLength(2);
    expect(result.timeline[0].label).toBe("1 ano");
    expect(result.timeline[1].label).toBe("2 anos");
  });
});

describe("calculateTimeToGoal", () => {
  it("returns zero months when the initial value already meets the target", () => {
    const result = calculateTimeToGoal({
      initialValue: 5000,
      monthlyContribution: 100,
      targetAmount: 4000,
      interestRate: 5,
      interestRateType: "annual",
      periodType: "months"
    });

    expect(result.totalMonths).toBe(0);
    expect(result.totalYears).toBe(0);
    expect(result.totalFinal).toBe(5000);
    expect(result.totalInterest).toBe(0);
    expect(result.timeline).toHaveLength(0);
  });

  it("calculates the time necessary to reach a target with zero interest", () => {
    const result = calculateTimeToGoal({
      initialValue: 1000,
      monthlyContribution: 100,
      targetAmount: 2000,
      interestRate: 0,
      interestRateType: "monthly",
      periodType: "months"
    });

    expect(result.totalMonths).toBe(10);
    expect(result.totalYears).toBe(0);
    expect(result.totalFinal).toBe(2000);
    expect(result.timeline[result.timeline.length - 1].label).toBe("10m");
  });

  it("throws when the target is unreachable with zero contributions and zero interest", () => {
    expect(() =>
      calculateTimeToGoal({
        initialValue: 1000,
        monthlyContribution: 0,
        targetAmount: 2000,
        interestRate: 0,
        interestRateType: "monthly",
        periodType: "years"
      })
    ).toThrow("Target amount unreachable");
  });

  it("matches calculateCompoundInterest for zero interest monthly contributions", () => {
    const nominalResult = calculateCompoundInterest({
      initialValue: 1000,
      monthlyContribution: 100,
      interestRate: 0,
      interestRateType: "monthly",
      periodAmount: 12,
      periodType: "months"
    });

    const result = calculateTimeToGoal({
      initialValue: 1000,
      monthlyContribution: 100,
      targetAmount: nominalResult.totalFinal,
      interestRate: 0,
      interestRateType: "monthly",
      periodType: "months"
    });

    expect(result.totalMonths).toBe(12);
    expect(result.totalFinal).toBe(nominalResult.totalFinal);
    expect(result.timeline).toHaveLength(12);
    expect(result.timeline[11].label).toBe("12m");
  });

  it("matches calculateCompoundInterest for annual interest over one year", () => {
    const nominalResult = calculateCompoundInterest({
      initialValue: 1000,
      monthlyContribution: 0,
      interestRate: 12,
      interestRateType: "annual",
      periodAmount: 1,
      periodType: "years"
    });

    const result = calculateTimeToGoal({
      initialValue: 1000,
      monthlyContribution: 0,
      targetAmount: nominalResult.totalFinal,
      interestRate: 12,
      interestRateType: "annual",
      periodType: "years"
    });

    expect(result.totalMonths).toBe(12);
    expect(result.totalFinal).toBeCloseTo(nominalResult.totalFinal, 6);
    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0].label).toBe("1 ano");
  });

  it("matches calculateCompoundInterest labels when monthly timeline is used", () => {
    const nominalResult = calculateCompoundInterest({
      initialValue: 500,
      monthlyContribution: 50,
      interestRate: 1,
      interestRateType: "monthly",
      periodAmount: 6,
      periodType: "months"
    });

    const result = calculateTimeToGoal({
      initialValue: 500,
      monthlyContribution: 50,
      targetAmount: nominalResult.totalFinal,
      interestRate: 1,
      interestRateType: "monthly",
      periodType: "months"
    });

    expect(result.totalMonths).toBe(6);
    expect(result.timeline).toHaveLength(6);
    expect(result.timeline[0].label).toBe("1m");
    expect(result.timeline[5].label).toBe("6m");
  });

  it("matches calculateCompoundInterest labels when yearly timeline is used", () => {
    const nominalResult = calculateCompoundInterest({
      initialValue: 500,
      monthlyContribution: 50,
      interestRate: 12,
      interestRateType: "annual",
      periodAmount: 2,
      periodType: "years"
    });

    const result = calculateTimeToGoal({
      initialValue: 500,
      monthlyContribution: 50,
      targetAmount: nominalResult.totalFinal,
      interestRate: 12,
      interestRateType: "annual",
      periodType: "years"
    });

    expect(result.totalMonths).toBe(24);
    expect(result.timeline).toHaveLength(2);
    expect(result.timeline[0].label).toBe("1 ano");
    expect(result.timeline[1].label).toBe("2 anos");
  });
});

describe("calculateTimeToYield", () => {
  it("calculates the months needed to reach a given annual yield", () => {
    const result = calculateTimeToYield({
      initialValue: 1000,
      monthlyContribution: 100,
      targetMonthlyInterest: 1000,
      annualInterestRate: 12,
      interestRateType: "annual",
      periodType: "years"
    });

    expect(result.totalMonths).toBeGreaterThan(0);
    expect(result.totalYears).toBe(Math.round(result.totalMonths / 12));
    expect(result.totalFinal).toBeGreaterThan(result.totalInvested);
    expect(result.totalInterest).toBeCloseTo(
      result.totalFinal - result.totalInvested,
      6
    );
  });

  it("example: R$1.000 initial, 10% annual -> R$1.000 monthly interest implies the expected final amount", () => {
    const result = calculateTimeToYield({
      initialValue: 1000,
      monthlyContribution: 0,
      targetMonthlyInterest: 1000,
      annualInterestRate: 10,
      interestRateType: "annual",
      periodType: "years"
    });

    expect(result.totalFinal).toBeGreaterThan(126000);
    expect(result.totalFinal).toBeLessThan(127000);
    expect(result.totalMonths).toBeGreaterThan(0);
  });

  it("throws when the requested rendimento is unreachable with zero contributions and zero interest", () => {
    expect(() =>
      calculateTimeToYield({
        initialValue: 1000,
        monthlyContribution: 0,
        targetMonthlyInterest: 1000,
        annualInterestRate: 0,
        interestRateType: "annual",
        periodType: "years"
      })
    ).toThrow("Target amount unreachable");
  });
});

describe("calculateInflationAdjustedResult", () => {
  it("adjusts compound interest results for inflation", () => {
    const nominalResult = calculateCompoundInterest({
      initialValue: 1000,
      monthlyContribution: 0,
      interestRate: 12,
      interestRateType: "annual",
      periodAmount: 1,
      periodType: "years"
    });

    const adjusted = calculateInflationAdjustedResult({
      result: nominalResult,
      inflationRate: 12,
      inflationRateType: "annual",
      totalPeriodAmount: 1,
      totalPeriodType: "years"
    });

    expect(adjusted.inflationAdjustedFinal).toBeCloseTo(
      nominalResult.totalFinal / 1.12,
      6
    );
    expect(adjusted.inflationAdjustedTimeline).toHaveLength(1);
    expect(adjusted.inflationAdjustedTimeline[0].invested).toBeCloseTo(
      1000 / 1.12,
      6
    );
    expect(adjusted.inflationAdjustedTimeline[0].interest).toBeCloseTo(
      120 / 1.12,
      6
    );
  });
});
