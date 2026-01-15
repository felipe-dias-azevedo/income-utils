import { useMemo, useState } from "react";
import { TextField, Text, Flex, Box, Card, Heading } from "@radix-ui/themes";
import { Tax2025, Tax2026 } from "../utils/taxCalculations";
import {
  calculatePercentageDifference,
  formatCurrency,
  formatCurrencyInput,
  getPercentageColor,
  parseCurrencyString
} from "../utils/formatting";
import { computeMonthlyIncome } from "../utils/incomeCalculations";

export function CompareTax() {
  const [gross, setGross] = useState("");

  const tax2025 = useMemo(() => new Tax2025(), []);
  const tax2026 = useMemo(() => new Tax2026(), []);

  const grossValue = useMemo(() => parseCurrencyString(gross), [gross]);

  const { net2025, net2026 } = useMemo(() => {
    const net2025 = computeMonthlyIncome(grossValue, 0, tax2025);

    const net2026 = computeMonthlyIncome(grossValue, 0, tax2026);

    return { net2025, net2026 };
  }, [grossValue, tax2025, tax2026]);

  const { comparePercentage, compareAbsolute, compareINSS, compareIR } =
    useMemo(() => {
      return {
        compareAbsolute: net2026.netMonth - net2025.netMonth,
        comparePercentage: calculatePercentageDifference(
          net2026.netMonth,
          net2025.netMonth
        ),
        compareIR: net2026.ir - net2025.ir,
        compareINSS: net2026.inss - net2025.inss
      };
    }, [net2025, net2026]);

  return (
    <Card>
      <Flex p="2" gap="3" direction="column">
        <Heading size="4">Comparação de Impostos</Heading>
        <Text size="2">
          Compare seu salário mensal líquido entre 2025 e 2026.
        </Text>
        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              Salário Mensal Bruto
            </div>
            <TextField.Root
              type="text"
              placeholder="Ex: R$ 3.000,00"
              value={gross}
              radius="large"
              onChange={(e) => setGross(formatCurrencyInput(e.target.value))}
            />
          </label>
        </Box>
        <Flex direction="column" gap="2">
          {grossValue >= 100 && (
            <>
              <Text size="2">
                Salário Líquido 2025: {formatCurrency(net2025.netMonth)}
              </Text>
              <Text size="2">
                Salário Líquido 2026: {formatCurrency(net2026.netMonth)}{" "}
                <Text
                  size="2"
                  weight="bold"
                  color={getPercentageColor(comparePercentage)}
                >
                  {compareAbsolute > 0 && "+"}
                  {formatCurrency(compareAbsolute)} {comparePercentage} INSS:{" "}
                  {compareINSS > 0 && "+"}
                  {formatCurrency(compareINSS)} IR: {compareIR > 0 && "+"}
                  {formatCurrency(compareIR)}
                </Text>
              </Text>
            </>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
