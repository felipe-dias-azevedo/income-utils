export const JornadaType = {
  THIRTY_SIX_HOURS: "36h",
  FORTY_HOURS: "40h",
  FORTY_FOUR_HOURS: "44h"
} as const;

export type JornadaType = (typeof JornadaType)[keyof typeof JornadaType];

export interface IncomeEntry {
  id?: number;
  name: string; // Name for the income entry (max 12 characters)
  description?: string; // Optional description (max 30 characters)
  salarioMensal: number;
  bonusMultiplier: number; // Stored as multiplier (e.g., 1.5 for 150% of salary)
  outros: number;
  jornada: JornadaType;
  color?: string; // Radix UI color (e.g., "red", "blue", "transparent")
  createdAt?: number;
  index: number; // Position in the table for drag-and-drop reordering
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
  totalAnoLiquido: number;
  salarioAnualLiquido: number;
  totalAnoOutrosLiquido: number;
  salarioHora: number;
  salarioHoraAnual: number;
  salarioHoraAnualOutros: number;
  salarioHoraLiquido: number;
  salarioHoraAnualLiquido: number;
  salarioHoraAnualOutrosLiquido: number;
}
