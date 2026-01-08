import { useState } from "react";
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
  onSubmit: (entry: IncomeEntry) => void;
  isLoading?: boolean;
  initialData?: {
    name: string;
    description?: string;
    salarioMensal: number;
    bonusMultiplier: number;
    outros: number;
    jornada: string;
    color?: string;
    index: number;
  };
  isEditing?: boolean;
}

export function IncomeForm({
  onSubmit,
  isLoading = false,
  initialData,
  isEditing = false
}: IncomeFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [salarioMensal, setSalarioMensal] = useState(
    initialData ? formatCurrencySimple(initialData.salarioMensal) : ""
  );
  const [bonusMultiplier, setBonusMultiplier] = useState(
    initialData ? String(initialData.bonusMultiplier).replace(".", ",") : ""
  );
  const [outros, setOutros] = useState(
    initialData ? formatCurrencySimple(initialData.outros) : ""
  );
  const [jornada, setJornada] = useState<JornadaType>(
    (initialData?.jornada as JornadaType) || JornadaType.FORTY_HOURS
  );
  const [color, setColor] = useState(initialData?.color || "transparent");
  const { alert } = useAlertDialog();

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
      salarioMensal: parseCurrencyString(salarioMensal),
      bonusMultiplier: parseFloat(bonusMultiplier.replace(",", ".")) || 0,
      outros: parseCurrencyString(outros),
      jornada,
      color,
      createdAt: Date.now(),
      index: initialData?.index || 0
    };

    onSubmit(entry);

    // Reset form
    setName("");
    setDescription("");
    setSalarioMensal("");
    setBonusMultiplier("0");
    setOutros("");
    setJornada(JornadaType.FORTY_HOURS);
    setColor("transparent");
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

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              Salário Mensal Bruto *
            </div>
            <TextField.Root
              type="text"
              placeholder="Ex: R$ 3.000,00"
              value={salarioMensal}
              radius="large"
              onChange={(e) =>
                setSalarioMensal(formatCurrencyInput(e.target.value))
              }
            />
          </label>
        </Box>

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              Multiplicador de PLR
            </div>
            <TextField.Root
              type="text"
              placeholder="Ex: 1,5 (150% do salário mensal)"
              value={bonusMultiplier}
              radius="large"
              onChange={(e) =>
                setBonusMultiplier(formatPercentageInput(e.target.value))
              }
            />
          </label>
        </Box>

        <Box>
          <label>
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              Benefícios
            </div>
            <TextField.Root
              type="text"
              placeholder="Ex: R$ 500,00"
              value={outros}
              radius="large"
              onChange={(e) => setOutros(formatCurrencyInput(e.target.value))}
            />
          </label>
        </Box>

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
