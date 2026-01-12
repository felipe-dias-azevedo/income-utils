export const JornadaType = {
  THIRTY_SIX_HOURS: "36h",
  FORTY_HOURS: "40h",
  FORTY_FOUR_HOURS: "44h"
} as const;

export type JornadaType = (typeof JornadaType)[keyof typeof JornadaType];

// TODO: translate to english
export interface IncomeEntry {
  id?: number;
  name: string; // Name for the income entry (max 12 characters)
  description?: string; // Optional description (max 30 characters)
  salarioMensal: number;
  bonusMultiplier: number; // Stored as multiplier (e.g., 1.5 for 150% of salary)
  outros: number;
  jornada: JornadaType;
  color?: string; // Radix UI color (e.g., "red", "blue", "transparent")
  paidMonths: number; // Number of months the salary is paid (e.g., 12 or 13)
  createdAt?: number;
  index: number; // Position in the table for drag-and-drop reordering
}

export interface ComputedIncome extends IncomeEntry {
  id: number;
  workweekHours: number;
  benefits: number;
  paidMonths: number;
  grossMonth: number;
  grossMonthPlusBenefits: number;
  inss: number;
  ir: number;
  netMonth: number;
  netMonthPlusBenefits: number;
  grossYear: number;
  grossBonus: number;
  benefitsYear: number;
  grossYearPlusBonus: number;
  grossYearPlusBonusPlusBenefits: number;
  netYear: number;
  netBonus: number;
  netYearPlusBonus: number;
  netYearPlusBonusPlusBenefits: number;
  grossHour: number;
  grossHourPlusBenefits: number;
  netHour: number;
  netHourPlusBenefits: number;
}
