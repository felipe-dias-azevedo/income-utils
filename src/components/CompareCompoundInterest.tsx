import { useMemo } from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyString,
  formatPercentage
} from "../utils/formatting";
import {
  calculateCompoundInterest,
  calculateInflationAdjustedResult
} from "../utils/compoundInterestCalculations";
import RangeSlider from "./Common/RangeSlider";
import { TimeLineChart } from "./Charts/LineChart";
import NumericLabeledInput from "./NumericLabeledInput";
import ContentCard from "./Common/ContentCard";

const compoundInterestSchema = z.object({
  initialValue: z
    .string()
    .min(1, "Valor inicial é obrigatório")
    .refine((value) => parseCurrencyString(value) >= 0, {
      message: "Valor inicial deve ser um número válido"
    }),
  monthlyContribution: z
    .string()
    .min(1, "Valor mensal é obrigatório")
    .refine((value) => parseCurrencyString(value) >= 0, {
      message: "Valor mensal deve ser um número válido"
    }),
  interestRate: z
    .string()
    .min(1, "Taxa de juros é obrigatória")
    .refine(
      (value) => {
        const normalized = value.replace(",", ".");
        const parsed = parseFloat(normalized);
        return !Number.isNaN(parsed) && parsed >= 6 && parsed <= 14;
      },
      {
        message: "Taxa de juros deve ser entre 6 e 14"
      }
    ),
  periodAmount: z
    .string()
    .min(1, "Período é obrigatório")
    .refine(
      (value) => {
        const parsed = parseInt(value, 10);
        return !Number.isNaN(parsed) && parsed > 0;
      },
      {
        message: "Período deve ser um número inteiro maior que zero"
      }
    ),
  periodType: z.enum(["months", "years"]),
  inflationRate: z
    .string()
    .min(1, "Taxa de inflação é obrigatória")
    .refine(
      (value) => {
        const normalized = value.replace(",", ".");
        const parsed = parseFloat(normalized);
        return !Number.isNaN(parsed) && parsed >= 3 && parsed <= 7;
      },
      {
        message: "Taxa de inflação deve ser entre 3 e 7"
      }
    ),
  inflationRateType: z.enum(["monthly", "annual"])
});

type CompoundInterestFormValues = z.infer<typeof compoundInterestSchema>;

