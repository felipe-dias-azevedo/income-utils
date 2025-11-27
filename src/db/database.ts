import Dexie, { type Table } from "dexie";
import type { IncomeEntry } from "../types/income";

export class IncomeDatabase extends Dexie {
  incomes!: Table<IncomeEntry>;

  constructor() {
    super("IncomeDatabase");
    this.version(1).stores({
      incomes: "++id, createdAt"
    });
  }
}

export const db = new IncomeDatabase();
