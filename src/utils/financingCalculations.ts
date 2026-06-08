/**
 * Financing Calculations for Brazilian mortgages and loans
 * Supports both PRICE and SAC amortization systems
 */

export interface FinancingCalculation {
  propertyValue: number;
  downPayment: number;
  loanAmount: number;
  annualInterestRate: number;
  monthlyInterestRate: number;
  termMonths: number;
  systemType: "PRICE" | "SAC";
  monthlyPayment: number; // For PRICE, all equal. For SAC, average
  totalPaid: number;
  totalInterest: number;
  monthlyBreakdown: MonthlyPayment[];
}

export interface MonthlyPayment {
  month: number;
  principal: number;
  interest: number;
  payment: number;
  remainingBalance: number;
}

/**
 * Calculate financing using PRICE system (fixed installments)
 * All monthly payments are equal
 */
export function calculatePRICEFinancing(
  propertyValue: number,
  downPayment: number,
  annualInterestRate: number,
  termMonths: number
): FinancingCalculation {
  const loanAmount = propertyValue - downPayment;
  const monthlyRate = annualInterestRate / 100 / 12;

  if (monthlyRate === 0) {
    // No interest
    const monthlyPayment = loanAmount / termMonths;
    const breakdown: MonthlyPayment[] = [];
    let remaining = loanAmount;

    for (let month = 1; month <= termMonths; month++) {
      const principal = monthlyPayment;
      const interest = 0;
      remaining -= principal;

      breakdown.push({
        month,
        principal,
        interest,
        payment: monthlyPayment,
        remainingBalance: Math.max(0, remaining)
      });
    }

    return {
      propertyValue,
      downPayment,
      loanAmount,
      annualInterestRate,
      monthlyInterestRate: 0,
      termMonths,
      systemType: "PRICE",
      monthlyPayment,
      totalPaid: loanAmount + downPayment,
      totalInterest: 0,
      monthlyBreakdown: breakdown
    };
  }

  // PRICE formula: PMT = P × [i(1+i)^n] / [(1+i)^n - 1]
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  const monthlyPayment = loanAmount * (numerator / denominator);

  const breakdown: MonthlyPayment[] = [];
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    totalInterestPaid += interestPayment;

    breakdown.push({
      month,
      principal: principalPayment,
      interest: interestPayment,
      payment: monthlyPayment,
      remainingBalance: Math.max(0, remainingBalance)
    });
  }

  const totalPaid = monthlyPayment * termMonths + downPayment;

  return {
    propertyValue,
    downPayment,
    loanAmount,
    annualInterestRate,
    monthlyInterestRate: monthlyRate * 100,
    termMonths,
    systemType: "PRICE",
    monthlyPayment,
    totalPaid,
    totalInterest: totalInterestPaid,
    monthlyBreakdown: breakdown
  };
}

/**
 * Calculate financing using SAC system (constant amortization)
 * Principal payment is constant, interest decreases over time
 */
export function calculateSACFinancing(
  propertyValue: number,
  downPayment: number,
  annualInterestRate: number,
  termMonths: number
): FinancingCalculation {
  const loanAmount = propertyValue - downPayment;
  const monthlyRate = annualInterestRate / 100 / 12;

  // Monthly amortization is constant
  const principalPayment = loanAmount / termMonths;

  const breakdown: MonthlyPayment[] = [];
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const totalPayment = principalPayment + interestPayment;
    remainingBalance -= principalPayment;
    totalInterestPaid += interestPayment;

    breakdown.push({
      month,
      principal: principalPayment,
      interest: interestPayment,
      payment: totalPayment,
      remainingBalance: Math.max(0, remainingBalance)
    });
  }

  const averageMonthlyPayment = (loanAmount + totalInterestPaid) / termMonths;
  const totalPaid = loanAmount + totalInterestPaid + downPayment;

  return {
    propertyValue,
    downPayment,
    loanAmount,
    annualInterestRate,
    monthlyInterestRate: monthlyRate * 100,
    termMonths,
    systemType: "SAC",
    monthlyPayment: averageMonthlyPayment,
    totalPaid,
    totalInterest: totalInterestPaid,
    monthlyBreakdown: breakdown
  };
}

/**
 * Compare two financing scenarios
 */
export function compareFinancing(
  financing1: FinancingCalculation,
  financing2: FinancingCalculation
) {
  return {
    monthlyPaymentDifference:
      financing2.monthlyPayment - financing1.monthlyPayment,
    totalInterestDifference:
      financing2.totalInterest - financing1.totalInterest,
    totalPaidDifference: financing2.totalPaid - financing1.totalPaid,
    betterOption: financing2.totalInterest < financing1.totalInterest ? 2 : 1
  };
}
