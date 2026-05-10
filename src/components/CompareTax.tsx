import { useMemo, useState } from "react";
import {
  Text,
  Flex,
  Grid,
  Card,
  Heading,
  Box,
  Strong,
  Switch,
  Callout,
  Separator,
  CheckboxCards
} from "@radix-ui/themes";
import { Tax2025, Tax2026 } from "../utils/taxCalculations";
import {
  calculatePercentageDifference,
  formatCurrency,
  formatCurrencyInput,
  getPercentageColor,
  parseCurrencyString
} from "../utils/formatting";
import {
  loadStringFromLocalStorage,
  loadStringListFromLocalStorage,
  saveStringListToLocalStorage,
  saveStringToLocalStorage
} from "../utils/storage";
import {
  computeBonus,
  computeMonthlyIncome
} from "../utils/incomeCalculations";
import NumericLabeledInput from "./NumericLabeledInput";
import { InfoCircledIcon, PieChartIcon } from "@radix-ui/react-icons";
import { TaxResultCard } from "./TaxResultCard";

export interface CompareTaxProps {
  enableDoubleCompare: boolean;
}

export function CompareTax({
  enableDoubleCompare: enableDualCompare
}: CompareTaxProps) {
  const GROSS_STORAGE = "compare_tax_gross";
  const GROSS2_STORAGE = "compare_tax_gross2";
  const DOUBLE_COMPARE_STORAGE = "compare_tax_double";
  const BONUS_STORAGE = "compare_tax_bonus";
  const COMPARING_TAXES_STORAGE = "compare_tax_comparing_taxes";

  const [gross, setGross] = useState(
    () => (loadStringFromLocalStorage(GROSS_STORAGE, "") as string) ?? ""
  );
  const [gross2, setGross2] = useState(
    () => (loadStringFromLocalStorage(GROSS2_STORAGE, "") as string) ?? ""
  );
  const [grossBonus, setGrossBonus] = useState(
    () => (loadStringFromLocalStorage(BONUS_STORAGE, "") as string) ?? ""
  );
  const [doubleCompare, setDoubleCompare] = useState<boolean>(
    () => loadStringFromLocalStorage(DOUBLE_COMPARE_STORAGE) === "true"
  );
  const [comparingTaxes, setComparingTaxes] = useState<string[]>(() =>
    loadStringListFromLocalStorage(COMPARING_TAXES_STORAGE, ["2026"])
  );

  const handleSetDoubleCompare = (next: boolean) => {
    setDoubleCompare(next);
    saveStringToLocalStorage(DOUBLE_COMPARE_STORAGE, "" + next);
  };

  const tax2025 = useMemo(() => new Tax2025(), []);
  const tax2026 = useMemo(() => new Tax2026(), []);

  const grossValue = useMemo(() => parseCurrencyString(gross), [gross]);
  const gross2Value = useMemo(() => parseCurrencyString(gross2), [gross2]);
  const grossBonusValue = useMemo(
    () => parseCurrencyString(grossBonus),
    [grossBonus]
  );

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

  const { net2026Bonus } = useMemo(() => {
    const net2026Bonus = computeBonus(grossBonusValue, tax2026);
    return { net2026Bonus };
  }, [grossBonusValue, tax2026]);

  const { compareAbsolute, comparePercentage } = useMemo(() => {
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

  const compare2025 = useMemo(
    () => comparingTaxes.includes("2025"),
    [comparingTaxes]
  );

  return (
    <Flex gap="4" direction="column">
      <Card style={{ padding: "0" }}>
        <Flex p="4" gap="4" direction="column">
          <Flex
            justify="between"
            gap="4"
            direction={{ initial: "column", sm: "row" }}
          >
            <Box>
              <Heading size="5">Calcular Salário Líquido</Heading>
              <Text size="2">
                Compare seu salário mensal líquido entre 2025 e 2026.
              </Text>
            </Box>

            {enableDualCompare && (
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
            )}
          </Flex>

          <Flex gap="5">
            <NumericLabeledInput
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
              <NumericLabeledInput
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

          <Flex direction="column" gap="2">
            <Text size="2">Comparar com:</Text>
            <CheckboxCards.Root
              size="1"
              columns="2"
              variant="surface"
              value={comparingTaxes}
              onValueChange={(e) => {
                setComparingTaxes(e);
                saveStringListToLocalStorage(COMPARING_TAXES_STORAGE, e);
              }}
            >
              <CheckboxCards.Item
                value="2026"
                disabled
                className="checkbox-card"
              >
                2026
              </CheckboxCards.Item>
              <CheckboxCards.Item value="2025" className="checkbox-card">
                2025
              </CheckboxCards.Item>
            </CheckboxCards.Root>
          </Flex>
        </Flex>
      </Card>

      {grossValue > 0 && (
        <>
          {compare2025 && (
            <Callout.Root
              variant="surface"
              highContrast
              size="1"
              color={getPercentageColor(compareAbsolute > 0 ? "+" : "-")}
              className="popup-animated fade-transition"
              // style={{ display: "flex" }}
            >
              <Callout.Icon>
                <PieChartIcon />
              </Callout.Icon>
              <Callout.Text
              //style={{ width: "100%" }}
              >
                <Text>Comparação de 2025 para 2026: </Text>
                <Strong key={compareAbsolute} className="valuechange-animated">
                  {compareAbsolute > 0 ? "+" : <>&minus;</>}
                  {formatCurrency(Math.abs(compareAbsolute))}
                </Strong>
                <Text key={comparePercentage} className="valuechange-animated">
                  {" "}
                  ({comparePercentage})
                </Text>
              </Callout.Text>
            </Callout.Root>
          )}

          <Grid
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
            }}
            gap="4"
          >
            <TaxResultCard
              heading="Resultado Salário 2026"
              gross={net2026.grossMonth}
              net={net2026.netMonth}
              deductions={[
                { label: "IR", value: net2026.ir },
                { label: "INSS", value: net2026.inss }
              ]}
              pieChartData={{
                "Salário Líquido": net2026.netMonth,
                IR: net2026.ir,
                INSS: net2026.inss
              }}
            />

            {compare2025 && (
              <TaxResultCard
                heading="Resultado Salário 2025"
                gross={net2025.grossMonth}
                net={net2025.netMonth}
                deductions={[
                  { label: "IR", value: net2025.ir },
                  { label: "INSS", value: net2025.inss }
                ]}
                pieChartData={{
                  "Salário Líquido": net2025.netMonth,
                  IR: net2025.ir,
                  INSS: net2025.inss
                }}
              />
            )}
          </Grid>
        </>
      )}

      <Separator orientation="horizontal" style={{ width: "100%" }} />

      <Card style={{ padding: "0" }}>
        <Flex p="4" gap="4" direction="column">
          <Flex
            justify="between"
            gap="4"
            direction={{ initial: "column", md: "row" }}
          >
            <Box>
              <Heading size="5">Calcular PLR Líquido</Heading>
              <Text size="2">
                Calcule o imposto sobre Participação nos Lucros ou Resultados
                (PLR).
              </Text>
            </Box>
            <Callout.Root variant="surface" size="1">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                Imposto sobre PLR não foi alterado para 2026
              </Callout.Text>
            </Callout.Root>
          </Flex>

          <Flex gap="5">
            <NumericLabeledInput
              label={"PLR Anual Bruto"}
              placeholder="Ex: R$ 3.000,00"
              value={grossBonus}
              onChange={(e) => {
                const v = formatCurrencyInput(e.target.value);
                setGrossBonus(v);
                saveStringToLocalStorage(BONUS_STORAGE, v);
              }}
            />
          </Flex>
        </Flex>
      </Card>

      {grossBonusValue > 0 && (
        <TaxResultCard
          heading="Resultado PLR"
          gross={net2026Bonus.grossBonus}
          net={net2026Bonus.netBonus}
          deductions={[{ label: "IR", value: net2026Bonus.irBonus }]}
          pieChartData={{
            PLR: net2026Bonus.netBonus,
            IR: net2026Bonus.irBonus
          }}
        />
      )}
    </Flex>
  );
}
