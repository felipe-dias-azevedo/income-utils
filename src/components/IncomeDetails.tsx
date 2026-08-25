import { Grid } from "@radix-ui/themes";
import type { ComputedIncome } from "../types/income";
import { TaxResultDetails } from "./TaxResultDetails";

interface IncomeDetailsProps {
  income: ComputedIncome;
}

export function IncomeDetails({ income }: IncomeDetailsProps) {
  // TODO: think how to place this label
  //   const bonusDetails = useMemo(
  //     () =>
  //       income.plrType === "multiplier"
  //         ? ` (${income.bonusMultiplier.toFixed(2).replace(".", ",")}x)`
  //         : "",
  //     [income]
  //   );

  return (
    <Grid
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
      }}
      gap="4"
    >
      <TaxResultDetails
        gross={{ label: "Salário Mensal Bruto", value: income.grossMonth }}
        net={{ label: "Salário Mensal Líquido", value: income.netMonth }}
        deductions={[
          { label: "IR", value: income.ir },
          { label: "INSS", value: income.inss }
        ]}
        postIncrements={[{ label: "Benefícios", value: income.benefits }]}
        postNet={{
          label: "Total Mensal Líquido",
          value: income.netMonthPlusBenefits
        }}
      />
      <TaxResultDetails
        gross={{
          label: "PLR Bruto",
          value: income.grossBonus
        }}
        net={{ label: "PLR Líquido", value: income.netBonus }}
        deductions={[
          { label: "IR", value: income.grossBonus - income.netBonus }
        ]}
      />
    </Grid>
  );
}
