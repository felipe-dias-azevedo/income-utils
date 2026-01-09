import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { useEffect, useMemo, useState } from "react";
import type { ComputedIncome, IncomeEntry } from "../types/income";
import { computeIncome } from "../utils/incomeCalculations";
import type { IncomeContextType } from "../contexts/IncomeContext";

export default function useIncome(): IncomeContextType {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const incomeEntries = useLiveQuery(
    () => db.incomes.orderBy("index").toArray(),
    []
  );

  const incomes: ComputedIncome[] = useMemo(
    () => (incomeEntries || []).map(computeIncome),
    [incomeEntries]
  );

  useEffect(() => {
    if (incomeEntries !== undefined) {
      setIsLoading(false);
    }
  }, [incomeEntries]);

  const add = async (entry: IncomeEntry, onError: (error: unknown) => void) => {
    setIsLoadingAction(true);
    try {
      // Get the next index
      const maxIndexItem = await db.incomes.orderBy("index").last();
      const nextIndex = maxIndexItem ? maxIndexItem.index + 1 : 0;
      await db.incomes.add({ ...entry, index: nextIndex });
    } catch (error) {
      console.error("Error adding income:", error);
      onError(error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const deleteById = async (id: number, onError: (error: unknown) => void) => {
    setIsLoadingAction(true);
    try {
      await db.incomes.delete(id);
    } catch (error) {
      console.error("Error deleting income:", error);
      onError(error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const update = async (
    id: number,
    entry: IncomeEntry,
    onError: (error: unknown) => void
  ) => {
    setIsLoadingAction(true);
    try {
      await db.incomes.update(id, entry);
    } catch (error) {
      console.error("Error updating income:", error);
      onError(error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const reorder = async (
    reorderedIncomes: ComputedIncome[],
    onError: (error: unknown) => void
  ) => {
    setIsLoadingAction(true);
    try {
      // Update index for all items based on their new positions using bulkUpdate
      await db.incomes.bulkUpdate(
        reorderedIncomes.map((income, newIndex) => ({
          key: income.id,
          changes: { index: newIndex }
        }))
      );
    } catch (error) {
      console.error("Error reordering incomes:", error);
      onError(error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  return {
    incomes,
    isLoading,
    actions: { isLoadingAction, add, deleteById, update, reorder }
  };
}
