import { useCallback, useEffect, useMemo } from "react";
import { Box, Button, Flex, TextField, Select, Text } from "@radix-ui/themes";
import type { IncomeEntry } from "../types/income";
import { JornadaType } from "../types/income";
import {
  formatCurrencyInput,
  formatPercentageInput,
  formatCurrencySimple,
  parseCurrencyString
} from "../utils/formatting";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAlertDialog } from "./AlertDialogContext";
import { useIncomeContext } from "../contexts/IncomeContext";
import NumericLabeledInput from "./NumericLabeledInput";

const RADIX_COLORS = [
  "transparent",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "cyan",
  "blue",
  "purple",
  "pink",
  "brown",
  "gray"
] as const;

const COLOR_NAMES_PT: Record<(typeof RADIX_COLORS)[number], string> = {
  transparent: "Transparente",
  red: "Vermelho",
  orange: "Laranja",
  yellow: "Amarelo",
  green: "Verde",
  teal: "Verde Azulado",
  cyan: "Ciano",
  blue: "Azul",
  purple: "Roxo",
  pink: "Rosa",
  brown: "Marrom",
  gray: "Cinza"
};

const incomeFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(20, "Máximo 20 caracteres"),
  description: z.string().max(30, "Máximo 30 caracteres").optional(),
  grossMonth: z
    .string()
    .min(1, "Salário mensal é obrigatório")
    .refine((value) => parseCurrencyString(value) > 0, {
      message: "Salário mensal é obrigatório"
    }),
  plrType: z.enum(["multiplier", "fixed"]),
  bonusMultiplier: z.string().optional(),
  bonusFixed: z.string().optional(),
  benefits: z.string().optional(),
  workweekHoursType: z.enum(JornadaType),
  color: z.string()
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

interface IncomeFormProps {
  onSubmit?: (entry: IncomeEntry) => void;
  initialData?: {
    id: number;
    name: string;
    description?: string;
    grossMonth: number;
    bonusMultiplier?: number;
    bonusFixed?: number;
    plrType: "multiplier" | "fixed";
    benefits: number;
    workweekHoursType: string;
    color?: string;
    index: number;
  };
}

const blankFormValues: IncomeFormValues = {
  name: "",
  description: "",
  grossMonth: "",
  plrType: "multiplier",
  bonusMultiplier: "",
  bonusFixed: "",
  benefits: "",
  workweekHoursType: JornadaType.FORTY_HOURS,
  color: "transparent"
};

