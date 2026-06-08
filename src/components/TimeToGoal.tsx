import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyString,
  formatPercentage,
  formatNumber
} from "../utils/formatting";
import {
  calculateTimeToGoal,
  calculateTimeToYield
} from "../utils/compoundInterestCalculations";
import OptionComponent from "./OptionComponent";
import RangeSlider from "./Common/RangeSlider";
import NumericLabeledInput from "./NumericLabeledInput";
import { BarChartIcon, PieChartIcon } from "@radix-ui/react-icons";
import ContentCard from "./Common/ContentCard";
import { TextNumeric } from "./Common/TextNumeric";

const TIME_TO_GOAL_MODE_OPTIONS = {
  goal: {
    value: "goal",
    label: "Valor Final",
    icon: <PieChartIcon />
  },
  rendimento: {
    value: "rendimento",
    label: "Calcular rendimento",
    icon: <BarChartIcon />
  }
} as const;

const timeToGoalSchema = z.object({
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
  sliderValue: z
    .string()
    .min(1, "Valor é obrigatório")
    .refine((value) => Number(value) > 0, {
      message: "Valor deve ser um número válido"
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
    )
});

type TimeToGoalFormValues = z.infer<typeof timeToGoalSchema>;

type TimeToGoalMode = keyof typeof TIME_TO_GOAL_MODE_OPTIONS;

export default function TimeToGoal() {
  const {
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<TimeToGoalFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      initialValue: formatCurrencyInput("0"),
      monthlyContribution: formatCurrencyInput("0"),
      sliderValue: "100000",
      interestRate: "10"
    },
    resolver: zodResolver(timeToGoalSchema)
  });

  const initialValue = watch("initialValue");
  const monthlyContribution = watch("monthlyContribution");
  const sliderValue = watch("sliderValue");
  const interestRate = watch("interestRate");
  const [mode, setMode] = useState<TimeToGoalMode>("goal");

  useEffect(() => {
    const currentValue = Number(sliderValue);
    if (mode === "rendimento") {
      if (currentValue < 500 || currentValue > 20000) {
        setValue("sliderValue", "1000");
      }
    } else {
      if (currentValue < 10000 || currentValue > 1000000) {
        setValue("sliderValue", "100000");
      }
    }
  }, [mode, setValue, sliderValue]);

  const { result } = useMemo(() => {
    if (!isValid) {
      return { result: null };
    }

    const initialValueNumber = parseCurrencyString(initialValue);
    const monthlyContributionNumber = parseCurrencyString(monthlyContribution);
    const interestRateNumber = parseFloat(interestRate.replace(",", ".")) || 0;
    const sliderNumber = Number(sliderValue);

    try {
      const calculation =
        mode === "rendimento"
          ? calculateTimeToYield({
              initialValue: initialValueNumber,
              monthlyContribution: monthlyContributionNumber,
              targetMonthlyInterest: sliderNumber,
              annualInterestRate: interestRateNumber,
              interestRateType: "annual",
              periodType: "years"
            })
          : calculateTimeToGoal({
              initialValue: initialValueNumber,
              monthlyContribution: monthlyContributionNumber,
              targetAmount: sliderNumber,
              interestRate: interestRateNumber,
              interestRateType: "annual",
              periodType: "years"
            });

      return { result: calculation, error: "" };
    } catch (err) {
      return {
        result: null,
        error:
          err instanceof Error
            ? err.message
            : "Não foi possível calcular o tempo até a meta"
      };
    }
  }, [
    initialValue,
    interestRate,
    isValid,
    monthlyContribution,
    sliderValue,
    mode
  ]);

  return (
    <Flex gap="4" direction="column">
      <ContentCard>
        <Box>
          <Heading size="5">Calcular tempo até a meta</Heading>
          <Text size="2">
            Escolha entre um valor final definido ou calcular o rendimento
            necessário para chegar lá.
          </Text>
        </Box>

        <Flex gap="4" direction={{ initial: "column", md: "row" }}>
          <OptionComponent<TimeToGoalMode>
            label="Modo"
            value={mode}
            onChange={setMode}
            options={TIME_TO_GOAL_MODE_OPTIONS}
          />
        </Flex>

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
                  label="Contribuição mensal (R$)"
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
              name="sliderValue"
              render={({ field }) => (
                <RangeSlider
                  sameColor
                  label={
                    mode === "rendimento"
                      ? "Juros mensais esperados (R$)"
                      : "Valor Final (R$)"
                  }
                  value={
                    Number(field.value) ||
                    (mode === "rendimento" ? 1000 : 100000)
                  }
                  onChange={(value) => field.onChange(String(value))}
                  min={mode === "rendimento" ? 500 : 10000}
                  max={mode === "rendimento" ? 20000 : 1000000}
                  step={mode === "rendimento" ? 500 : 10000}
                  leftLabel="Menor"
                  rightLabel="Maior"
                  formatValue={(value) =>
                    mode === "rendimento"
                      ? formatCurrency(value)
                      : formatCurrency(value)
                  }
                />
              )}
            />
            {errors.sliderValue?.message && (
              <Text size="1" color="red">
                {errors.sliderValue.message}
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
                  onChange={(value) => field.onChange(String(value))}
                  min={6}
                  max={14}
                  step={0.5}
                  leftLabel="Conservador"
                  rightLabel="Arrojado"
                  formatValue={(value) => formatPercentage(value / 100)}
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
      </ContentCard>

      {result && (
        <Flex gap="4" direction={{ initial: "column", md: "row" }} wrap="wrap">
          <ContentCard>
            <Text size="2" color="gray">
              Meses até a meta
            </Text>
            <TextNumeric weight="bold" key={result.totalMonths} animate>
              {formatNumber(result.totalMonths)}
            </TextNumeric>
          </ContentCard>

          <ContentCard style={{ flex: 1 }}>
            <Text size="2" color="gray">
              Anos até a meta
            </Text>
            <TextNumeric weight="bold" key={result.totalYears} animate>
              {result.totalYears.toFixed(2)}
            </TextNumeric>
          </ContentCard>

          <ContentCard style={{ flex: 1 }}>
            <Text size="2" color="gray">
              Valor final
            </Text>
            <TextNumeric weight="bold" key={result.totalFinal} animate>
              {formatCurrency(result.totalFinal)}
            </TextNumeric>
          </ContentCard>

          <ContentCard style={{ flex: 1 }}>
            <Text size="2" color="gray">
              Total investido
            </Text>
            <TextNumeric weight="bold" key={result.totalInvested} animate>
              {formatCurrency(result.totalInvested)}
            </TextNumeric>
          </ContentCard>

          <ContentCard style={{ flex: 1 }}>
            <Text size="2" color="gray">
              Juros totais
            </Text>
            <TextNumeric weight="bold" key={result.totalInterest} animate>
              {formatCurrency(result.totalInterest)}
            </TextNumeric>
          </ContentCard>
        </Flex>
      )}
    </Flex>
  );
}
