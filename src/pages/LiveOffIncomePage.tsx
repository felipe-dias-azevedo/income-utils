import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DrawingPinIcon } from "@radix-ui/react-icons";
import RangeSlider from "../components/Common/RangeSlider";
import ContentCard from "../components/Common/ContentCard";
import NumericLabeledInput from "../components/NumericLabeledInput";
import { TextNumeric } from "../components/Common/TextNumeric";
import {
  formatCurrency,
  formatCurrencyInput,
  formatPercentage,
  parseCurrencyString
} from "../utils/formatting";
import { calculateTimeToPassiveIncome } from "../utils/compoundInterestCalculations";
import { computeMonthlyIncome } from "../utils/incomeCalculations";
import { Tax2026 } from "../utils/taxCalculations";
import {
  loadStringFromLocalStorage,
  saveStringToLocalStorage
} from "../utils/storage";

const liveOffIncomeSchema = z.object({
  grossMonthlyIncome: z
    .string()
    .min(1, "Renda mensal bruta é obrigatória")
    .refine(
      (value) => parseCurrencyString(value) > 0,
      "Informe uma renda mensal válida"
    ),
  monthlyContributionPercentage: z.number().min(1).max(100),
  passiveIncomePercentage: z.number().min(1).max(100),
  interestRate: z.number().min(6).max(14),
  inflationRate: z.number().min(0).max(7)
});

type LiveOffIncomeFormValues = z.infer<typeof liveOffIncomeSchema>;

const GROSS_STORAGE = "live_off_income_gross";

export default function LiveOffIncomePage() {
  const tax2026 = useMemo(() => new Tax2026(), []);
  const [defaultValues] = useState<LiveOffIncomeFormValues>(() => ({
    grossMonthlyIncome: loadStringFromLocalStorage(GROSS_STORAGE, "") ?? "",
    monthlyContributionPercentage: 10,
    passiveIncomePercentage: 10,
    interestRate: 12,
    inflationRate: 0
  }));
  const {
    control,
    watch,
    formState: { errors, isValid }
  } = useForm<LiveOffIncomeFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(liveOffIncomeSchema)
  });

  const grossMonthlyIncome = watch("grossMonthlyIncome");
  const monthlyContributionPercentage = watch("monthlyContributionPercentage");
  const passiveIncomePercentage = watch("passiveIncomePercentage");
  const interestRate = watch("interestRate");
  const inflationRate = watch("inflationRate");
  const grossValue = parseCurrencyString(grossMonthlyIncome);
  const netMonthlyIncome = useMemo(
    () => computeMonthlyIncome(grossValue, 0, tax2026).netMonth,
    [grossValue, tax2026]
  );
  const monthlyContribution =
    (netMonthlyIncome * monthlyContributionPercentage) / 100;
  const targetMonthlyIncome =
    (netMonthlyIncome * passiveIncomePercentage) / 100;
  const result = useMemo(() => {
    if (!isValid) return null;

    try {
      return calculateTimeToPassiveIncome({
        monthlyContribution,
        targetMonthlyIncome,
        interestRate,
        interestRateType: "annual",
        inflationRate,
        inflationRateType: "annual",
        periodType: "years"
      });
    } catch {
      return null;
    }
  }, [
    inflationRate,
    interestRate,
    isValid,
    monthlyContribution,
    targetMonthlyIncome
  ]);

  useEffect(() => {
    saveStringToLocalStorage(GROSS_STORAGE, grossMonthlyIncome ?? "");
  }, [grossMonthlyIncome]);

  return (
    <Flex direction="column" gap="4">
      <ContentCard p="4" gap="4" direction="column">
        <Box>
          <Heading size="5">Viver de Renda</Heading>
          <Text size="2">
            Descubra quando sua renda passiva pode alcançar sua meta mensal.
          </Text>
        </Box>

        <Box>
          <Controller
            control={control}
            name="grossMonthlyIncome"
            render={({ field }) => (
              <NumericLabeledInput
                label="Renda mensal bruta (R$)"
                prefix="R$"
                placeholder="Ex: 13.500,00"
                value={field.value}
                onChange={(event) =>
                  field.onChange(formatCurrencyInput(event.target.value))
                }
              />
            )}
          />
          {errors.grossMonthlyIncome?.message && (
            <Text size="1" color="red">
              {errors.grossMonthlyIncome.message}
            </Text>
          )}
        </Box>

        <Flex direction="column" gap="1">
          <Text size="2" color="gray">
            Renda mensal líquida
          </Text>
          <TextNumeric size="4" weight="medium" animate key={netMonthlyIncome}>
            {formatCurrency(netMonthlyIncome)}
          </TextNumeric>
        </Flex>

        <Controller
          control={control}
          name="monthlyContributionPercentage"
          render={({ field }) => (
            <RangeSlider
              sameColor
              label="Contribuição mensal pelo salário líquido"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              min={1}
              max={100}
              step={1}
              leftLabel="1%"
              rightLabel="100%"
              formatValue={(value) =>
                `${value}% / ${formatCurrency((netMonthlyIncome * value) / 100)}`
              }
            />
          )}
        />

        <Controller
          control={control}
          name="passiveIncomePercentage"
          render={({ field }) => (
            <RangeSlider
              sameColor
              label="Meta de renda passiva"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              min={1}
              max={100}
              step={1}
              leftLabel="1%"
              rightLabel="100%"
              formatValue={(value) =>
                `${value}% / ${formatCurrency((netMonthlyIncome * value) / 100)}`
              }
            />
          )}
        />

        <Controller
          control={control}
          name="interestRate"
          render={({ field }) => (
            <RangeSlider
              sameColor
              label="Taxa de juros anuais"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              min={6}
              max={14}
              step={0.1}
              leftLabel="Conservador"
              rightLabel="Arrojado"
              formatValue={(value) => formatPercentage(value / 100)}
            />
          )}
        />

        <Controller
          control={control}
          name="inflationRate"
          render={({ field }) => (
            <RangeSlider
              sameColor
              label="Taxa de inflação anual"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              min={0}
              max={7}
              step={0.1}
              leftLabel="0%"
              rightLabel="7%"
              formatValue={(value) => formatPercentage(value / 100)}
            />
          )}
        />
      </ContentCard>

      {result && (
        <ContentCard p="4" gap="1" direction="column">
          <Flex align="center" gap="2">
            <DrawingPinIcon />
            <Text size="2" color="gray">
              Tempo até a meta de renda passiva
            </Text>
          </Flex>
          <TextNumeric
            size="6"
            weight="medium"
            animate
            key={result.totalMonths}
          >
            {result.totalYears} anos
            {result.totalMonthsAfterYears > 0
              ? ` e ${result.totalMonthsAfterYears} meses`
              : ""}
          </TextNumeric>
          <Text size="2" color="gray">
            Meta atual: {formatCurrency(targetMonthlyIncome)} por mês, corrigida
            pela inflação.
          </Text>
        </ContentCard>
      )}
    </Flex>
  );
}
