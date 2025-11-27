import { useState } from "react";
import {
  Box,
  Flex,
  Table,
  Card,
  Heading,
  Text,
  Tabs,
  ContextMenu,
  Dialog
} from "@radix-ui/themes";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import type { ComputedIncome, IncomeEntry } from "../types/income";
import { getJornadaLabel } from "../utils/incomeCalculations";
import { formatCurrencySimple } from "../utils/formatting";
import { IncomeForm } from "./IncomeForm";

interface IncomeTableProps {
  incomes: ComputedIncome[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, entry: IncomeEntry) => void;
}

type ViewType = "hora" | "liquido" | "mensal" | "anual";

interface ColumnConfig {
  key: string;
  label: string;
  bold?: boolean;
}

const VIEW_CONFIGS: Record<ViewType, ColumnConfig[]> = {
  hora: [
    { key: "salario_mensal", label: "Salário Mensal" },
    { key: "jornada", label: "Jornada" },
    { key: "hora", label: "Salário/Hora", bold: true }
  ],
  liquido: [
    { key: "salario_mensal", label: "Mensal Bruto" },
    { key: "bonus_liquido", label: "PLR Líquido" },
    { key: "outros", label: "Outros" },
    { key: "salario_liquido", label: "Salário Líquido", bold: true },
    { key: "total_mes_liquido", label: "Total/Mês Líquido" }
  ],
  mensal: [
    { key: "salario_mensal", label: "Salário Mensal" },
    { key: "bonus", label: "PLR Anual" },
    { key: "outros", label: "Outros" },
    { key: "total_mes", label: "Total/Mês", bold: true },
    { key: "total_mes_outros", label: "Total/Mês + Outros" }
  ],
  anual: [
    { key: "salario_anual", label: "Salário Anual" },
    { key: "bonus_anual", label: "PLR Anual" },
    { key: "outros_anual", label: "Outros Anual" },
    { key: "total_ano", label: "Total/Ano", bold: true },
    { key: "total_ano_outros", label: "Total/Ano + Outros" }
  ]
};

export function IncomeTable({ incomes, onDelete, onUpdate }: IncomeTableProps) {
  const [viewType, setViewType] = useState<ViewType>("mensal");
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingIncome = editingId
    ? incomes.find((i) => i.id === editingId)
    : null;

  const getCellValue = (income: ComputedIncome, columnKey: string) => {
    const formatValue = (value: number) => "R$ " + formatCurrencySimple(value);

    switch (columnKey) {
      case "jornada": {
        return getJornadaLabel(income.jornada);
      }
      case "hora": {
        return formatValue(income.salarioHora);
      }
      case "salario_mensal":
        return formatValue(income.salarioMensal);
      case "salario_anual":
        return formatValue(income.salarioAnual);
      case "bonus":
        return formatValue(income.bonusAmount);
      case "bonus_liquido":
        return formatValue(income.bonusLiquido);
      case "bonus_anual":
        return formatValue(income.bonusAmount);
      case "total_ano":
        return formatValue(income.totalPerYear);
      case "total_mes":
        return formatValue(income.totalPerMonth);
      case "outros":
        return formatValue(income.outros);
      case "outros_anual":
        return formatValue(income.outrosAnual);
      case "total_mes_outros":
        return formatValue(income.totalPerMonthPlusOthers);
      case "total_ano_outros":
        return formatValue(income.totalPerYearPlusOthers);
      case "salario_liquido":
        return formatValue(income.salarioLiquido);
      case "total_mes_liquido":
        return formatValue(income.totalMesLiquido);
      default:
        return "";
    }
  };

  const columns = VIEW_CONFIGS[viewType];

  return (
    <Card>
      <Box p="4">
        <Flex justify="between" align="center" mb="4">
          <Heading size="4">Comparativo de Rendimentos</Heading>
          <Tabs.Root
            value={viewType}
            onValueChange={(value) => setViewType(value as ViewType)}
          >
            <Tabs.List>
              <Tabs.Trigger value="liquido">Líquido</Tabs.Trigger>
              <Tabs.Trigger value="hora">Hora</Tabs.Trigger>
              <Tabs.Trigger value="mensal">Mensal</Tabs.Trigger>
              <Tabs.Trigger value="anual">Anual</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </Flex>

        {incomes.length === 0 ? (
          <Text color="gray">
            Nenhum rendimento adicionado. Clique em "Adicionar" para começar.
          </Text>
        ) : (
          <Box style={{ overflowX: "auto" }}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  {columns.map(({ key, label }) => (
                    <Table.ColumnHeaderCell
                      key={key}
                      style={{ width: "140px" }}
                    >
                      {label}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {incomes.map((income) => (
                  <ContextMenu.Root key={income.id}>
                    <ContextMenu.Trigger>
                      <Table.Row
                        style={{
                          backgroundColor:
                            income.color && income.color !== "transparent"
                              ? `var(--${income.color}-3)`
                              : "transparent"
                        }}
                      >
                        {columns.map(({ key, bold }) => (
                          <Table.Cell
                            key={key}
                            style={{
                              width: "140px",
                              fontWeight: bold === true ? "bold" : "normal"
                            }}
                          >
                            {getCellValue(income, key)}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                      <ContextMenu.Item onClick={() => setEditingId(income.id)}>
                        <Pencil1Icon /> Editar
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        color="red"
                        onClick={() => onDelete(income.id)}
                      >
                        <TrashIcon /> Deletar
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu.Root>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Box>

      {editingIncome && editingId !== null && (
        <Dialog.Root
          open={editingId !== null}
          onOpenChange={(open) => {
            if (!open) setEditingId(null);
          }}
        >
          <Dialog.Content>
            <Dialog.Title>Editar Rendimento</Dialog.Title>
            <Box p="4">
              <IncomeForm
                initialData={{
                  salarioMensal: editingIncome.salarioMensal,
                  bonusMultiplier: editingIncome.bonusMultiplier,
                  outros: editingIncome.outros,
                  jornada: editingIncome.jornada,
                  color: editingIncome.color
                }}
                onSubmit={(entry) => {
                  onUpdate(editingId, entry);
                  setEditingId(null);
                }}
                isLoading={false}
                isEditing={true}
              />
            </Box>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </Card>
  );
}
