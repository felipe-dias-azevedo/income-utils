export function getInflationAdjustmentAmount(
  finalValue: number,
  inflationAdjustedFinalValue: number
): number {
  if (
    !Number.isFinite(finalValue) ||
    !Number.isFinite(inflationAdjustedFinalValue)
  ) {
    return 0;
  }

  return Math.max(0, finalValue - inflationAdjustedFinalValue);
}
