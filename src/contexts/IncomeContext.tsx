import { createContext, useContext } from "react";
import type { ComputedIncome, IncomeEntry } from "../types/income";

export interface IncomeContextType {
  incomes: ComputedIncome[];
  isLoading: boolean;
  actions: {
    isLoadingAction: boolean;
    add: (
      entry: IncomeEntry,
      onError: (error: unknown) => void
    ) => Promise<void>;
    deleteById: (
      id: number,
      onError: (error: unknown) => void
    ) => Promise<void>;
    update: (
      id: number,
      entry: IncomeEntry,
      onError: (error: unknown) => void
    ) => Promise<void>;
    reorder: (
      reorderedIncomes: ComputedIncome[],
      onError: (error: unknown) => void
    ) => Promise<void>;
  };
}

export const IncomeContext = createContext<IncomeContextType | undefined>(
  undefined
);

export function useIncomeContext(): IncomeContextType {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error("useIncomeContext must be used within an IncomeProvider");
  }
  return context;
}
