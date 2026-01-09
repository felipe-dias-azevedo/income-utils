import { type ReactNode } from "react";
import { IncomeContext } from "../contexts/IncomeContext";
import useIncome from "./useIncome";

export function IncomeProvider({ children }: { children: ReactNode }) {
  const income = useIncome();

  return (
    <IncomeContext.Provider value={income}>{children}</IncomeContext.Provider>
  );
}
