import type { ComputedIncome, IncomeEntry } from "../types/income";
import { JornadaType } from "../types/income";

// Calculate INSS based on Brazilian tax brackets (2024)
function calculateINSS(bruto: number): number {
  if (bruto <= 1518) {
    return bruto * 0.075;
  } else if (bruto <= 2793.88) {
    return bruto * 0.09 - 22.77;
  } else if (bruto <= 4190.83) {
    return bruto * 0.12 - 106.59;
  } else if (bruto <= 8157.41) {
    return bruto * 0.14 - 190.4;
  } else {
    return 8157.41 * 0.14 - 190.4;
  }
}

// Calculate IR (Income Tax) based on Brazilian tax brackets
function calculateIR(baseIR: number): number {
  // TODO: update for 2026 tax data
  if (baseIR <= 2428.8) {
    return 0;
  } else if (baseIR <= 2826.65) {
    return baseIR * 0.075 - 182.16;
  } else if (baseIR <= 3751.05) {
    return baseIR * 0.15 - 394.16;
  } else if (baseIR <= 4664.68) {
    return baseIR * 0.225 - 675.49;
  } else {
    return baseIR * 0.275 - 908.73;
  }
}

// Calculate IR for bonus (PLR) based on Brazilian tax brackets
function calculateBonusIR(bonusAnual: number): number {
  if (bonusAnual <= 8214.4) {
    return 0;
  } else if (bonusAnual <= 9922.28) {
    return bonusAnual * 0.075 - 616.08;
  } else if (bonusAnual <= 13167.0) {
    return bonusAnual * 0.15 - 1360.25;
  } else if (bonusAnual <= 16380.38) {
    return bonusAnual * 0.225 - 2347.78;
  } else {
    return bonusAnual * 0.275 - 3166.8;
  }
}

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

function calculateHourly(value: number, workweekHours: number): number {
  return value / 52 / 5 / workweekHours;
}

export function computeIncome(entry: IncomeEntry): ComputedIncome {
  const workweekHours = getWorkweekHours(entry.jornada) / 5;

  const benefits = entry.outros;
  const paidMonths = entry.paidMonths ?? 12;

  // Monthly
  const grossMonth = entry.salarioMensal;
  const grossMonthPlusBenefits = grossMonth + benefits;
  const inss = calculateINSS(grossMonth);
  const ir = calculateIR(grossMonth - inss);
  const netMonth = grossMonth - inss - ir;
  const netMonthPlusBenefits = netMonth + benefits;

  // Yearly
  const grossYear = grossMonth * paidMonths;
  const grossBonus = grossMonth * entry.bonusMultiplier;
  const benefitsYear = benefits * paidMonths;
  const grossYearPlusBonus = grossYear + grossBonus;
  const grossYearPlusBonusPlusBenefits = grossYear + grossBonus + benefitsYear;
  const netYear = netMonth * paidMonths;
  const netBonus = grossBonus - calculateBonusIR(grossBonus);
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
    netHourPlusBenefits
  };
}
