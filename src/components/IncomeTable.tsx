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
  Popover,
  Switch
} from "@radix-ui/themes";
import {
  TrashIcon,
  Pencil1Icon,
  DragHandleDots2Icon,
  InfoCircledIcon,
  SliderIcon
} from "@radix-ui/react-icons";
import type { ComputedIncome, IncomeEntry } from "../types/income";
import { formatCurrencySimple } from "../utils/formatting";
import { IncomeForm } from "./IncomeForm";

interface IncomeTableProps {
  incomes: ComputedIncome[];
  isComparing: boolean;
  compareBaseId: number | null;
  onCompareBaseIdChange: (id: number | null) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, entry: IncomeEntry) => void;
  onReorder?: (incomes: ComputedIncome[]) => void;
}

type ViewType = "hora" | "mensal" | "anual";

interface ColumnConfig {
  key: string;
  label: string;
  bold?: boolean;
  isDragHandle?: boolean;
  liquidoField?: string;
}

const VIEW_CONFIGS: Record<ViewType, ColumnConfig[]> = {
  hora: [
    { key: "drag_handle", label: "", isDragHandle: true },
    { key: "jornada", label: "Jornada" },
    { key: "hora", label: "Salário/Hora", liquidoField: "hora_liquido" },
    {
      key: "hora_anual_outros",
      label: "Salário/Hora + Outros",
      bold: true,
      liquidoField: "hora_anual_outros_liquido"
    }
  ],
  mensal: [
    { key: "drag_handle", label: "", isDragHandle: true },
    {
      key: "salario_mensal",
      label: "Salário/Mês",
      liquidoField: "salario_mensal_liquido"
    },
    { key: "outros", label: "Outros" },
    {
      key: "total_mes_outros",
      label: "Total/Mês + Outros",
      bold: true,
      liquidoField: "total_mes_outros_liquido"
    }
  ],
  anual: [
    { key: "drag_handle", label: "", isDragHandle: true },
    {
      key: "salario_anual",
      label: "Salário/Ano",
      liquidoField: "salario_anual_liquido"
    },
    { key: "bonus_anual", label: "PLR", liquidoField: "bonus_liquido" },
    { key: "outros_anual", label: "Outros/Ano" },
    { key: "total_ano", label: "Total/Ano", liquidoField: "total_ano_liquido" },
    {
      key: "total_ano_outros",
      label: "Total/Ano + Outros",
      bold: true,
      liquidoField: "total_ano_outros_liquido"
    }
  ]
};

