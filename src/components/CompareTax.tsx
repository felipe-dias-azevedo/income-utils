import { useMemo, useState } from "react";
import { Text, Flex, Card, Heading, Box, Strong } from "@radix-ui/themes";
import { Tax2025, Tax2026 } from "../utils/taxCalculations";
import {
  formatCurrency,
  formatCurrencyInput,
  getPercentageColor,
  parseCurrencyString
} from "../utils/formatting";
import { computeMonthlyIncome } from "../utils/incomeCalculations";
import NumericInput from "./NumericInput";

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

  const { compareAbsolute, compareINSS, compareIR } = useMemo(() => {
    return {
      compareAbsolute: net2026.netMonth - net2025.netMonth,
      // comparePercentage: calculatePercentageDifference(
      //   net2026.netMonth,
      //   net2025.netMonth
      // ),
      compareIR: net2026.ir - net2025.ir,
      compareINSS: net2026.inss - net2025.inss
    };
  }, [net2025, net2026]);

  return (
    <Flex gap="4" direction="column">
      <Card>
        <Flex p="2" gap="4" direction="column">
          <Box>
            <Heading size="5">Comparação de Impostos</Heading>
            <Text size="2">
              Compare seu salário mensal líquido entre 2025 e 2026.
            </Text>
          </Box>

          <NumericInput
            label="Salário Mensal Bruto"
            placeholder="Ex: R$ 3.000,00"
            value={gross}
            onChange={(e) => setGross(formatCurrencyInput(e.target.value))}
          />
        </Flex>
      </Card>

      {grossValue >= 100 && (
        <Flex gap="4">
          <Card style={{ width: "50%" }}>
            <Flex p="2" gap="4" direction="column">
              <Heading size="5">2025</Heading>

              <Flex direction="column" gap="1">
                <Text size="3">
                  Salário Líquido:{" "}
                  <Strong>{formatCurrency(net2025.netMonth)}</Strong>
                </Text>
                <Text size="1" color="gray">
                  IR: <Strong>{formatCurrency(net2025.ir)}</Strong>
                </Text>
                <Text size="1" color="gray">
                  INSS: <Strong>{formatCurrency(net2025.inss)}</Strong>
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card style={{ width: "50%" }}>
            <Flex p="2" gap="4" direction="column">
              <Heading size="5">2026</Heading>

              <Flex direction="column" gap="1">
                <Flex gap="2" align="center">
                  <Text size="3">
                    Salário Líquido:{" "}
                    <Strong>{formatCurrency(net2026.netMonth)}</Strong>
                  </Text>
                  <Text
                    size="2"
                    weight="bold"
                    color={getPercentageColor(compareAbsolute > 0 ? "+" : "-")}
                  >
                    {compareAbsolute > 0 && "+"}
                    {formatCurrency(compareAbsolute)}
                    {/* {comparePercentage} */}
                  </Text>
                </Flex>
                <Flex gap="2" align="center">
                  <Text size="1" color="gray">
                    IR: <Strong>{formatCurrency(net2026.ir)}</Strong>
                  </Text>
                  <Text
                    size="1"
                    weight="bold"
                    color={getPercentageColor(compareIR > 0 ? "-" : "+")}
                  >
                    {compareIR > 0 && "+"}
                    {formatCurrency(compareIR)}
                  </Text>
                </Flex>
                <Flex gap="2" align="center">
                  <Text size="1" color="gray">
                    INSS: <Strong>{formatCurrency(net2026.inss)}</Strong>
                  </Text>
                  <Text
                    size="1"
                    weight="bold"
                    color={getPercentageColor(compareINSS > 0 ? "-" : "+")}
                  >
                    {compareINSS > 0 && "+"}
                    {formatCurrency(compareINSS)}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      )}
    </Flex>
  );
}
