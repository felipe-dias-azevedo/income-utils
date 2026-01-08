import Papa from "papaparse";
import type { ComputedIncome } from "../types/income";

export function exportToCSV(incomes: ComputedIncome[]): void {
  // Map field names to display labels
  const fieldLabelMap: Record<string, string> = {
    id: "ID",
    name: "Nome",
    description: "Descrição",
    salarioMensal: "Salário/Mês",
    bonusMultiplier: "Multiplicador PLR",
    outros: "Outros",
    jornada: "Jornada",
    color: "Cor",
    createdAt: "Data de Criação",
    index: "Índice",
    salarioBruto: "Salário Bruto",
    salarioAnual: "Salário/Ano",
    bonusAmount: "PLR",
    bonusLiquido: "PLR Líquido",
    outrosAnual: "Outros/Ano",
    totalPerYear: "Total/Ano",
    totalPerMonth: "Total/Mês",
    totalPerMonthPlusOthers: "Total/Mês + Outros",
    totalPerYearPlusOthers: "Total/Ano + Outros",
    salarioLiquido: "Salário Líquido",
    totalMesLiquido: "Total/Mês Líquido",
    totalAnoLiquido: "Total/Ano Líquido",
    salarioHora: "Salário/Hora",
    salarioHoraAnual: "Total + PLR",
    salarioHoraAnualOutros: "Total + PLR + Outros"
  };

  // Define all fields to export in order
  const fields = [
    "id",
    "name",
    "description",
    "salarioMensal",
    "bonusMultiplier",
    "outros",
    "jornada",
    "color",
    "createdAt",
    "index",
    "salarioBruto",
    "salarioAnual",
    "bonusAmount",
    "bonusLiquido",
    "outrosAnual",
    "totalPerYear",
    "totalPerMonth",
    "totalPerMonthPlusOthers",
    "totalPerYearPlusOthers",
    "salarioLiquido",
    "totalMesLiquido",
    "totalAnoLiquido",
    "salarioHora",
    "salarioHoraAnual",
    "salarioHoraAnualOutros"
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
