import { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Table,
  Card,
  Text,
  ContextMenu,
  Dialog,
  Popover,
  SegmentedControl,
  Separator,
  Button,
  IconButton,
  DropdownMenu
} from "@radix-ui/themes";
import {
  TrashIcon,
  Pencil1Icon,
  DragHandleDots2Icon,
  InfoCircledIcon,
  SliderIcon,
  PlusIcon,
  Cross2Icon,
  DotsHorizontalIcon
} from "@radix-ui/react-icons";
import type { ComputedIncome, IncomeEntry } from "../types/income";
import { formatCurrencySymbol } from "../utils/formatting";
import { IncomeForm } from "./IncomeForm";
import "../styles/table-animations.css";

interface IncomeTableProps {
  incomes: ComputedIncome[];
  onAdd: (entry: IncomeEntry) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, entry: IncomeEntry) => void;
  onReorder?: (incomes: ComputedIncome[]) => void;
}

type ViewType = "hora" | "mensal" | "anual";
type GrossType = "gross" | "net";

interface ColumnConfig {
  key: keyof ComputedIncome | "drag_handle";
  label: string;
  bold?: boolean;
  isDragHandle?: boolean;
  liquidoKey?: keyof ComputedIncome;
}

const VIEW_CONFIGS: Record<ViewType, ColumnConfig[]> = {
  hora: [
    { key: "drag_handle", label: "", isDragHandle: true },
    { key: "jornada", label: "Jornada" },
    {
      key: "salarioHora",
      label: "Salário/Hora",
      liquidoKey: "salarioHoraLiquido"
    },
    {
      key: "salarioHoraAnualOutros",
      label: "Total/Hora",
      bold: true,
      liquidoKey: "salarioHoraAnualOutrosLiquido"
    }
  ],
  mensal: [
    { key: "drag_handle", label: "", isDragHandle: true },
    {
      key: "salarioMensal",
      label: "Salário/Mês",
      liquidoKey: "salarioLiquido"
    },
    { key: "outros", label: "Benefícios" },
    {
      key: "totalPerMonthPlusOthers",
      label: "Total/Mês",
      bold: true,
      liquidoKey: "totalMesLiquido"
    }
  ],
  anual: [
    { key: "drag_handle", label: "", isDragHandle: true },
    {
      key: "salarioAnual",
      label: "Salário/Ano",
      liquidoKey: "salarioAnualLiquido"
    },
    { key: "bonusAmount", label: "PLR", liquidoKey: "bonusLiquido" },
    {
      key: "totalPerYear",
      label: "Salário + PLR",
      liquidoKey: "totalAnoLiquido"
    },
    { key: "outrosAnual", label: "Benefícios/Ano" },
    {
      key: "totalPerYearPlusOthers",
      label: "Total/Ano",
      bold: true,
      liquidoKey: "totalAnoOutrosLiquido"
    }
  ]
};

