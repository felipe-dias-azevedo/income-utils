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
  Dialog,
  Popover
} from "@radix-ui/themes";
import {
  TrashIcon,
  Pencil1Icon,
  DragHandleDots2Icon,
  InfoCircledIcon
} from "@radix-ui/react-icons";
import type { ComputedIncome, IncomeEntry } from "../types/income";
import { getJornadaLabel } from "../utils/incomeCalculations";
import { formatCurrencySimple } from "../utils/formatting";
import { IncomeForm } from "./IncomeForm";

interface IncomeTableProps {
  incomes: ComputedIncome[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, entry: IncomeEntry) => void;
  onReorder?: (incomes: ComputedIncome[]) => void;
}

type ViewType = "hora" | "liquido" | "mensal" | "anual";

interface ColumnConfig {
  key: string;
  label: string;
  bold?: boolean;
  isDragHandle?: boolean;
}

const VIEW_CONFIGS: Record<ViewType, ColumnConfig[]> = {
  hora: [
    { key: "drag_handle", label: "", isDragHandle: true },
    { key: "jornada", label: "Jornada" },
    { key: "hora", label: "Salário/Hora", bold: true },
    { key: "hora_anual", label: "Total/Ano/Hora" },
    { key: "hora_anual_outros", label: "Total/Ano + Outros/Hora" }
  ],
  liquido: [
    { key: "drag_handle", label: "", isDragHandle: true },
    { key: "salario_liquido", label: "Salário Líquido", bold: true },
    { key: "outros", label: "Outros" },
    { key: "total_mes_liquido", label: "Total/Mês Líquido" },
    { key: "bonus_liquido", label: "PLR Líquido" },
    { key: "total_ano_liquido", label: "Total/Ano Líquido" }
  ],
  mensal: [
    { key: "drag_handle", label: "", isDragHandle: true },
    { key: "salario_mensal", label: "Salário/Mês" },
    { key: "bonus", label: "PLR" },
    { key: "outros", label: "Outros" },
    { key: "total_mes", label: "Total/Mês", bold: true },
    { key: "total_mes_outros", label: "Total/Mês + Outros" }
  ],
  anual: [
    { key: "drag_handle", label: "", isDragHandle: true },
    { key: "salario_anual", label: "Salário/Ano" },
    { key: "bonus_anual", label: "PLR" },
    { key: "outros_anual", label: "Outros/Ano" },
    { key: "total_ano", label: "Total/Ano", bold: true },
    { key: "total_ano_outros", label: "Total/Ano + Outros" }
  ]
};