export function IncomeTable({
  incomes,
  isComparing,
  compareBaseId,
  onCompareBaseIdChange,
  onDelete,
  onUpdate,
  onReorder
}: IncomeTableProps) {
  const [viewType, setViewType] = useState<ViewType>("mensal");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [popoverOpenId, setPopoverOpenId] = useState<number | null>(null);
  const [showLiquido, setShowLiquido] = useState<boolean>(false);
  const editingIncome = editingId
    ? incomes.find((i) => i.id === editingId)
    : null;

  const getCellValue = (
    income: ComputedIncome,
    columnKey: string,
    column?: ColumnConfig
  ) => {
    const formatValue = (value: number) => "R$ " + formatCurrencySimple(value);

    // If showLiquido is enabled and column has liquidoField, use the liquido field
    if (showLiquido && column?.liquidoField) {
      const liquidoKey = column.liquidoField;
      switch (liquidoKey) {
        case "hora_liquido":
          return formatValue(income.salarioHoraLiquido);
        case "hora_anual_outros_liquido":
          return formatValue(income.salarioHoraAnualOutrosLiquido);
        case "salario_mensal_liquido":
          return formatValue(income.salarioLiquido);
        case "total_mes_outros_liquido":
          return formatValue(income.totalMesLiquido);
        case "salario_anual_liquido":
          return formatValue(income.salarioAnualLiquido);
        case "bonus_liquido":
          return formatValue(income.bonusLiquido);
        case "total_ano_liquido":
          return formatValue(income.totalAnoLiquido);
        case "total_ano_outros_liquido":
          return formatValue(income.totalAnoOutrosLiquido);
        default:
          break;
      }
    }

    // Default behavior for non-liquido fields
    switch (columnKey) {
      case "jornada":
        return income.jornada;
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

  const getBoldColumnKey = (): string => {
    const boldColumn = VIEW_CONFIGS[viewType].find((col) => col.bold);
    return boldColumn?.key || "";
  };

  const getCompareBase = (): ComputedIncome | null => {
    if (!isComparing) return null;
    if (compareBaseId !== null) {
      return incomes.find((i) => i.id === compareBaseId) || null;
    }
    return incomes[0] || null;
  };

  const calculatePercentageDifference = (
    currentValue: number,
    baseValue: number
  ): string => {
    if (baseValue === 0) return "N/A";
    const percentage = ((currentValue - baseValue) / baseValue) * 100;
    const sign = percentage > 0 ? "+" : "";
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getPercentageColor = (percentage: string): "gray" | "green" | "red" => {
    if (percentage === "N/A") return "gray";
    if (percentage.includes("+")) return "green";
    return "red";
  };

  return (
    <Card>
      <Box p="4">
        <Flex justify="between" align="center" mb="4">
          <Heading size="4">Rendimentos</Heading>
          <Flex align="center" gap="4">
            <Flex align="center" gap="2">
              <Text size="2">Líquido</Text>
              <Switch checked={showLiquido} onCheckedChange={setShowLiquido} />
            </Flex>
            <Tabs.Root
              value={viewType}
              onValueChange={(value) => setViewType(value as ViewType)}
            >
              <Tabs.List>
                <Tabs.Trigger value="hora">Hora</Tabs.Trigger>
                <Tabs.Trigger value="mensal">Mensal</Tabs.Trigger>
                <Tabs.Trigger value="anual">Anual</Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </Flex>
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
                  {isComparing && (
                    <Table.ColumnHeaderCell style={{ width: "120px" }}>
                      Comparação
                    </Table.ColumnHeaderCell>
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
                                        x
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
                                      <Text size="1">{income.jornada}</Text>
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
                              {getCellValue(
                                income,
                                key,
                                columns.find((col) => col.key === key)
                              )}
                            </Table.Cell>
                          )
                        )}
                        {isComparing && (
                          <Table.Cell style={{ width: "120px" }}>
                            {(() => {
                              const boldKey = getBoldColumnKey();
                              const boldColumn = VIEW_CONFIGS[viewType].find(
                                (col) => col.bold
                              );
                              const compareBase = getCompareBase();
                              if (
                                !compareBase ||
                                !boldKey ||
                                income.id === compareBase.id
                              ) {
                                return <Text size="2">—</Text>;
                              }
                              const currentValue = getCellValue(
                                income,
                                boldKey,
                                boldColumn
                              );
                              const baseValue = getCellValue(
                                compareBase,
                                boldKey,
                                boldColumn
                              );
                              const currentNumeric = parseFloat(
                                currentValue.replace("R$ ", "").replace(".", "")
                              );
                              const baseNumeric = parseFloat(
                                baseValue.replace("R$ ", "").replace(".", "")
                              );
                              const percentage = calculatePercentageDifference(
                                currentNumeric,
                                baseNumeric
                              );
                              return (
                                <Text
                                  size="2"
                                  weight="bold"
                                  color={getPercentageColor(percentage)}
                                >
                                  {percentage}
                                </Text>
                              );
                            })()}
                          </Table.Cell>
                        )}
                      </Table.Row>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                      <ContextMenu.Item onClick={() => setEditingId(income.id)}>
                        <Pencil1Icon /> Editar
                      </ContextMenu.Item>
                      {isComparing && (
                        <ContextMenu.Item
                          onClick={() => onCompareBaseIdChange(income.id)}
                        >
                          <SliderIcon />
                          Comparar com este
                        </ContextMenu.Item>
                      )}
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
                initialData={{ ...editingIncome }}
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