export function IncomeTable({
  incomes,
  onAdd,
  onDelete,
  onUpdate,
  onReorder
}: IncomeTableProps) {
  const [grossType, setGrossType] = useState<GrossType>("gross");
  const [viewType, setViewType] = useState<ViewType>("mensal");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [compareBaseId, setCompareBaseId] = useState<number | null>(null);
  const [popoverOpenId, setPopoverOpenId] = useState<number | null>(null);
  const [openedAddIncome, setOpenedAddIncome] = useState(false);
  const editingIncome = editingId
    ? incomes.find((i) => i.id === editingId)
    : null;

  const showLiquido = useMemo(() => grossType === "net", [grossType]);

  const getCellValue = (
    income: ComputedIncome,
    columnKey: string,
    column?: ColumnConfig
  ) => {
    // Determine which property key to use based on gross/net mode
    const propertyKey =
      showLiquido && column?.liquidoKey
        ? column.liquidoKey
        : (columnKey as keyof ComputedIncome);

    // Get the value directly from the income object
    const value = income[propertyKey];

    // Format numbers, return other types as-is
    if (typeof value === "number") {
      return formatCurrencySymbol(value);
    }

    return value ?? "";
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
    if (income.color && income.color !== "transparent") {
      return `var(--${income.color}-4)`;
    }
    return "transparent";
  };

  const columns = VIEW_CONFIGS[viewType];

  const getBoldColumnKey = (): keyof ComputedIncome => {
    const boldColumn = VIEW_CONFIGS[viewType].find((col) => col.bold);
    return boldColumn?.key as keyof ComputedIncome;
  };

  const compareBase = useMemo(() => {
    if (compareBaseId !== null) {
      return incomes.find((i) => i.id === compareBaseId) || null;
    }
    return incomes[0] || null;
  }, [compareBaseId, incomes]);

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
    <Card style={{ padding: 0 }}>
      <Box>
        <Flex
          justify="between"
          align="center"
          mt="4"
          mb="2"
          px="4"
          overflowX="auto"
          gap="4"
        >
          <Flex align="center" gap="4">
            <SegmentedControl.Root
              value={grossType}
              onValueChange={(value) => setGrossType(value as GrossType)}
              className="segmented-colored"
            >
              <SegmentedControl.Item value="gross">Bruto</SegmentedControl.Item>
              <SegmentedControl.Item value="net">Líquido</SegmentedControl.Item>
            </SegmentedControl.Root>

            <Separator orientation="vertical" />

            <SegmentedControl.Root
              value={viewType}
              onValueChange={(value) => setViewType(value as ViewType)}
              className="segmented-colored"
            >
              <SegmentedControl.Item value="hora">Hora</SegmentedControl.Item>
              <SegmentedControl.Item value="mensal">
                Mensal
              </SegmentedControl.Item>
              <SegmentedControl.Item value="anual">Anual</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
          <Button variant="surface" onClick={() => setOpenedAddIncome(true)}>
            <PlusIcon /> Adicionar
          </Button>
        </Flex>
      </Box>

      {incomes.length > 0 && (
        <Box
          style={{
            overflowX: "auto",
            borderRadius: "8px"
          }}
        >
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell
                  style={{ width: "40px" }}
                ></Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ minWidth: "180px" }}>
                  Nome
                </Table.ColumnHeaderCell>
                {columns.map(({ key, label, isDragHandle }) =>
                  isDragHandle ? null : (
                    <Table.ColumnHeaderCell
                      key={key}
                      style={{ minWidth: "140px" }}
                    >
                      {label}
                    </Table.ColumnHeaderCell>
                  )
                )}
                <Table.ColumnHeaderCell
                  style={{ minWidth: "120px", maxWidth: "120px" }}
                >
                  Comparação
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell
                  style={{ width: "40px" }}
                ></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {incomes.map((income) => (
                <ContextMenu.Root key={income.id}>
                  <ContextMenu.Trigger>
                    <Table.Row
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, income.id)}
                      onDragLeave={(e) => {
                        if (e.currentTarget === e.target) {
                          setDragOverId(null);
                        }
                      }}
                      onDragEnter={() => draggedId && setDragOverId(income.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        backgroundColor: getRowBackgroundColor(income),
                        opacity: draggedId === income.id ? 0.35 : 1,
                        border:
                          dragOverId === income.id && draggedId
                            ? "2px dashed var(--accent-10)"
                            : 0,
                        transition: "border 50ms ease-out"
                      }}
                    >
                      <Table.Cell
                        style={{
                          width: "40px"
                        }}
                      >
                        <Flex
                          draggable
                          onDragStart={(e) => handleDragStart(e, income.id)}
                          align="center"
                          style={{
                            cursor:
                              draggedId === income.id ? "grabbing" : "grab",
                            transition: "background-color 0.2s ease"
                          }}
                        >
                          <DragHandleDots2Icon width="18" height="18" />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell
                        style={{
                          minWidth: "180px",
                          maxWidth: "180px"
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
                            <Popover.Trigger
                              onMouseEnter={() => setPopoverOpenId(income.id)}
                              onMouseLeave={() => setPopoverOpenId(null)}
                            >
                              <InfoCircledIcon
                                width="16"
                                height="16"
                                style={{ cursor: "pointer", flexShrink: 0 }}
                              />
                            </Popover.Trigger>
                            <Popover.Content
                              onMouseEnter={() => setPopoverOpenId(income.id)}
                              onMouseLeave={() => setPopoverOpenId(null)}
                            >
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
                                      <Text size="1">{income.description}</Text>
                                    </Box>
                                  )}
                                  <Box>
                                    <Text size="1" weight="bold">
                                      Salário Mensal:{" "}
                                    </Text>
                                    <Text size="1">
                                      {formatCurrencySymbol(
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
                                      Benefícios:{" "}
                                    </Text>
                                    <Text size="1">
                                      {formatCurrencySymbol(income.outros)}
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
                      {columns.map(({ key, bold, isDragHandle, liquidoKey }) =>
                        isDragHandle ? null : (
                          <Table.Cell
                            key={
                              liquidoKey === undefined
                                ? `${income.id}-${key}`
                                : `${income.id}-${key}-${showLiquido}`
                            }
                            style={{
                              minWidth: "140px",
                              fontWeight: bold === true ? "bold" : "normal"
                            }}
                            className="table-cell-animated"
                          >
                            {getCellValue(
                              income,
                              key,
                              columns.find((col) => col.key === key)
                            )}
                          </Table.Cell>
                        )
                      )}
                      <Table.Cell
                        key={`${income.id}-compare-${showLiquido}-${viewType}`}
                        style={{ minWidth: "120px", maxWidth: "120px" }}
                        className="table-cell-animated"
                      >
                        {(() => {
                          const boldKey = getBoldColumnKey();
                          if (
                            !compareBase ||
                            !boldKey ||
                            income.id === compareBase.id
                          ) {
                            return <Text size="2">—</Text>;
                          }
                          const currentValue = income[boldKey] as number;
                          const baseValue = compareBase[boldKey] as number;
                          const percentage = calculatePercentageDifference(
                            currentValue,
                            baseValue
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
                      <Table.Cell px="4" style={{ width: "40px" }}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <IconButton color="gray" size="2" variant="ghost">
                              <DotsHorizontalIcon width="18" height="18" />
                            </IconButton>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content>
                            <DropdownMenu.Item
                              onClick={() => setEditingId(income.id)}
                            >
                              <Pencil1Icon /> Editar
                            </DropdownMenu.Item>
                            {compareBase?.id !== income.id && (
                              <DropdownMenu.Item
                                onClick={() => setCompareBaseId(income.id)}
                              >
                                <SliderIcon /> Comparar com este
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Item
                              color="red"
                              onClick={() => onDelete(income.id)}
                            >
                              <TrashIcon /> Deletar
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    </Table.Row>
                  </ContextMenu.Trigger>
                  <ContextMenu.Content>
                    <ContextMenu.Item onClick={() => setEditingId(income.id)}>
                      <Pencil1Icon /> Editar
                    </ContextMenu.Item>
                    {compareBase?.id !== income.id && (
                      <ContextMenu.Item
                        onClick={() => setCompareBaseId(income.id)}
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

      {editingIncome && editingId !== null && (
        <Dialog.Root
          open={editingId !== null}
          onOpenChange={(open) => {
            if (!open) setEditingId(null);
          }}
        >
          <Dialog.Content>
            <Flex justify="between" align="start" mt="4" px="4">
              <Dialog.Title>Editar Renda</Dialog.Title>

              <Dialog.Close>
                <IconButton size="3" variant="ghost">
                  <Cross2Icon width="18" height="18" />
                </IconButton>
              </Dialog.Close>
            </Flex>
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

      <Dialog.Root
        open={openedAddIncome}
        onOpenChange={(open) => {
          if (!open) setOpenedAddIncome(false);
        }}
      >
        <Dialog.Content>
          <Flex justify="between" align="start" mt="4" px="4">
            <Dialog.Title>Adicionar Renda</Dialog.Title>

            <Dialog.Close>
              <IconButton size="3" variant="ghost">
                <Cross2Icon width="18" height="18" />
              </IconButton>
            </Dialog.Close>
          </Flex>

          <Box p="4">
            <IncomeForm onSubmit={onAdd} isLoading={false} isEditing={false} />
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
}