export function IncomeTable({
  incomes,
  onDelete,
  onUpdate,
  onReorder
}: IncomeTableProps) {
  const [viewType, setViewType] = useState<ViewType>("mensal");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [popoverOpenId, setPopoverOpenId] = useState<number | null>(null);
  const editingIncome = editingId
    ? incomes.find((i) => i.id === editingId)
    : null;

  const getCellValue = (income: ComputedIncome, columnKey: string) => {
    const formatValue = (value: number) => "R$ " + formatCurrencySimple(value);

    switch (columnKey) {
      case "jornada":
        return getJornadaLabel(income.jornada);
      case "hora":
        return formatValue(income.salarioHora);
      case "hora_anual":
        return formatValue(income.salarioHoraAnual);
      case "hora_anual_outros":
        return formatValue(income.salarioHoraAnualOutros);
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
      case "total_ano_liquido":
        return formatValue(income.totalAnoLiquido);
      default:
        return "";
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>, id: number) => {
    setDraggedId(id);
    e.dataTransfer!.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableRowElement>,
    targetId: number
  ) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !onReorder) {
      resetDragState();
      return;
    }

    const draggedIndex = incomes.findIndex((i) => i.id === draggedId);
    const targetIndex = incomes.findIndex((i) => i.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      resetDragState();
      return;
    }

    // Reorder array
    const reordered = [...incomes];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    // Persist changes
    onReorder(reordered);
    resetDragState();
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const getRowBackgroundColor = (income: ComputedIncome) => {
    if (dragOverId === income.id && draggedId) {
      return "var(--accent-9)";
    }
    if (income.color && income.color !== "transparent") {
      return `var(--${income.color}-4)`;
    }
    return "transparent";
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
                  <Table.ColumnHeaderCell
                    style={{ width: "40px" }}
                  ></Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: "180px" }}>
                    Nome
                  </Table.ColumnHeaderCell>
                  {columns.map(({ key, label, isDragHandle }) =>
                    isDragHandle ? null : (
                      <Table.ColumnHeaderCell
                        key={key}
                        style={{ width: "240px" }}
                      >
                        {label}
                      </Table.ColumnHeaderCell>
                    )
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {incomes.map((income) => (
                  <ContextMenu.Root key={income.id}>
                    <ContextMenu.Trigger>
                      <Table.Row
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, income.id)}
                        onDragLeave={() => setDragOverId(null)}
                        onDragEnter={() =>
                          draggedId && setDragOverId(income.id)
                        }
                        onDragEnd={handleDragEnd}
                        style={{
                          backgroundColor: getRowBackgroundColor(income),
                          opacity: draggedId === income.id ? 0.5 : 1,
                          transition:
                            "background-color 0.15s ease, opacity 0.15s ease"
                        }}
                      >
                        <Table.Cell
                          style={{
                            width: "40px",
                            padding: "8px 4px"
                          }}
                        >
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, income.id)}
                            style={{
                              cursor:
                                draggedId === income.id ? "grabbing" : "grab",
                              padding: "4px",
                              borderRadius: "4px",
                              transition: "background-color 0.2s ease"
                            }}
                          >
                            <DragHandleDots2Icon width="18" height="18" />
                          </div>
                        </Table.Cell>

                        <Table.Cell
                          style={{
                            width: "180px",
                            padding: "8px 12px"
                          }}
                        >
                          <Flex
                            align="center"
                            justify="between"
                            gap="2"
                            style={{
                              height: "100%",
                              width: "100%",
                              minWidth: 0
                            }}
                          >
                            <Text
                              size="2"
                              weight="bold"
                              style={{
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {income.name}
                            </Text>
                            <Popover.Root
                              open={popoverOpenId === income.id}
                              onOpenChange={(open) =>
                                setPopoverOpenId(open ? income.id : null)
                              }
                            >
                              <Popover.Trigger>
                                <InfoCircledIcon
                                  width="16"
                                  height="16"
                                  style={{ cursor: "pointer", flexShrink: 0 }}
                                />
                              </Popover.Trigger>
                              <Popover.Content>
                                <Box style={{ maxWidth: "250px" }}>
                                  <Flex direction="column" gap="2">
                                    <Box>
                                      <Text size="1" weight="bold">
                                        Nome:{" "}
                                      </Text>
                                      <Text size="1">{income.name}</Text>
                                    </Box>
                                    {income.description && (
                                      <Box>
                                        <Text size="1" weight="bold">
                                          Descrição:{" "}
                                        </Text>
                                        <Text size="1">
                                          {income.description}
                                        </Text>
                                      </Box>
                                    )}
                                    <Box>
                                      <Text size="1" weight="bold">
                                        Salário Mensal:{" "}
                                      </Text>
                                      <Text size="1">
                                        R${" "}
                                        {formatCurrencySimple(
                                          income.salarioMensal
                                        )}
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Text size="1" weight="bold">
                                        Multiplicador PLR:{" "}
                                      </Text>
                                      <Text size="1">
                                        {income.bonusMultiplier
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Text size="1" weight="bold">
                                        Outros:{" "}
                                      </Text>
                                      <Text size="1">
                                        R$ {formatCurrencySimple(income.outros)}
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Text size="1" weight="bold">
                                        Jornada:{" "}
                                      </Text>
                                      <Text size="1">
                                        {getJornadaLabel(income.jornada)}
                                      </Text>
                                    </Box>
                                  </Flex>
                                </Box>
                              </Popover.Content>
                            </Popover.Root>
                          </Flex>
                        </Table.Cell>

                        {columns.map(({ key, bold, isDragHandle }) =>
                          isDragHandle ? null : (
                            <Table.Cell
                              key={key}
                              style={{
                                width: "240px",
                                fontWeight: bold === true ? "bold" : "normal"
                              }}
                            >
                              {getCellValue(income, key)}
                            </Table.Cell>
                          )
                        )}
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
                  name: editingIncome.name,
                  description: editingIncome.description,
                  salarioMensal: editingIncome.salarioMensal,
                  bonusMultiplier: editingIncome.bonusMultiplier,
                  outros: editingIncome.outros,
                  jornada: editingIncome.jornada,
                  color: editingIncome.color,
                  index: editingIncome.index
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
