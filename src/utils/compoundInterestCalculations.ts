import "../extensions/number.extensions";

export type CompoundInterestRateType = "monthly" | "annual";
export type CompoundInterestPeriodType = "months" | "years";

export interface CompoundInterestInput {
  initialValue: number;
  monthlyContribution: number;
  interestRate: number;
  interestRateType: CompoundInterestRateType;
  periodAmount: number;
  periodType: CompoundInterestPeriodType;
}

export interface CompoundInterestTimelinePoint {
  label: string;
  invested: number;
  interest: number;
}

export interface CompoundInterestResult {
  totalFinal: number;
  totalInvested: number;
  totalInterest: number;
  timeline: CompoundInterestTimelinePoint[];
}

export interface CompoundInterestGoalInput {
  initialValue: number;
  monthlyContribution: number;
  targetAmount: number;
  interestRate: number;
  interestRateType: CompoundInterestRateType;
  periodType: CompoundInterestPeriodType;
}

export interface CompoundInterestYieldInput {
  initialValue: number;
  monthlyContribution: number;
  targetMonthlyInterest: number;
  annualInterestRate: number;
  interestRateType: CompoundInterestRateType;
  periodType: CompoundInterestPeriodType;
}

export interface CompoundInterestGoalResult {
  totalMonths: number;
  totalYears: number;
  totalMonthsAfterYears: number;
  totalFinal: number;
  totalInvested: number;
  totalInterest: number;
  timeline: CompoundInterestTimelinePoint[];
}

export interface InflationAdjustedInput {
  result: CompoundInterestResult;
  inflationRate: number;
  inflationRateType: CompoundInterestRateType;
  totalPeriodAmount: number;
  totalPeriodType: CompoundInterestPeriodType;
}

export interface InflationAdjustedResult {
  inflationAdjustedFinal: number;
  inflationAdjustedInterest: number;
  inflationAdjustedTimeline: CompoundInterestTimelinePoint[];
}

function getMonthlyRate(rate: number, type: CompoundInterestRateType) {
  if (type === "monthly") {
    return rate / 100;
  }

  return Math.pow(1 + rate / 100, 1 / 12) - 1;
}

