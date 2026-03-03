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
  grossMonth: number;
  plrType: "multiplier" | "fixed"; // Type of PLR value
  bonusMultiplier: number; // Stored as multiplier (e.g., 1.5 for 150% of salary)
  bonusFixed: number; // If PLR is a fixed value
  benefits: number;
  workweekHoursType: JornadaType;
  color?: string; // Radix UI color (e.g., "red", "blue", "transparent")
  paidMonths: number; // Number of months the salary is paid (e.g., 12 or 13)
  createdAt?: number;
  index: number; // Position in the table for drag-and-drop reordering
}

export interface ComputedIncome extends IncomeEntry {
  id: number;
  workweekHours: number;
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
