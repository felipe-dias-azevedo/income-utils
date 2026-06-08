import type { ComputedIncome, IncomeEntry } from "../types/income";
import { JornadaType } from "../types/income";
import { TaxTableStrategy } from "./taxCalculations";
import "../extensions/number.extensions";

function getWorkweekHours(jornada: JornadaType): number {
  switch (jornada) {
    case JornadaType.FORTY_HOURS:
      return 40;
    case JornadaType.FORTY_FOUR_HOURS:
      return 44;
    case JornadaType.THIRTY_SIX_HOURS:
      return 36;
    default:
      return 40;
  }
}

function getBonus(entry: IncomeEntry, grossMonth: number) {
  switch (entry.plrType) {
    case "fixed":
      return entry.bonusFixed;
    case "multiplier":
      return grossMonth * entry.bonusMultiplier;
  }
}

function calculateHourly(value: number, workweekHours: number): number {
  return value / 52 / 5 / workweekHours;
}

function calculateOvertimeHour(monthly: number, workweekHours: number): number {
  return monthly / (workweekHours * 5);
}

export function computeBonus(
  grossBonus: number,
  taxCalculator: TaxTableStrategy
) {
  const irBonus = taxCalculator.calculateBonusIR(grossBonus);
  const netBonus = grossBonus - irBonus;

  return {
    grossBonus,
    netBonus,
    irBonus
  };
}

export function computeMonthlyIncome(
  grossMonth: number,
  benefits: number,
  taxCalculator: TaxTableStrategy
) {
  const grossMonthPlusBenefits = grossMonth + benefits;
  const inss = taxCalculator.calculateINSS(grossMonth);
  const irDeduction = taxCalculator.getIRDeduction(grossMonth, inss);
  const ir = taxCalculator.calculateIR(grossMonth - irDeduction, grossMonth);
  const netMonth = (grossMonth - inss - ir).round();
  const netMonthPlusBenefits = (netMonth + benefits).round();

  return {
    grossMonth,
    grossMonthPlusBenefits,
    inss,
    ir,
    netMonth,
    netMonthPlusBenefits
  };
}

export function computeIncome(
  entry: IncomeEntry,
  taxCalculator: TaxTableStrategy
): ComputedIncome {
  const workweekHours = getWorkweekHours(entry.workweekHoursType) / 5;

  const benefits = entry.benefits;
  const paidMonths = entry.paidMonths ?? 12;

  // Monthly
  const {
    grossMonth,
    grossMonthPlusBenefits,
    inss,
    ir,
    netMonth,
    netMonthPlusBenefits
  } = computeMonthlyIncome(entry.grossMonth, benefits, taxCalculator);

  // Yearly
  const grossYear = grossMonth * paidMonths;
  const grossBonus = getBonus(entry, grossMonth);
  const benefitsYear = benefits * paidMonths;
  const grossYearPlusBonus = grossYear + grossBonus;
  const grossYearPlusBonusPlusBenefits = grossYear + grossBonus + benefitsYear;
  const netYear = netMonth * paidMonths;
  const { netBonus } = computeBonus(grossBonus, taxCalculator);
  const netYearPlusBonus = netYear + netBonus;
  const netYearPlusBonusPlusBenefits = netYear + netBonus + benefitsYear;

  // Hourly
  const grossHour = calculateHourly(grossYear, workweekHours);
  const grossHourPlusBenefits = calculateHourly(
    grossYear + benefitsYear,
    workweekHours
  );
  const netHour = calculateHourly(netYear, workweekHours);
  const netHourPlusBenefits = calculateHourly(
    netYear + benefitsYear,
    workweekHours
  );
  const overtimeHour = calculateOvertimeHour(grossMonth, workweekHours * 5);

  // Monthly total
  const grossMonthTotal = grossYearPlusBonus / 12;
  const grossMonthTotalPlusBenefits = grossYearPlusBonusPlusBenefits / 12;
  const netMonthTotal = netYearPlusBonus / 12;
  const netMonthTotalPlusBenefits = netYearPlusBonusPlusBenefits / 12;

  return {
    ...entry,
    id: entry.id || 0,
    workweekHours,
    benefits,
    paidMonths,
    grossMonth,
    grossMonthPlusBenefits,
    inss,
    ir,
    netMonth,
    netMonthPlusBenefits,
    grossYear,
    grossBonus,
    benefitsYear,
    grossYearPlusBonus,
    grossYearPlusBonusPlusBenefits,
    netYear,
    netBonus,
    netYearPlusBonus,
    netYearPlusBonusPlusBenefits,
    grossHour,
    grossHourPlusBenefits,
    netHour,
    netHourPlusBenefits,
    overtimeHour,
    grossMonthTotal,
    grossMonthTotalPlusBenefits,
    netMonthTotal,
    netMonthTotalPlusBenefits
  };
}
