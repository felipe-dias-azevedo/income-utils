export const JornadaType = {
  FORTY_HOURS: "40h",
  FORTY_FOUR_HOURS: "44h"
} as const;

export type JornadaType = (typeof JornadaType)[keyof typeof JornadaType];

export interface IncomeEntry {
  id?: number;
  salarioMensal: number;
  bonusMultiplier: number; // Stored as multiplier (e.g., 1.5 for 150% of salary)
  outros: number;
  jornada: JornadaType;
  color?: string; // Radix UI color (e.g., "red", "blue", "transparent")
  createdAt?: number;
}

export interface ComputedIncome extends IncomeEntry {
  id: number;
  salarioBruto: number;
  salarioAnual: number;
  bonusAmount: number;
  bonusLiquido: number;
  outrosAnual: number;
  totalPerYear: number;
  totalPerMonth: number;
  totalPerMonthPlusOthers: number;
  totalPerYearPlusOthers: number;
  salarioLiquido: number;
  totalMesLiquido: number;
  salarioHora: number;
}