export default function CompareCompoundInterest() {
  const {
    control,
    watch,
    formState: { errors, isValid }
  } = useForm<CompoundInterestFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      initialValue: formatCurrencyInput("0"),
      monthlyContribution: "",
      interestRate: "10",
      periodAmount: "10",
      periodType: "years",
      inflationRate: "5.5",
      inflationRateType: "annual"
    },
    resolver: zodResolver(compoundInterestSchema)
  });

  const initialValue = watch("initialValue");
  const monthlyContribution = watch("monthlyContribution");
  const interestRate = watch("interestRate");
  const periodAmount = watch("periodAmount");
  const periodType = watch("periodType");
  const inflationRate = watch("inflationRate");

  const compoundResult = useMemo(() => {
    if (!isValid) return null;

    const initialValueNumber = parseCurrencyString(initialValue);
    const monthlyContributionNumber = parseCurrencyString(monthlyContribution);
    const interestRateNumber = parseFloat(interestRate.replace(",", ".")) || 0;
    const periodAmountNumber = parseInt(periodAmount, 10) || 0;

    return calculateCompoundInterest({
      initialValue: initialValueNumber,
      monthlyContribution: monthlyContributionNumber,
      interestRate: interestRateNumber,
      interestRateType: "annual",
      periodAmount: periodAmountNumber,
      periodType: "years"
    });
  }, [
    initialValue,
    interestRate,
    isValid,
    monthlyContribution,
    periodAmount,
    periodType
  ]);

  const inflationAdjustedResult = useMemo(() => {
    if (!compoundResult) return null;

    const inflationRateNumber =
      parseFloat(inflationRate.replace(",", ".")) || 0;
    const periodAmountNumber = parseInt(periodAmount, 10) || 0;

    return calculateInflationAdjustedResult({
      result: compoundResult,
      inflationRate: inflationRateNumber,
      inflationRateType: "annual",
      totalPeriodAmount: periodAmountNumber,
      totalPeriodType: "years"
    });
  }, [compoundResult, inflationRate, periodAmount, periodType]);

  const timelineData = useMemo(() => {
    if (!compoundResult || !inflationAdjustedResult) return null;
    return {
      data: {
        Total: compoundResult.timeline.map(
          (point) => point.interest + point.invested
        ),
        "Total (ajustado)":
          inflationAdjustedResult.inflationAdjustedTimeline.map(
            (point) => point.interest + point.invested
          )
      },
      labels: compoundResult.timeline.map((point) => point.label)
    };
  }, [compoundResult, inflationAdjustedResult]);

  return (
    <Flex gap="4" direction="column">
      <ContentCard p="4" gap="4" direction="column">
        <Box>
          <Heading size="5">Calcular Juros Compostos</Heading>
          <Text size="2">
            Simule o crescimento do seu investimento com contribuições mensais e
            juros compostos.
          </Text>
        </Box>

        <Flex gap="4" direction={{ initial: "column", md: "row" }}>
          <Box style={{ flex: 1 }}>
            <Controller
              control={control}
              name="initialValue"
              render={({ field }) => (
                <NumericLabeledInput
                  label="Valor inicial (R$)"
                  prefix="R$"
                  placeholder="Ex: 5.000,00"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(formatCurrencyInput(e.target.value))
                  }
                />
              )}
            />
            {errors.initialValue?.message && (
              <Text size="1" color="red">
                {errors.initialValue.message}
              </Text>
            )}
          </Box>
          <Box style={{ flex: 1 }}>
            <Controller
              control={control}
              name="monthlyContribution"
              render={({ field }) => (
                <NumericLabeledInput
                  label="Valor mensal (R$)"
                  prefix="R$"
                  placeholder="Ex: 500,00"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(formatCurrencyInput(e.target.value))
                  }
                />
              )}
            />
            {errors.monthlyContribution?.message && (
              <Text size="1" color="red">
                {errors.monthlyContribution.message}
              </Text>
            )}
          </Box>
        </Flex>

        <Flex gap="4" direction={{ initial: "column", md: "row" }}>
          <Box style={{ flex: 1 }}>
            <Controller
              control={control}
              name="interestRate"
              render={({ field }) => (
                <RangeSlider
                  sameColor
                  label="Taxa média de juros anual (%)"
                  value={Number(field.value) || 10}
                  onChange={(v) => field.onChange(String(v))}
                  min={6}
                  max={14}
                  step={0.5}
                  leftLabel="Conservador"
                  rightLabel="Arrojado"
                  formatValue={(v) =>
                    // formatPercentage(Math.pow(1 + v / 100, 1 / 12) - 1)
                    formatPercentage(v / 100)
                  }
                />
              )}
            />
            {errors.interestRate?.message && (
              <Text size="1" color="red">
                {errors.interestRate.message}
              </Text>
            )}
          </Box>
        </Flex>

        <Flex gap="4" direction={{ initial: "column", md: "row" }}>
          <Box style={{ flex: 1 }}>
            <Controller
              control={control}
              name="periodAmount"
              render={({ field }) => (
                <RangeSlider
                  sameColor
                  label="Período (anos)"
                  value={Number(field.value) || 10}
                  onChange={(v) => field.onChange(String(v))}
                  min={1}
                  max={30}
                  step={1}
                  leftLabel="Curto"
                  rightLabel="Longo"
                  formatValue={(v) => (v > 1 ? `${v} anos` : "1 ano")}
                />
              )}
            />
            {errors.periodAmount?.message && (
              <Text size="1" color="red">
                {errors.periodAmount.message}
              </Text>
            )}
          </Box>
        </Flex>

        <Flex gap="4" direction={{ initial: "column", md: "row" }}>
          <Box style={{ flex: 1 }}>
            <Controller
              control={control}
              name="inflationRate"
              render={({ field }) => (
                <RangeSlider
                  sameColor
                  label="Taxa média de inflação anual (%)"
                  value={Number(field.value) || 5.5}
                  onChange={(v) => field.onChange(String(v))}
                  min={3}
                  max={7}
                  step={0.5}
                  leftLabel="Otimista"
                  rightLabel="Pessimista"
                  formatValue={(v) =>
                    // formatPercentage(Math.pow(1 + v / 100, 1 / 12) - 1)
                    formatPercentage(v / 100)
                  }
                />
              )}
            />
            {errors.inflationRate?.message && (
              <Text size="1" color="red">
                {errors.inflationRate.message}
              </Text>
            )}
          </Box>
        </Flex>
      </ContentCard>

      {/* TODO: alert if total invested < final value inflation adjusted */}
      {/* TODO: alert if total invested < final value inflation adjusted */}
      {/* TODO: show amount of interest monthly of final value and inflation adjusted */}
      {/* TODO: show amount of interest yearly of final value and inflation adjusted */}
      {/* TODO: if period less than equal of 4 years, show chart in monthly */}

      {compoundResult && inflationAdjustedResult && (
        <>
          <Flex gap="4" direction={{ initial: "column", md: "row" }}>
            <ContentCard>
              <Text size="2" color="gray">
                Valor total final
              </Text>
              <Heading size="4">
                {formatCurrency(compoundResult.totalFinal)}
              </Heading>
            </ContentCard>
            <ContentCard>
              <Text size="2" color="gray">
                Valor total investido
              </Text>
              <Heading size="4">
                {formatCurrency(compoundResult.totalInvested)}
              </Heading>
            </ContentCard>
            <ContentCard>
              <Text size="2" color="gray">
                Total em juros
              </Text>
              <Heading size="4">
                {formatCurrency(compoundResult.totalInterest)}
              </Heading>
            </ContentCard>
          </Flex>

          <Flex gap="4" direction={{ initial: "column", md: "row" }}>
            <ContentCard>
              <Text size="2" color="gray">
                Valor final (ajustado à inflação)
              </Text>
              <Heading size="4">
                {formatCurrency(inflationAdjustedResult.inflationAdjustedFinal)}
              </Heading>
            </ContentCard>
            <ContentCard>
              <Text size="2" color="gray">
                Juros totais (ajustado à inflação)
              </Text>
              <Heading size="4">
                {formatCurrency(
                  inflationAdjustedResult.inflationAdjustedInterest
                )}
              </Heading>
            </ContentCard>
          </Flex>

          <ContentCard p="4" direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">Linha do tempo</Heading>
                <Text size="2" color="gray">
                  Evolução de investido e juros durante o período.
                </Text>
              </Box>
            </Flex>

            {timelineData && (
              <TimeLineChart
                data={timelineData.data}
                colors={{ Total: "blue", "Total (ajustado)": "green" }}
                formatter={(value) => formatCurrency(value)}
                hideLabel={false}
                labels={timelineData.labels}
              />
            )}
          </ContentCard>
        </>
      )}
    </Flex>
  );
}
