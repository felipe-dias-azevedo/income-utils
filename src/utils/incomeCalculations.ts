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

export function computeIncome(entry: IncomeEntry): ComputedIncome {
  const salarioMensal = entry.salarioMensal;
  const bonusAmountAnual = salarioMensal * entry.bonusMultiplier; // Annual bonus
  const outros = entry.outros;

  // Calculate gross amounts
  const salarioBruto = salarioMensal;
  const salarioAnual = salarioMensal * 12;
  const totalPerYear = salarioAnual + bonusAmountAnual;
  const totalPerMonth = totalPerYear / 12;
  const totalPerMonthPlusOthers = totalPerMonth + outros;
  const totalPerYearPlusOthers = totalPerYear + outros * 12;

  // Calculate hourly salary: annual salary / 52 weeks / 5 days / (hours per day)
  const jornadaHours = entry.jornada === JornadaType.FORTY_HOURS ? 40 : 44;
  const hoursPerDay = jornadaHours / 5;
  const salarioHora = salarioAnual / 52 / 5 / hoursPerDay;

  // Calculate net salary using proper Brazilian tax system
  const inss = calculateINSS(salarioBruto);
  const baseIR = salarioBruto - inss;
  const ir = calculateIR(baseIR);
  const salarioLiquido = Math.round((salarioBruto - inss - ir) * 100) / 100;

  return {
    ...entry,
    id: entry.id || 0,
    salarioBruto,
    salarioAnual,
    bonusAmount: bonusAmountAnual,
    totalPerYear,
    totalPerMonth,
    totalPerMonthPlusOthers,
    totalPerYearPlusOthers,
    salarioLiquido,
    totalMesLiquido: Math.round((salarioLiquido + outros) * 100) / 100,
    bonusLiquido:
      Math.round(
        (bonusAmountAnual - calculateBonusIR(bonusAmountAnual)) * 100
      ) / 100,
    salarioHora,
    outrosAnual: outros * 12
  };
}

export function getJornadaLabel(jornada: JornadaType): string {
  return jornada === JornadaType.FORTY_HOURS ? "40h" : "44h";
}
