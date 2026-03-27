import Papa from "papaparse";
import type { ComputedIncome } from "../types/income";

export function exportToCSV(incomes: ComputedIncome[]): void {
  // Map field names to display labels
  const fieldLabelMap: Record<keyof ComputedIncome, string> = {
    index: "ID",
    name: "Nome",
    description: "Descrição",
    workweekHoursType: "Jornada",
    grossHour: "Salário/Hora",
    netHour: "Salário/Hora Líquido",
    grossHourPlusBenefits: "Total/Hora",
    netHourPlusBenefits: "Total/Hora Líquido",
    grossMonth: "Salário/Mês",
    netMonth: "Salário/Mês Líquido",
    benefits: "Benefícios",
    grossMonthPlusBenefits: "Total/Mês",
    netMonthPlusBenefits: "Total/Mês Líquido",
    grossYear: "Salário/Ano",
    netYear: "Salário/Ano Líquido",
    grossBonus: "PLR",
    netBonus: "PLR Líquido",
    grossYearPlusBonus: "Salário + PLR",
    netYearPlusBonus: "Salário + PLR Líquido",
    benefitsYear: "Benefícios/Ano",
    grossYearPlusBonusPlusBenefits: "Total/Ano",
    netYearPlusBonusPlusBenefits: "Total/Ano Líquido",
    id: "ID",
    workweekHours: "Horas por Semana",
    paidMonths: "Meses de Salário",
    inss: "INSS",
    ir: "IR",
    bonusMultiplier: "Multiplicador do Bônus",
    plrType: "Tipo de PLR",
    bonusFixed: "PLR Fixo",
    color: "Cor",
    createdAt: "Data de Criação"
  };

  // Define all fields to export in order
  const fields: (keyof ComputedIncome)[] = [
    "index",
    "name",
    "description",
    "grossMonth",
    "bonusMultiplier",
    "benefits",
    "color",
    "workweekHours",
    "workweekHours",
    "grossHour",
    "netHour",
    "grossHourPlusBenefits",
    "netHourPlusBenefits",
    "grossMonth",
    "netMonth",
    "benefits",
    "grossMonthPlusBenefits",
    "netMonthPlusBenefits",
    "grossYear",
    "netYear",
    "grossBonus",
    "netBonus",
    "grossYearPlusBonus",
    "netYearPlusBonus",
    "benefitsYear",
    "grossYearPlusBonusPlusBenefits",
    "netYearPlusBonusPlusBenefits"
  ];

  // Transform data with mapped headers
  const transformedData = incomes.map((income) => {
    const transformed: Record<string, unknown> = {};
    fields.forEach((field) => {
      transformed[fieldLabelMap[field]] = income[field as keyof ComputedIncome];
    });
    return transformed;
  });

  // Convert data to CSV using papaparse with mapped headers
  const csv = Papa.unparse(transformedData, {
    header: true,
    columns: fields.map((field) => fieldLabelMap[field])
  });

  // Create a blob and trigger download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `comparativo-rendas-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
