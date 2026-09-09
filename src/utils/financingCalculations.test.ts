import { describe, expect, it } from "vitest";
import {
  calculatePRICEFinancing,
  calculateSACFinancing,
  type FinancingCalculation
} from "./financingCalculations";

interface FinancingCase {
  id: string;
  system: "PRICE" | "SAC";
  amount: number;
  termMonths: number;
  monthlyRate: number;
  expectedPayment: number;
  expectedInterest: number;
}

const financingCases: FinancingCase[] = [
  {
    id: "FIN-001",
    system: "PRICE",
    amount: 100000,
    termMonths: 12,
    monthlyRate: 1,
    expectedPayment: 8884.878868,
    expectedInterest: 6618.546414
  },
  {
    id: "FIN-002",
    system: "PRICE",
    amount: 100000,
    termMonths: 60,
    monthlyRate: 1,
    expectedPayment: 2224.444768,
    expectedInterest: 33466.686109
  },
  {
    id: "FIN-003",
    system: "PRICE",
    amount: 250000,
    termMonths: 120,
    monthlyRate: 0.8,
    expectedPayment: 3248.642292,
    expectedInterest: 139837.075098
  },
  {
    id: "FIN-004",
    system: "PRICE",
    amount: 500000,
    termMonths: 240,
    monthlyRate: 0.7,
    expectedPayment: 4307.522477,
    expectedInterest: 533805.394421
  },
  {
    id: "FIN-005",
    system: "PRICE",
    amount: 50000,
    termMonths: 24,
    monthlyRate: 1.5,
    expectedPayment: 2496.205098,
    expectedInterest: 9908.922363
  },
  {
    id: "FIN-006",
    system: "PRICE",
    amount: 200000,
    termMonths: 180,
    monthlyRate: 0,
    expectedPayment: 1111.111111,
    expectedInterest: 0
  },
  {
    id: "FIN-007",
    system: "PRICE",
    amount: 100000,
    termMonths: 1,
    monthlyRate: 1,
    expectedPayment: 101000,
    expectedInterest: 1000
  },
  {
    id: "FIN-008",
    system: "PRICE",
    amount: 100000,
    termMonths: 360,
    monthlyRate: 0.5,
    expectedPayment: 599.550525,
    expectedInterest: 115838.189055
  },
  {
    id: "FIN-009",
    system: "SAC",
    amount: 100000,
    termMonths: 12,
    monthlyRate: 1,
    expectedPayment: 8875,
    expectedInterest: 6500
  },
  {
    id: "FIN-010",
    system: "SAC",
    amount: 100000,
    termMonths: 60,
    monthlyRate: 1,
    expectedPayment: 2175,
    expectedInterest: 30500
  },
  {
    id: "FIN-011",
    system: "SAC",
    amount: 250000,
    termMonths: 120,
    monthlyRate: 0.8,
    expectedPayment: 3091.666667,
    expectedInterest: 121000
  },
  {
    id: "FIN-012",
    system: "SAC",
    amount: 500000,
    termMonths: 240,
    monthlyRate: 0.7,
    expectedPayment: 3840.625,
    expectedInterest: 421750
  },
  {
    id: "FIN-013",
    system: "SAC",
    amount: 50000,
    termMonths: 24,
    monthlyRate: 1.5,
    expectedPayment: 2473.958333,
    expectedInterest: 9375
  },
  {
    id: "FIN-014",
    system: "SAC",
    amount: 200000,
    termMonths: 180,
    monthlyRate: 0,
    expectedPayment: 1111.111111,
    expectedInterest: 0
  },
  {
    id: "FIN-015",
    system: "SAC",
    amount: 100000,
    termMonths: 1,
    monthlyRate: 1,
    expectedPayment: 101000,
    expectedInterest: 1000
  },
  {
    id: "FIN-016",
    system: "SAC",
    amount: 100000,
    termMonths: 360,
    monthlyRate: 0.5,
    expectedPayment: 528.472222,
    expectedInterest: 90250
  }
];

function calculateCase(financingCase: FinancingCase): FinancingCalculation {
  const annualInterestRate = financingCase.monthlyRate * 12;

  return financingCase.system === "PRICE"
    ? calculatePRICEFinancing(
        financingCase.amount,
        0,
        annualInterestRate,
        financingCase.termMonths
      )
    : calculateSACFinancing(
        financingCase.amount,
        0,
        annualInterestRate,
        financingCase.termMonths
      );
}

describe("financing calculations", () => {
  for (const financingCase of financingCases) {
    it(`${financingCase.id} calculates ${financingCase.system} financing`, () => {
      const result = calculateCase(financingCase);

      expect(result.propertyValue).toBe(financingCase.amount);
      expect(result.downPayment).toBe(0);
      expect(result.loanAmount).toBe(financingCase.amount);
      expect(result.monthlyInterestRate).toBeCloseTo(
        financingCase.monthlyRate,
        12
      );
      expect(result.termMonths).toBe(financingCase.termMonths);
      expect(result.systemType).toBe(financingCase.system);
      expect(result.monthlyPayment).toBeCloseTo(
        financingCase.expectedPayment,
        2
      );
      expect(result.totalInterest).toBeCloseTo(
        financingCase.expectedInterest,
        2
      );
      expect(result.totalPaid).toBeCloseTo(
        financingCase.amount + financingCase.expectedInterest,
        2
      );
      expect(result.monthlyBreakdown).toHaveLength(financingCase.termMonths);
      expect(result.monthlyBreakdown.at(-1)?.remainingBalance).toBeCloseTo(
        0,
        8
      );

      const principalPaid = result.monthlyBreakdown.reduce(
        (total, payment) => total + payment.principal,
        0
      );
      expect(principalPaid).toBeCloseTo(financingCase.amount, 6);
    });
  }
});
