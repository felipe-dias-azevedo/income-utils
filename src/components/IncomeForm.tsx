import { useMemo, useState } from "react";
import { Box, Button, Flex, TextField, Select } from "@radix-ui/themes";
import type { IncomeEntry } from "../types/income";
import { JornadaType } from "../types/income";
import {
  formatCurrencyInput,
  formatPercentageInput,
  formatCurrencySimple,
  parseCurrencyString
} from "../utils/formatting";
import { useAlertDialog } from "./AlertDialogContext";
import { useIncomeContext } from "../contexts/IncomeContext";
import NumericInput from "./NumericInput";

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

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [salarioMensal, setSalarioMensal] = useState(
    initialData ? formatCurrencySimple(initialData.grossMonth) : ""
  );
  // PLR type: 'multiplier' or 'fixed'
  const [plrType, setPlrType] = useState<"multiplier" | "fixed">(
    initialData &&
      typeof initialData.bonusMultiplier === "number" &&
      initialData.bonusMultiplier !== 0
      ? "multiplier"
      : initialData &&
          initialData.bonusMultiplier === 0 &&
          initialData.benefits > 0
        ? "fixed"
        : "multiplier"
  );
  const [bonusMultiplier, setBonusMultiplier] = useState(
    initialData && plrType === "multiplier"
      ? String(initialData.bonusMultiplier).replace(".", ",")
      : ""
  );
  const [bonusFixed, setBonusFixed] = useState(
    initialData && plrType === "fixed" && initialData.bonusFixed
      ? formatCurrencySimple(initialData.bonusFixed)
      : ""
  );
  const [outros, setOutros] = useState(
    initialData ? formatCurrencySimple(initialData.benefits) : ""
  );
  const [jornada, setJornada] = useState<JornadaType>(
    (initialData?.workweekHoursType as JornadaType) || JornadaType.FORTY_HOURS
  );
  const [color, setColor] = useState(initialData?.color || "transparent");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    if (!salarioMensal) {
      alert("Salário mensal é obrigatório");
      return;
    }

    const entry: IncomeEntry = {
      name: name.trim(),
      description: description.trim() || undefined,
      grossMonth: parseCurrencyString(salarioMensal),
      plrType,
      bonusMultiplier:
        (plrType === "multiplier" &&
          parseFloat(bonusMultiplier.replace(",", "."))) ||
        0,
      bonusFixed: (plrType === "fixed" && parseCurrencyString(bonusFixed)) || 0,
      benefits: parseCurrencyString(outros),
      workweekHoursType: jornada,
      color,
      createdAt: Date.now(),
      paidMonths: 12,
      index: initialData?.index || 0
    };

    if (isEditing && initialData) {
      onUpdate(initialData.id, entry);
    } else {
      onAdd(entry);
    }

    onSubmit?.(entry);

    // Reset form
    setName("");
    setDescription("");
    setSalarioMensal("");
    setBonusMultiplier("");
    setBonusFixed("");
    setOutros("");
    setJornada(JornadaType.FORTY_HOURS);
    setColor("transparent");
    setPlrType("multiplier");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>Nome *</div>
            <TextField.Root
              type="text"
              placeholder="Ex: Empresa A (max 20 caracteres)"
              value={name}
              radius="large"
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </Box>

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              Descrição (opcional)
            </div>
            <TextField.Root
              type="text"
              placeholder="Ex: Cargo de desenvolvedor (max 30 caracteres)"
              value={description}
              radius="large"
              maxLength={30}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </Box>

        <NumericInput
          label="Salário Mensal Bruto *"
          placeholder="Ex: R$ 3.000,00"
          value={salarioMensal}
          onChange={(e) =>
            setSalarioMensal(formatCurrencyInput(e.target.value))
          }
        />

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>PLR</div>
            <Flex gap="2" align="center">
              <Select.Root
                value={plrType}
                onValueChange={(v) => setPlrType(v as "multiplier" | "fixed")}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="multiplier">Multiplicador</Select.Item>
                  <Select.Item value="fixed">Valor Fixo</Select.Item>
                </Select.Content>
              </Select.Root>
              {plrType === "multiplier" ? (
                <TextField.Root
                  type="text"
                  placeholder="Ex: 1,5 (150% do salário mensal)"
                  value={bonusMultiplier}
                  radius="large"
                  onChange={(e) =>
                    setBonusMultiplier(formatPercentageInput(e.target.value))
                  }
                  style={{ width: "100%" }}
                />
              ) : (
                <TextField.Root
                  type="text"
                  placeholder="Ex: R$ 2.000,00"
                  value={bonusFixed}
                  radius="large"
                  onChange={(e) =>
                    setBonusFixed(formatCurrencyInput(e.target.value))
                  }
                  style={{ width: "100%" }}
                />
              )}
            </Flex>
          </label>
        </Box>

        <NumericInput
          label="Benefícios"
          placeholder="Ex: R$ 500,00"
          value={outros}
          onChange={(e) => setOutros(formatCurrencyInput(e.target.value))}
        />

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>Jornada</div>
            <Select.Root
              value={jornada}
              onValueChange={(value) => setJornada(value as JornadaType)}
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
          </label>
        </Box>

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>Cor</div>
            <Select.Root value={color} onValueChange={setColor}>
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
