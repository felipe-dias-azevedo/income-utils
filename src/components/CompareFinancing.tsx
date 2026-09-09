import { useMemo, useState } from "react";
import {
  Text,
  Flex,
  Card,
  Heading,
  Box,
  Strong,
  Callout
} from "@radix-ui/themes";
import {
  calculatePRICEFinancing,
  calculateSACFinancing
} from "../utils/financingCalculations";
import {
  formatCurrency,
  formatCurrencyInput,
  formatPercentage,
  parseCurrencyString
} from "../utils/formatting";
import {
  loadStringFromLocalStorage,
  saveStringToLocalStorage
} from "../utils/storage";
import NumericLabeledInput from "./NumericLabeledInput";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { TextNumeric } from "./Common/TextNumeric";
import ContentCard from "./Common/ContentCard";

export function CompareFinancing() {
  const PROPERTY_VALUE_STORAGE = "financing_property_value";
  const DOWN_PAYMENT_STORAGE = "financing_down_payment";
  const INTEREST_RATE_STORAGE = "financing_interest_rate";
  const TERM_MONTHS_STORAGE = "financing_term_months";

  const [propertyValue, setPropertyValue] = useState(
    () =>
      (loadStringFromLocalStorage(PROPERTY_VALUE_STORAGE, "") as string) ?? ""
  );
  const [downPayment, setDownPayment] = useState(
    () => (loadStringFromLocalStorage(DOWN_PAYMENT_STORAGE, "") as string) ?? ""
  );
  const [interestRate, setInterestRate] = useState(
    () =>
      (loadStringFromLocalStorage(INTEREST_RATE_STORAGE, "10.5") as string) ??
      "10.5"
  );
  const [termMonths, setTermMonths] = useState(
    () =>
      (loadStringFromLocalStorage(TERM_MONTHS_STORAGE, "360") as string) ??
      "360"
  );

  const propertyValueNum = useMemo(
    () => parseCurrencyString(propertyValue),
    [propertyValue]
  );
  const downPaymentNum = useMemo(
    () => parseCurrencyString(downPayment),
    [downPayment]
  );
  const interestRateNum = useMemo(
    () => parseFloat(interestRate) || 0,
    [interestRate]
  );
  const termMonthsNum = useMemo(() => parseInt(termMonths) || 0, [termMonths]);

  const priceFinancing = useMemo(() => {
    if (
      propertyValueNum < 100 ||
      downPaymentNum < 0 ||
      interestRateNum < 0 ||
      termMonthsNum < 1
    ) {
      return null;
    }
    if (downPaymentNum >= propertyValueNum) {
      return null;
    }
    return calculatePRICEFinancing(
      propertyValueNum,
      downPaymentNum,
      interestRateNum,
      termMonthsNum
    );
  }, [propertyValueNum, downPaymentNum, interestRateNum, termMonthsNum]);

  const sacFinancing = useMemo(() => {
    if (
      propertyValueNum < 100 ||
      downPaymentNum < 0 ||
      interestRateNum < 0 ||
      termMonthsNum < 1
    ) {
      return null;
    }
    if (downPaymentNum >= propertyValueNum) {
      return null;
    }
    return calculateSACFinancing(
      propertyValueNum,
      downPaymentNum,
      interestRateNum,
      termMonthsNum
    );
  }, [propertyValueNum, downPaymentNum, interestRateNum, termMonthsNum]);

  const loanAmount = propertyValueNum - downPaymentNum;
  const yearsAndMonths = `${Math.floor(termMonthsNum / 12)}a ${termMonthsNum % 12}m`;

  return (
    <Flex gap="4" direction="column">
      <ContentCard p="4" gap="4" direction="column">
        <Box>
          <Heading size="5">Comparar Financiamentos</Heading>
          <Text size="2">
            Compare sistemas PRICE e SAC para seu financiamento
          </Text>
        </Box>

        <Flex gap="4" direction={{ initial: "column", sm: "row" }}>
          <Box style={{ flex: 1 }}>
            <NumericLabeledInput
              label="Valor do Imóvel/Bem"
              prefix="R$"
              placeholder="Ex: 450.000,00"
              value={propertyValue}
              onChange={(e) => {
                const v = formatCurrencyInput(e.target.value);
                setPropertyValue(v);
                saveStringToLocalStorage(PROPERTY_VALUE_STORAGE, v);
              }}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <NumericLabeledInput
              label="Entrada (Down Payment)"
              prefix="R$"
              placeholder="Ex: 90.000,00"
              value={downPayment}
              onChange={(e) => {
                const v = formatCurrencyInput(e.target.value);
                setDownPayment(v);
                saveStringToLocalStorage(DOWN_PAYMENT_STORAGE, v);
              }}
            />
          </Box>
        </Flex>

        <Flex gap="4" direction={{ initial: "column", sm: "row" }}>
          <NumericLabeledInput
            label="Taxa de Juros Anual (%)"
            placeholder="Ex: 10.5"
            value={interestRate}
            onChange={(e) => {
              const v = e.target.value;
              setInterestRate(v);
              saveStringToLocalStorage(INTEREST_RATE_STORAGE, v);
            }}
          />
          <NumericLabeledInput
            label="Prazo (meses)"
            placeholder="Ex: 360"
            value={termMonths}
            max={360}
            onChange={(e) => {
              const v = e.target.value;
              setTermMonths(v);
              saveStringToLocalStorage(TERM_MONTHS_STORAGE, v);
            }}
          />
        </Flex>

        {propertyValueNum >= 100 && downPaymentNum >= 0 && loanAmount > 0 && (
          <Box p="2">
            <Text size="1" color="gray">
              Valor financiado:{" "}
              <TextNumeric weight="bold" key={`financed-${loanAmount}`} animate>
                {formatCurrency(loanAmount)}
              </TextNumeric>{" "}
              • Prazo:{" "}
              <TextNumeric weight="bold" key={`term-${yearsAndMonths}`} animate>
                {yearsAndMonths}
              </TextNumeric>
            </Text>
          </Box>
        )}
      </ContentCard>

      {priceFinancing && sacFinancing && (
        <>
          <Flex gap="4" direction={{ initial: "column", md: "row" }}>
            {/* PRICE System */}
            <ContentCard p="4" gap="4" direction="column" style={{ flex: 1 }}>
              <Box>
                <Heading size="4">Sistema PRICE</Heading>
                <Text size="1" color="gray">
                  Prestações iguais
                </Text>
              </Box>

              <Flex direction="column" gap="2">
                <Box
                  p="2"
                  style={{
                    backgroundColor: "var(--blue-2)",
                    borderRadius: "6px",
                    borderLeft: "4px solid var(--blue-9)"
                  }}
                >
                  <Text size="1" color="gray">
                    Valor da Mensalidade
                  </Text>
                  <br />
                  <TextNumeric
                    size="5"
                    weight="bold"
                    key={`price-monthly-${priceFinancing.monthlyPayment}`}
                    animate
                  >
                    {formatCurrency(priceFinancing.monthlyPayment)}
                  </TextNumeric>
                </Box>

                <Flex direction="column" gap="1">
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      Total Pago
                    </Text>

                    <TextNumeric
                      weight="bold"
                      key={`price-total-paid-${priceFinancing.totalPaid}`}
                      animate
                    >
                      {formatCurrency(priceFinancing.totalPaid)}
                    </TextNumeric>
                  </Flex>
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      Total de Juros
                    </Text>

                    <TextNumeric
                      weight="bold"
                      key={`price-total-interest-${priceFinancing.totalInterest}`}
                      animate
                    >
                      {formatCurrency(priceFinancing.totalInterest)}
                    </TextNumeric>
                  </Flex>
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      % de Juros
                    </Text>

                    <TextNumeric
                      weight="bold"
                      key={`price-interest-percentage-${priceFinancing.totalInterest}`}
                      animate
                    >
                      {formatPercentage(
                        priceFinancing.totalInterest / priceFinancing.loanAmount
                      )}
                    </TextNumeric>
                  </Flex>
                </Flex>
              </Flex>

              <Callout.Root>
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  Parcelas iguais todo mês. Nos primeiros meses, você paga mais
                  juros e menos principal.
                </Callout.Text>
              </Callout.Root>
            </ContentCard>

            {/* SAC System */}
            <ContentCard p="4" gap="4" direction="column" style={{ flex: 1 }}>
              <Box>
                <Heading size="4">Sistema SAC</Heading>
                <Text size="1" color="gray">
                  Amortização constante
                </Text>
              </Box>

              <Flex direction="column" gap="2">
                <Box
                  p="2"
                  style={{
                    backgroundColor: "var(--green-2)",
                    borderRadius: "6px",
                    borderLeft: "4px solid var(--green-9)"
                  }}
                >
                  <Flex justify="between" align="start" gap="4">
                    <Box>
                      <Text size="1" color="gray">
                        1ª Mensalidade
                      </Text>
                      <br />
                      <TextNumeric
                        size="5"
                        weight="bold"
                        key={`sac-first-monthly-${sacFinancing.monthlyBreakdown[0].payment}`}
                        animate
                      >
                        {formatCurrency(
                          sacFinancing.monthlyBreakdown[0].payment
                        )}
                      </TextNumeric>
                    </Box>
                    <Box style={{ textAlign: "right" }}>
                      <Text size="1" color="gray">
                        Última
                      </Text>
                      <br />
                      <TextNumeric
                        size="5"
                        weight="bold"
                        key={`sac-last-monthly-${sacFinancing.monthlyBreakdown[sacFinancing.termMonths - 1].payment}`}
                        animate
                      >
                        {formatCurrency(
                          sacFinancing.monthlyBreakdown[
                            sacFinancing.termMonths - 1
                          ].payment
                        )}
                      </TextNumeric>
                    </Box>
                  </Flex>
                </Box>

                <Flex direction="column" gap="1">
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      Total Pago
                    </Text>

                    <TextNumeric
                      weight="bold"
                      key={`sac-total-paid-${sacFinancing.totalPaid}`}
                      animate
                    >
                      {formatCurrency(sacFinancing.totalPaid)}
                    </TextNumeric>
                  </Flex>
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      Total de Juros
                    </Text>

                    <TextNumeric
                      weight="bold"
                      key={`sac-total-interest-${sacFinancing.totalInterest}`}
                      animate
                    >
                      {formatCurrency(sacFinancing.totalInterest)}
                    </TextNumeric>
                  </Flex>
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      % de Juros
                    </Text>

                    <TextNumeric
                      weight="bold"
                      key={`sac-interest-percentage-${sacFinancing.totalInterest}`}
                      animate
                    >
                      {formatPercentage(
                        sacFinancing.totalInterest / sacFinancing.loanAmount
                      )}
                    </TextNumeric>
                  </Flex>
                </Flex>
              </Flex>

              <Callout.Root>
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  Parcelas decrescem mês a mês. Você paga menos juros, mas a
                  primeira parcela é maior.
                </Callout.Text>
              </Callout.Root>
            </ContentCard>
          </Flex>

          {/* Comparison */}
          <ContentCard p="4" gap="4" direction="column">
            <Heading size="4">Comparação</Heading>

            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2">Diferença Mensal (SAC - PRICE)</Text>

                <TextNumeric
                  weight="bold"
                  color={
                    sacFinancing.monthlyBreakdown[0].payment >
                    priceFinancing.monthlyPayment
                      ? "red"
                      : "green"
                  }
                  key={`comparison-monthly-difference-${sacFinancing.monthlyBreakdown[0].payment - priceFinancing.monthlyPayment}`}
                  animate
                >
                  {formatCurrency(
                    sacFinancing.monthlyBreakdown[0].payment -
                      priceFinancing.monthlyPayment
                  )}
                </TextNumeric>
              </Flex>

              <Flex justify="between" align="center">
                <Text size="2">Economia de Juros (SAC é melhor)</Text>

                <TextNumeric
                  weight="bold"
                  color={
                    sacFinancing.totalInterest < priceFinancing.totalInterest
                      ? "green"
                      : "red"
                  }
                  key={`comparison-interest-savings-${priceFinancing.totalInterest - sacFinancing.totalInterest}`}
                  animate
                >
                  {formatCurrency(
                    Math.abs(
                      priceFinancing.totalInterest - sacFinancing.totalInterest
                    )
                  )}
                </TextNumeric>
              </Flex>

              <Flex justify="between" align="center">
                <Text size="2">Economia Total (SAC é melhor)</Text>

                <TextNumeric
                  weight="bold"
                  color={
                    sacFinancing.totalPaid < priceFinancing.totalPaid
                      ? "green"
                      : "red"
                  }
                  key={`comparison-total-savings-${priceFinancing.totalPaid - sacFinancing.totalPaid}`}
                  animate
                >
                  {formatCurrency(
                    Math.abs(priceFinancing.totalPaid - sacFinancing.totalPaid)
                  )}
                </TextNumeric>
              </Flex>
            </Flex>
          </ContentCard>
        </>
      )}

      {propertyValueNum >= 100 && downPaymentNum >= 0 && !priceFinancing && (
        <Card
          style={{
            backgroundColor: "var(--red-2)",
            borderLeft: "4px solid var(--red-9)"
          }}
        >
          <Flex p="2" gap="2">
            <InfoCircledIcon
              style={{ color: "var(--red-9)", marginTop: "2px" }}
            />
            <Box>
              <Text size="2" color="red">
                <Strong>Dados inválidos:</Strong> A entrada não pode ser maior
                ou igual ao valor do imóvel. Verifique os valores digitados.
              </Text>
            </Box>
          </Flex>
        </Card>
      )}
    </Flex>
  );
}