function getTotalMonths(amount: number, type: CompoundInterestPeriodType) {
  if (type === "months") {
    return Math.max(0, Math.round(amount));
  }

  return Math.max(0, Math.round(amount * 12));
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateFutureValue(
  initialValue: number,
  monthlyContribution: number,
  monthlyRate: number,
  months: number
) {
  if (months <= 0) {
    return initialValue;
  }

  if (monthlyRate === 0) {
    return initialValue + monthlyContribution * months;
  }

  const growthFactor = Math.pow(1 + monthlyRate, months);
  return (
    initialValue * growthFactor +
    monthlyContribution * ((growthFactor - 1) / monthlyRate)
  );
}

function calculateTimeToGoalFast(
  initialValue: number,
  monthlyContribution: number,
  monthlyRate: number,
  targetAmount: number
) {
  if (targetAmount <= initialValue) {
    return 0;
  }

  if (monthlyRate === 0) {
    if (monthlyContribution <= 0) {
      throw new Error("Target amount unreachable");
    }

    return Math.ceil((targetAmount - initialValue) / monthlyContribution);
  }

  const growthFactor = 1 + monthlyRate;
  if (growthFactor <= 0) {
    throw new Error("Target amount unreachable");
  }

  const rateFactor = monthlyContribution / monthlyRate;
  const numerator = targetAmount + rateFactor;
  const denominator = initialValue + rateFactor;

  if (numerator <= 0 || denominator <= 0) {
    throw new Error("Target amount unreachable");
  }

  const months = Math.log(numerator / denominator) / Math.log(growthFactor);

  if (!Number.isFinite(months) || months < 0) {
    throw new Error("Target amount unreachable");
  }

  let candidateMonths = Math.max(0, Math.ceil(months));
  const candidateValue = roundCurrency(
    calculateFutureValue(
      initialValue,
      monthlyContribution,
      monthlyRate,
      candidateMonths
    )
  );

  if (candidateValue >= targetAmount) {
    while (
      candidateMonths > 0 &&
      roundCurrency(
        calculateFutureValue(
          initialValue,
          monthlyContribution,
          monthlyRate,
          candidateMonths - 1
        )
      ) >= targetAmount
    ) {
      candidateMonths -= 1;
    }

    return candidateMonths;
  }

  return candidateMonths + 1;
}

function buildTimeline(
  initialValue: number,
  monthlyContribution: number,
  monthlyRate: number,
  totalMonths: number,
  periodType: CompoundInterestPeriodType
) {
  const monthlyTimeline: CompoundInterestTimelinePoint[] = [];
  let invested = initialValue;
  let totalValue = initialValue;

  for (let month = 1; month <= totalMonths; month += 1) {
    totalValue = totalValue * (1 + monthlyRate) + monthlyContribution;
    invested += monthlyContribution;

    monthlyTimeline.push({
      label: `${month}m`,
      invested: roundCurrency(invested),
      interest: roundCurrency(totalValue - invested)
    });
  }

  if (periodType === "months") {
    return monthlyTimeline;
  }

  const yearlyTimeline: CompoundInterestTimelinePoint[] = [];
  const fullYears = Math.floor(totalMonths / 12);

  for (let year = 1; year <= fullYears; year += 1) {
    const monthlyPoint = monthlyTimeline[year * 12 - 1];
    yearlyTimeline.push({
      label: year === 1 ? "1 ano" : `${year} anos`,
      invested: monthlyPoint?.invested ?? 0,
      interest: monthlyPoint?.interest ?? 0
    });
  }

  const remainderMonths = totalMonths % 12;
  if (remainderMonths > 0) {
    const monthlyPoint = monthlyTimeline[totalMonths - 1];
    const yearLabel = fullYears + 1;
    yearlyTimeline.push({
      label: yearLabel === 1 ? "1 ano" : `${yearLabel} anos`,
      invested: monthlyPoint?.invested ?? 0,
      interest: monthlyPoint?.interest ?? 0
    });
  }

  return yearlyTimeline;
}

export function calculateCompoundInterest(
  input: CompoundInterestInput
): CompoundInterestResult {
  const monthlyRate = getMonthlyRate(
    input.interestRate,
    input.interestRateType
  );
  const totalMonths = getTotalMonths(input.periodAmount, input.periodType);
  const totalFinal = calculateFutureValue(
    input.initialValue,
    input.monthlyContribution,
    monthlyRate,
    totalMonths
  );
  const totalInvested =
    input.initialValue + input.monthlyContribution * totalMonths;

  return {
    totalFinal: roundCurrency(totalFinal),
    totalInvested: roundCurrency(totalInvested),
    totalInterest: roundCurrency(totalFinal - totalInvested),
    timeline: buildTimeline(
      input.initialValue,
      input.monthlyContribution,
      monthlyRate,
      totalMonths,
      input.periodType
    )
  };
}

export function calculateTimeToGoal(
  input: CompoundInterestGoalInput
): CompoundInterestGoalResult {
  const monthlyRate = getMonthlyRate(
    input.interestRate,
    input.interestRateType
  );
  const totalMonths = calculateTimeToGoalFast(
    input.initialValue,
    input.monthlyContribution,
    monthlyRate,
    input.targetAmount
  );
  const totalFinal = calculateFutureValue(
    input.initialValue,
    input.monthlyContribution,
    monthlyRate,
    totalMonths
  );
  const totalInvested =
    input.initialValue + input.monthlyContribution * totalMonths;

  return {
    totalMonths,
    totalYears: Math.floor(totalMonths / 12),
    totalMonthsAfterYears: Math.floor(totalMonths % 12),
    totalFinal: roundCurrency(totalFinal),
    totalInvested: roundCurrency(totalInvested),
    totalInterest: roundCurrency(totalFinal - totalInvested),
    timeline: buildTimeline(
      input.initialValue,
      input.monthlyContribution,
      monthlyRate,
      totalMonths,
      input.periodType
    )
  };
}

export function calculateTimeToYield(
  input: CompoundInterestYieldInput
): CompoundInterestGoalResult {
  // Convert annual effective rate (%) to monthly effective rate (decimal)
  const monthlyRate = Math.pow(1 + input.annualInterestRate / 100, 1 / 12) - 1;
  const targetMonthlyInterest = input.targetMonthlyInterest;

  if (targetMonthlyInterest <= 0) {
    throw new Error("Target rendimento inválido");
  }

  if (monthlyRate === 0) {
    throw new Error("Target amount unreachable");
  }

  // Required final total so that final * monthlyRate = targetMonthlyInterest
  const requiredFinal = targetMonthlyInterest / monthlyRate;

  // If already reached
  if (requiredFinal <= input.initialValue) {
    const totalMonths = 0;
    const totalFinal = calculateFutureValue(
      input.initialValue,
      input.monthlyContribution,
      monthlyRate,
      totalMonths
    );
    const totalInvested =
      input.initialValue + input.monthlyContribution * totalMonths;

    return {
      totalMonths,
      totalYears: Math.round(totalMonths / 12),
      totalMonthsAfterYears: totalMonths % 12,
      totalFinal: roundCurrency(totalFinal),
      totalInvested: roundCurrency(totalInvested),
      totalInterest: roundCurrency(totalFinal - totalInvested),
      timeline: buildTimeline(
        input.initialValue,
        input.monthlyContribution,
        monthlyRate,
        totalMonths,
        input.periodType
      )
    };
  }

  // Use fast solver with monthlyRate and required final amount
  const totalMonths = calculateTimeToGoalFast(
    input.initialValue,
    input.monthlyContribution,
    monthlyRate,
    requiredFinal
  );

  const totalFinal = calculateFutureValue(
    input.initialValue,
    input.monthlyContribution,
    monthlyRate,
    totalMonths
  );
  const totalInvested =
    input.initialValue + input.monthlyContribution * totalMonths;

  return {
    totalMonths,
    totalYears: Math.round(totalMonths / 12),
    totalMonthsAfterYears: totalMonths % 12,
    totalFinal: roundCurrency(totalFinal),
    totalInvested: roundCurrency(totalInvested),
    totalInterest: roundCurrency(totalFinal - totalInvested),
    timeline: buildTimeline(
      input.initialValue,
      input.monthlyContribution,
      monthlyRate,
      totalMonths,
      input.periodType
    )
  };
}

export function calculateInflationAdjustedResult(
  input: InflationAdjustedInput
): InflationAdjustedResult {
  const inflationMonthlyRate = getMonthlyRate(
    input.inflationRate,
    input.inflationRateType
  );
  const totalMonths = getTotalMonths(
    input.totalPeriodAmount,
    input.totalPeriodType
  );
  const discountFactor = Math.pow(1 + inflationMonthlyRate, totalMonths);
  const inflationAdjustedFinal = input.result.totalFinal / discountFactor;

  const inflationAdjustedTimeline = input.result.timeline.map(
    (point, index) => {
      const monthsElapsed =
        input.totalPeriodType === "months" ? index + 1 : (index + 1) * 12;
      const pointDiscount = Math.pow(1 + inflationMonthlyRate, monthsElapsed);

      return {
        label: point.label,
        invested: point.invested / pointDiscount,
        interest: point.interest / pointDiscount
      };
    }
  );

  const adjustedInvested =
    inflationAdjustedTimeline.length > 0
      ? inflationAdjustedTimeline[inflationAdjustedTimeline.length - 1].invested
      : 0;

  return {
    inflationAdjustedFinal,
    inflationAdjustedInterest: inflationAdjustedFinal - adjustedInvested,
    inflationAdjustedTimeline
  };
}
