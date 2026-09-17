import { describe, expect, it } from "vitest";
import { getInflationAdjustmentAmount } from "./compoundInterestResultDetails";

describe("getInflationAdjustmentAmount", () => {
  it("returns the value lost to inflation when adjusted final is lower", () => {
    expect(getInflationAdjustmentAmount(7969.87, 7554.38)).toBeCloseTo(
      415.49,
      2
    );
  });

  it("returns zero when the inflation-adjusted value is the same as the final value", () => {
    expect(getInflationAdjustmentAmount(1000, 1000)).toBe(0);
  });
});
