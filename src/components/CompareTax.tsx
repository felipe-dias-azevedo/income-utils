import { useMemo, useState } from "react";
import {
  Text,
  Flex,
  Card,
  Heading,
  Box,
  Strong,
  Switch,
  Callout
} from "@radix-ui/themes";
import { Tax2025, Tax2026 } from "../utils/taxCalculations";
import {
  formatCurrency,
  formatCurrencyInput,
  getPercentageColor,
  parseCurrencyString
} from "../utils/formatting";
import {
  loadStringFromLocalStorage,
  saveStringToLocalStorage
} from "../utils/storage";
import { computeMonthlyIncome } from "../utils/incomeCalculations";
import NumericInput from "./NumericInput";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export function CompareTax() {
  const GROSS_STORAGE = "compare_tax_gross";
  const GROSS2_STORAGE = "compare_tax_gross2";

  const [gross, setGross] = useState(
    () => (loadStringFromLocalStorage(GROSS_STORAGE, "") as string) ?? ""
  );
  const [gross2, setGross2] = useState(
    () => (loadStringFromLocalStorage(GROSS2_STORAGE, "") as string) ?? ""
  );
  const DOUBLE_COMPARE_STORAGE = "compare_tax_double";

  const [doubleCompare, setDoubleCompare] = useState<boolean>(
    () => loadStringFromLocalStorage(DOUBLE_COMPARE_STORAGE) === "true"
  );

  const handleSetDoubleCompare = (next: boolean) => {
    setDoubleCompare(next);
    saveStringToLocalStorage(DOUBLE_COMPARE_STORAGE, "" + next);
  };

  const tax2025 = useMemo(() => new Tax2025(), []);
  const tax2026 = useMemo(() => new Tax2026(), []);

  const grossValue = useMemo(() => parseCurrencyString(gross), [gross]);
  const gross2Value = useMemo(() => parseCurrencyString(gross2), [gross2]);

  const { net2025, net2026 } = useMemo(() => {
    const net2025 = computeMonthlyIncome(grossValue, 0, tax2025);

    let net2026;
    if (doubleCompare) {
      net2026 = computeMonthlyIncome(gross2Value, 0, tax2026);
    } else {
      net2026 = computeMonthlyIncome(grossValue, 0, tax2026);
    }

    return { net2025, net2026 };
  }, [doubleCompare, grossValue, gross2Value, tax2025, tax2026]);

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
          <Flex justify="between" gap="4">
            <Box>
              <Heading size="5">Comparação de Impostos</Heading>
              <Text size="2">
                Compare seu salário mensal líquido entre 2025 e 2026.
              </Text>
            </Box>

            <Text as="label" size="2">
              <Flex gap="2">
                <Switch
                  checked={doubleCompare}
                  onCheckedChange={handleSetDoubleCompare}
                />{" "}
                {/* TODO: Improve label */}
                Comparar dois salários
              </Flex>
            </Text>
          </Flex>

          <Flex gap="5">
            <NumericInput
              label={
                doubleCompare
                  ? "Salário Mensal Bruto 2025"
                  : "Salário Mensal Bruto"
              }
              placeholder="Ex: R$ 3.000,00"
              value={gross}
              onChange={(e) => {
                const v = formatCurrencyInput(e.target.value);
                setGross(v);
                saveStringToLocalStorage(GROSS_STORAGE, v);
              }}
            />
            {doubleCompare && (
              <NumericInput
                label="Salário Mensal Bruto 2026"
                placeholder="Ex: R$ 3.000,00"
                value={gross2}
                onChange={(e) => {
                  const v = formatCurrencyInput(e.target.value);
                  setGross2(v);
                  saveStringToLocalStorage(GROSS2_STORAGE, v);
                }}
              />
            )}
          </Flex>
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

      <Callout.Root variant="surface" size="1">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Imposto sobre PLR não foi alterado para 2026
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
