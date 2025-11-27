// Brazilian formatting utilities

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function formatCurrencySimple(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function parseCurrencyString(value: string): number {
  // Remove currency symbol and convert to number
  const cleaned = value
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except comma
  const numeric = value.replace(/\D/g, "");

  if (!numeric) return "";

  // Convert to number with 2 decimal places
  const num = parseInt(numeric, 10) / 100;

  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatPercentageInput(value: string): string {
  // Allow only digits and comma (Brazilian decimal format)
  const numeric = value.replace(/[^\d,]/g, "");

  if (!numeric) return "";

  // Keep only the last comma (in case user types multiple)
  const parts = numeric.split(",");
  if (parts.length > 2) {
    return (
      parts.slice(0, -1).join("") +
      "," +
      parts[parts.length - 1]
    ).substring(0, 5); // Max length to prevent issues
  }

  return numeric;
}
