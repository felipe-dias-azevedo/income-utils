// ===== Base Types =====
export type ProgressiveBracket = Readonly<{
  /** Upper limit of the bracket (inclusive). Use Infinity for the last bracket */
  upTo: number;
  /** Tax rate (e.g., 0.075) */
  rate: number;
  /** Deduction amount (e.g., 182.16) */
  deduction: number;
}>;

export type ProgressiveTaxTable = Readonly<{
  /** Name for debugging/logging */
  name: string;
  /** Brackets sorted by upTo ascending */
  brackets: ReadonlyArray<ProgressiveBracket>;
  /** Optional: caps the base (ceiling). E.g., INSS ceiling */
  capBase?: number;
}>;

export interface TaxBracket {
  calculateINSS(gross: number): number;
  calculateIR(irBase: number): number;
  calculateBonusIR(annualBonus: number): number;
}

// ===== Utility Functions =====
export function calculateProgressiveTax(
  base: number,
  table: ProgressiveTaxTable
): number {
  if (!Number.isFinite(base) || base < 0) {
    throw new Error(
      `Base (${table.name}) must be a finite number >= 0. Received: ${base}`
    );
  }

  const effectiveBase = table.capBase ? Math.min(base, table.capBase) : base;

  const bracket = table.brackets.find((b) => effectiveBase <= b.upTo);

  if (!bracket) {
    throw new Error(
      `Invalid table (${table.name}): no bracket covers base ${effectiveBase}`
    );
  }

  const tax = effectiveBase * bracket.rate - bracket.deduction;

  return Math.max(0, tax);
}

// ===== Tax Calculator Implementation =====
export class TaxTableStrategy implements TaxBracket {
  private readonly inssTable: ProgressiveTaxTable;
  private readonly irTable: ProgressiveTaxTable;
  private readonly bonusIrTable: ProgressiveTaxTable;

  constructor(
    inssTable: ProgressiveTaxTable,
    irTable: ProgressiveTaxTable,
    bonusIrTable: ProgressiveTaxTable
  ) {
    this.inssTable = inssTable;
    this.irTable = irTable;
    this.bonusIrTable = bonusIrTable;
  }

  calculateINSS(gross: number): number {
    return calculateProgressiveTax(gross, this.inssTable);
  }

  calculateIR(irBase: number): number {
    return calculateProgressiveTax(irBase, this.irTable);
  }

  calculateBonusIR(annualBonus: number): number {
    return calculateProgressiveTax(annualBonus, this.bonusIrTable);
  }
}

// ===== Tax Tables =====
// Shared IR tables (unchanged between 2025 and 2026)
const IR_MENSAL: ProgressiveTaxTable = {
  name: "IRRF Monthly",
  brackets: [
    { upTo: 2428.8, rate: 0, deduction: 0 },
    { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
    { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
    { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
    { upTo: Infinity, rate: 0.275, deduction: 908.73 }
  ]
};

const IR_PLR: ProgressiveTaxTable = {
  name: "IR PLR",
  brackets: [
    { upTo: 8214.4, rate: 0, deduction: 0 },
    { upTo: 9922.28, rate: 0.075, deduction: 616.08 },
    { upTo: 13167.0, rate: 0.15, deduction: 1360.25 },
    { upTo: 16380.38, rate: 0.225, deduction: 2347.78 },
    { upTo: Infinity, rate: 0.275, deduction: 3166.8 }
  ]
};

// INSS tables
const INSS_2025: ProgressiveTaxTable = {
  name: "INSS 2025",
  capBase: 8157.41,
  brackets: [
    { upTo: 1518.0, rate: 0.075, deduction: 0 },
    { upTo: 2793.88, rate: 0.09, deduction: 22.77 },
    { upTo: 4190.83, rate: 0.12, deduction: 106.59 },
    { upTo: 8157.41, rate: 0.14, deduction: 190.4 }
  ]
};

const INSS_2026: ProgressiveTaxTable = {
  name: "INSS 2026",
  capBase: 8475.55,
  brackets: [
    { upTo: 1621.0, rate: 0.075, deduction: 0 },
    { upTo: 2902.84, rate: 0.09, deduction: 24.32 },
    { upTo: 4354.27, rate: 0.12, deduction: 111.4 },
    { upTo: 8475.55, rate: 0.14, deduction: 198.49 }
  ]
};

// ===== IRRF Reduction for 2026 =====
/**
 * Calculates the monthly IRRF reduction for 2026 (Law 15.270/2025).
 * Applies to taxable income up to 7350.
 */
function calculateIRRFReduction2026(taxableIncome: number): number {
  if (!Number.isFinite(taxableIncome) || taxableIncome < 0) return 0;

  if (taxableIncome <= 5000) return 312.89;

  if (taxableIncome <= 7350) {
    return Math.max(0, 978.62 - 0.133145 * taxableIncome);
  }

  return 0;
}

// ===== Tax Calculators by Year =====
/** Tax calculator for 2025 */
export class Tax2025 extends TaxTableStrategy {
  constructor() {
    super(INSS_2025, IR_MENSAL, IR_PLR);
  }
}

/**
 * Tax calculator for 2026.
 * Includes updated INSS brackets and IRRF reduction.
 */
export class Tax2026 extends TaxTableStrategy {
  constructor() {
    super(INSS_2026, IR_MENSAL, IR_PLR);
  }

  /**
   * Calculates IR with 2026 reduction applied.
   * @param irBase - Base for IR calculation
   * @param taxableIncome - Taxable income for reduction (defaults to irBase)
   */
  override calculateIR(irBase: number, taxableIncome: number = irBase): number {
    const taxFromTable = super.calculateIR(irBase);
    const reduction = calculateIRRFReduction2026(taxableIncome);
    return Math.max(0, taxFromTable - reduction);
  }
}