export function IncomeForm({ onSubmit, initialData }: IncomeFormProps) {
  const isEditing = useMemo(() => initialData !== undefined, [initialData]);

  const {
    actions: { isLoadingAction: isLoading, add, update }
  } = useIncomeContext();

  const { alert } = useAlertDialog();

  const onAdd = async (entry: IncomeEntry) => {
    await add(entry, () => {
      alert("Erro ao adicionar renda");
    });
  };

  const onUpdate = async (id: number, entry: IncomeEntry) => {
    await update(id, entry, () => {
      alert("Erro ao atualizar renda");
    });
  };

  const initialFormValues = useMemo<IncomeFormValues>(() => {
    if (!initialData) {
      return blankFormValues;
    }

    return {
      name: initialData.name,
      description: initialData.description ?? "",
      grossMonth: formatCurrencySimple(initialData.grossMonth),
      plrType: initialData.plrType,
      bonusMultiplier:
        initialData.plrType === "multiplier"
          ? String(initialData.bonusMultiplier ?? 0).replace(".", ",")
          : "",
      bonusFixed:
        initialData.plrType === "fixed"
          ? formatCurrencySimple(initialData.bonusFixed ?? 0)
          : "",
      benefits: formatCurrencySimple(initialData.benefits),
      workweekHoursType: initialData.workweekHoursType as JornadaType,
      color: initialData.color ?? "transparent"
    };
  }, [initialData]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<IncomeFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(incomeFormSchema) as Resolver<IncomeFormValues>,
    defaultValues: initialFormValues
  });

  const plrTypeValue = watch("plrType");

  useEffect(() => {
    reset(initialFormValues);
  }, [initialFormValues, reset]);

  const handleValidSubmit = async (values: IncomeFormValues) => {
    const entry: IncomeEntry = {
      name: values.name.trim(),
      description: values.description,
      grossMonth: parseCurrencyString(values.grossMonth),
      plrType: values.plrType,
      bonusMultiplier:
        values.plrType === "multiplier"
          ? parseFloat((values.bonusMultiplier ?? "0").replace(",", ".")) || 0
          : 0,
      bonusFixed:
        values.plrType === "fixed"
          ? parseCurrencyString(values.bonusFixed ?? "")
          : 0,
      benefits: parseCurrencyString(values.benefits ?? ""),
      workweekHoursType: values.workweekHoursType,
      color: values.color,
      createdAt: Date.now(),
      paidMonths: 12,
      index: initialData?.index || 0
    };

    if (isEditing && initialData) {
      await onUpdate(initialData.id, entry);
    } else {
      await onAdd(entry);
    }

    onSubmit?.(entry);
    reset(blankFormValues);
  };

  const ErrorMessage = useCallback(({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <Text size="1" color="red">
        {message}
      </Text>
    );
  }, []);

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)}>
      <Flex direction="column" gap="3">
        <Box>
          <label>
            <Box mb="2">
              <Text size="2">
                Nome{" "}
                <Text as="span" color="red" aria-hidden="true">
                  *
                </Text>
              </Text>
            </Box>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField.Root
                  {...field}
                  type="text"
                  placeholder="Ex: Empresa A (max 20 caracteres)"
                  radius="large"
                  maxLength={20}
                />
              )}
            />
          </label>
          {errors.name?.message && (
            <ErrorMessage message={errors.name.message} />
          )}
        </Box>

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              Descrição (opcional)
            </div>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextField.Root
                  {...field}
                  value={field.value ?? ""}
                  type="text"
                  placeholder="Ex: Cargo de desenvolvedor (max 30 caracteres)"
                  radius="large"
                  maxLength={30}
                />
              )}
            />
          </label>
          {errors.description?.message && (
            <ErrorMessage message={errors.description.message} />
          )}
        </Box>

        <Controller
          control={control}
          name="grossMonth"
          render={({ field }) => (
            <NumericLabeledInput
              label="Salário Mensal Bruto"
              required
              prefix="R$"
              placeholder="Ex: 3.000,00"
              value={field.value}
              onChange={(e) =>
                field.onChange(formatCurrencyInput(e.target.value))
              }
            />
          )}
        />
        {errors.grossMonth?.message && (
          <ErrorMessage message={errors.grossMonth.message} />
        )}

        <Flex
          gap="3"
          align="center"
          direction={{ initial: "column", md: "row" }}
        >
          <Box width={{ initial: "100%", md: "auto" }}>
            <label>
              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                Tipo de PLR
              </div>
              <Controller
                control={control}
                name="plrType"
                render={({ field }) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="multiplier">
                        Multiplicador
                      </Select.Item>
                      <Select.Item value="fixed">Valor Fixo</Select.Item>
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </label>
          </Box>

          {plrTypeValue === "multiplier" ? (
            <Controller
              control={control}
              name="bonusMultiplier"
              render={({ field }) => (
                <NumericLabeledInput
                  label="Multiplicador de PLR"
                  placeholder="Ex: 1,5 (150% do salário mensal)"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(formatPercentageInput(e.target.value))
                  }
                  style={{ width: "100%" }}
                />
              )}
            />
          ) : (
            <Controller
              control={control}
              name="bonusFixed"
              render={({ field }) => (
                <NumericLabeledInput
                  label="Valor fixo de PLR"
                  prefix="R$"
                  placeholder="Ex: 2.000,00"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(formatCurrencyInput(e.target.value))
                  }
                  style={{ width: "100%" }}
                />
              )}
            />
          )}
        </Flex>

        <Controller
          control={control}
          name="benefits"
          render={({ field }) => (
            <NumericLabeledInput
              label="Benefícios"
              prefix="R$"
              placeholder="Ex: 500,00"
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(formatCurrencyInput(e.target.value))
              }
            />
          )}
        />
        {errors.benefits?.message && (
          <ErrorMessage message={errors.benefits.message} />
        )}

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>Jornada</div>
            <Controller
              control={control}
              name="workweekHoursType"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as JornadaType)
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value={JornadaType.THIRTY_SIX_HOURS}>
                      36 horas
                    </Select.Item>
                    <Select.Item value={JornadaType.FORTY_HOURS}>
                      40 horas
                    </Select.Item>
                    <Select.Item value={JornadaType.FORTY_FOUR_HOURS}>
                      44 horas
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </label>
        </Box>

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>Cor</div>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger />
                  <Select.Content>
                    {RADIX_COLORS.map((c) => (
                      <Select.Item key={c} value={c}>
                        <Flex align="center" gap="2">
                          <Box
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "2px",
                              backgroundColor:
                                c === "transparent"
                                  ? "transparent"
                                  : `var(--${c}-9)`,
                              border:
                                c === "transparent"
                                  ? "1px solid var(--gray-7)"
                                  : "none"
                            }}
                          />
                          {COLOR_NAMES_PT[c]}
                        </Flex>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
          </label>
        </Box>

        <Flex gap="2" justify="end" mt="2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Atualizando..."
                : "Adicionando..."
              : isEditing
                ? "Atualizar"
                : "Adicionar"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
