export type FinancingSystemType = "PRICE" | "SAC";

export interface FinancingEntry {
  id?: number;
  name: string; // e.g., "Casa", "Carro", "Financiamento 1"
  propertyValue: number; // Valor do imóvel/bem
  downPayment: number; // Entrada
  annualInterestRate: number; // Taxa de juros anual (%)
  termMonths: number; // Prazo em meses
  systemType: FinancingSystemType; // PRICE or SAC
  createdAt?: number;
}

export interface FinancingComparison {
  financing1: FinancingEntry;
  financing2: FinancingEntry;
  monthlyPaymentDiff: number;
  totalInterestDiff: number;
  totalPaidDiff: number;
  isFinancing2Better: boolean;
}
