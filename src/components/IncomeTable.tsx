import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Table,
  Card,
  Text,
  ContextMenu,
  Dialog,
  Popover,
  Button,
  IconButton,
  DropdownMenu,
  Tooltip,
  Heading
} from "@radix-ui/themes";
import {
  TrashIcon,
  Pencil1Icon,
  DragHandleDots2Icon,
  InfoCircledIcon,
  SliderIcon,
  PlusIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  DownloadIcon,
  ClockIcon,
  CalendarIcon,
  ComponentInstanceIcon,
  ComponentBooleanIcon,
  LoopIcon
} from "@radix-ui/react-icons";
import type { ComputedIncome } from "../types/income";
import {
  calculatePercentageDifference,
  formatCurrencySymbol,
  formatMonthShort
} from "../utils/formatting";
import { IncomeForm } from "./IncomeForm";
import { useIncomeContext } from "../contexts/IncomeContext";
import { useAlertDialog } from "./AlertDialogContext";
import { exportToCSV } from "../utils/exportCSV";
import {
  loadStringFromLocalStorage,
  saveStringToLocalStorage,
  loadNumberFromLocalStorage,
  saveNumberToLocalStorage
} from "../utils/storage";
import OptionComponent from "./OptionComponent";
import LabelIcon from "./LabelIcon";
import { TimeLineChart } from "./Charts/LineChart";

type CompareType = "percentage" | "absolute";
type ViewType = "hora" | "mensal" | "anual";
type GrossType = "gross" | "net";

const COMPARE_TYPE_STORAGE = "compare_type";
const VIEW_TYPE_STORAGE = "view_type";
const GROSS_TYPE_STORAGE = "gross_type";
const COMPARE_BASE_STORAGE = "compare_base_id";

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
    { key: "workweekHoursType", label: "Jornada" },
    {
      key: "grossHour",
      label: "Salário/Hora",
      liquidoKey: "netHour"
    },
    {
      key: "grossHourPlusBenefits",
      label: "Total/Hora",
      bold: true,
      liquidoKey: "netHourPlusBenefits"
    }
  ],
  mensal: [
    { key: "drag_handle", label: "", isDragHandle: true },
    {
      key: "grossMonth",
      label: "Salário/Mês",
      liquidoKey: "netMonth"
    },
    { key: "benefits", label: "Benefícios" },
    {
      key: "grossMonthPlusBenefits",
      label: "Total/Mês",
      bold: true,
      liquidoKey: "netMonthPlusBenefits"
    }
  ],
  anual: [
    { key: "drag_handle", label: "", isDragHandle: true },
    {
      key: "grossYear",
      label: "Salário/Ano",
      liquidoKey: "netYear"
    },
    { key: "grossBonus", label: "PLR", liquidoKey: "netBonus" },
    {
      key: "grossYearPlusBonus",
      label: "Salário + PLR",
      liquidoKey: "netYearPlusBonus"
    },
    { key: "benefitsYear", label: "Benefícios/Ano" },
    {
      key: "grossYearPlusBonusPlusBenefits",
      label: "Total/Ano",
      bold: true,
      liquidoKey: "netYearPlusBonusPlusBenefits"
    }
  ]
};

interface SelectOption<T> {
  value: T;
  label: string;
  icon: React.ReactNode;
}

const GROSS_TYPE_OPTIONS: Record<GrossType, SelectOption<GrossType>> = {
  gross: {
    value: "gross",
    label: "Bruto",
    icon: <ComponentInstanceIcon width="16" height="16" />
  },
  net: {
    value: "net",
    label: "Líquido",
    icon: <ComponentBooleanIcon width="16" height="16" />
  }
};

const VIEW_TYPE_OPTIONS: Record<ViewType, SelectOption<ViewType>> = {
  hora: {
    value: "hora",
    label: "Hora",
    icon: <ClockIcon width="16" height="16" />
  },
  mensal: {
    value: "mensal",
    label: "Mensal",
    icon: <CalendarIcon width="16" height="16" />
  },
  anual: {
    value: "anual",
    label: "Anual",
    icon: <LoopIcon width="16" height="16" />
  }
};

const COMPARE_TYPE_OPTIONS: Record<CompareType, SelectOption<CompareType>> = {
  percentage: {
    value: "percentage",
    label: "Percentual",
    icon: <LabelIcon>%</LabelIcon>
  },
  absolute: {
    value: "absolute",
    label: "Absoluto",
    icon: <LabelIcon>123</LabelIcon>
  }
};

export function IncomeTable() {
  const {
    incomes,
    actions: { deleteById, reorder }
  } = useIncomeContext();

  const { alert, confirm } = useAlertDialog();

  const onDelete = async (id: number) => {
    if (await confirm("Tem certeza que deseja remover esta renda?")) {
      await deleteById(id, () => {
        alert("Erro ao remover renda");
      });
    }
  };

  const onReorder = async (reorderedIncomes: ComputedIncome[]) => {
    await reorder(reorderedIncomes, () => {
      alert("Erro ao reordenar rendas");
    });
  };

  const [grossType, setGrossType] = useState<GrossType>(
    () =>
      (loadStringFromLocalStorage(GROSS_TYPE_STORAGE) as GrossType) ?? "gross"
  );
  const [viewType, setViewType] = useState<ViewType>(
    () =>
      (loadStringFromLocalStorage(VIEW_TYPE_STORAGE) as ViewType) ?? "mensal"
  );
  const [compareType, setCompareType] = useState<CompareType>(
    () =>
      (loadStringFromLocalStorage(COMPARE_TYPE_STORAGE) as CompareType) ??
      "percentage"
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [compareBaseId, setCompareBaseId] = useState<number | null>(() => {
    const savedCompareBaseId = loadNumberFromLocalStorage(COMPARE_BASE_STORAGE);

    return incomes.some((i) => i.id === savedCompareBaseId)
      ? savedCompareBaseId
      : null;
  });

  const handleSetCompareBaseId = (id: number | null) => {
    setCompareBaseId(id);
    saveNumberToLocalStorage(COMPARE_BASE_STORAGE, id);
  };
  const [popoverOpenId, setPopoverOpenId] = useState<number | null>(null);
  const [openedAddIncome, setOpenedAddIncome] = useState(false);
  // const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  const editingIncome = useMemo(
    () => (editingId ? incomes.find((i) => i.id === editingId) : null),
    [editingId, incomes]
  );

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
      // TODO: check to use a brighter color
      return `var(--${income.color}-4)`;
    }
    return "transparent";
  };

  const columns = useMemo(() => VIEW_CONFIGS[viewType], [viewType]);

  const getComparableColumnKey = useCallback((): keyof ComputedIncome => {
    const boldColumn = VIEW_CONFIGS[viewType].find((col) => col.bold);
    return (
      grossType === "gross" ? boldColumn?.key : boldColumn?.liquidoKey
    ) as keyof ComputedIncome;
  }, [viewType, grossType]);

  const compareBase = useMemo(() => {
    if (compareBaseId !== null) {
      return incomes.find((i) => i.id === compareBaseId) || null;
    }
    return incomes[0] || null;
  }, [compareBaseId, incomes]);

  const getPercentageColor = (percentage: string): "gray" | "green" | "red" => {
    if (percentage === "N/A") return "gray";
    if (percentage.includes("+")) return "green";
    return "red";
  };

  const timelineData = useMemo(
    () =>
      incomes.reduce<Record<string, number[]>>(
        (
          acc,
          {
            name,
            grossMonthPlusBenefits,
            netMonthPlusBenefits,
            grossBonus,
            netBonus
          }
        ) => {
          const monthlyValue =
            grossType === "gross"
              ? grossMonthPlusBenefits
              : netMonthPlusBenefits;

          const bonusValue = grossType === "gross" ? grossBonus : netBonus;

          acc[name] = Array.from({ length: 13 }, (_, i) =>
            i === 0 ? bonusValue : bonusValue + monthlyValue * i
          );

          return acc;
        },
        {}
      ),
    [incomes, grossType]
  );

  return (
    <Flex gap="4" direction="column">
      <Card style={{ padding: 0 }}>
        <Box px="4" pt="4" pb="1">
          <Heading size="5">Comparar Rendas</Heading>
          <Text size="2">Compare diferentes salários.</Text>
        </Box>

        <Box>
          {/* Desktop/Tablet View (md and up) */}
          <Flex
            justify="between"
            align="center"
            mt="4"
            mb="2"
            px="4"
            direction={{ initial: "column", md: "row" }}
            gap="4"
          >
            <Flex
              gap="4"
              align="end"
              width={{ initial: "100%", md: "auto" }}
              wrap="wrap"
            >
              {/* <Flex align="center" gap="4" style={{ width: "100%" }}> */}
              <OptionComponent<GrossType>
                label="Tipo"
                value={grossType}
                onChange={(value) => {
                  setGrossType(value as GrossType);
                  saveStringToLocalStorage(GROSS_TYPE_STORAGE, value);
                }}
                options={GROSS_TYPE_OPTIONS}
              />

              <OptionComponent<ViewType>
                label="Período"
                value={viewType}
                onChange={(value) => {
                  setViewType(value as ViewType);
                  saveStringToLocalStorage(VIEW_TYPE_STORAGE, value);
                }}
                options={VIEW_TYPE_OPTIONS}
              />

              <OptionComponent<CompareType>
                label="Comparação"
                value={compareType}
                onChange={(value) => {
                  setCompareType(value as CompareType);
                  saveStringToLocalStorage(COMPARE_TYPE_STORAGE, value);
                }}
                options={COMPARE_TYPE_OPTIONS}
              />
            </Flex>

            <Flex
              gap="2"
              align="end"
              justify="end"
              width={{ initial: "100%", md: "auto" }}
              wrap="wrap"
            >
              {/* TODO: when including more options, show in dropdown menu
             <Box display={{ initial: "block", md: "none" }}> */}
              <Tooltip content="Exportar Rendas para arquivo de planilhas">
                <Button
                  onClick={() => exportToCSV(incomes)}
                  disabled={incomes.length === 0}
                  variant="surface"
                >
                  <DownloadIcon /> Exportar
                </Button>
              </Tooltip>

              {/* <DropdownMenu.Root
              open={optionsMenuOpen}
              onOpenChange={setOptionsMenuOpen}
            >
              <DropdownMenu.Trigger>
                <IconButton variant="surface">
                  <DotsHorizontalIcon width="18" height="18" />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onClick={() => exportToCSV(incomes)}
                  disabled={incomes.length === 0}
                >
                  <DownloadIcon /> Exportar
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root> */}

              <Tooltip content="Adicionar outra Renda a comparação">
                <Button
                  variant="surface"
                  onClick={() => setOpenedAddIncome(true)}
                >
                  <PlusIcon /> Adicionar
                </Button>
              </Tooltip>
            </Flex>
          </Flex>
        </Box>

        {incomes.length > 0 && (
          <Box
            style={{
              overflowX: "auto",
              borderRadius: "var(--radius-2)"
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
                        style={{
                          minWidth: "140px"
                        }}
                      >
                        <Flex align="center" gap="1">
                          {label}
                          {/* {bold && <ComponentInstanceIcon />} */}
                        </Flex>
                      </Table.ColumnHeaderCell>
                    )
                  )}
                  <Table.ColumnHeaderCell
                    style={{ minWidth: "140px", maxWidth: "140px" }}
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
                        onDragEnter={() =>
                          draggedId && setDragOverId(income.id)
                        }
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
                                        {formatCurrencySymbol(
                                          income.grossMonth
                                        )}
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Text size="1" weight="bold">
                                        {income.plrType === "multiplier" &&
                                          "Multiplicador de"}{" "}
                                        PLR:{" "}
                                      </Text>
                                      <Text size="1">
                                        {income.plrType === "multiplier" ? (
                                          <>
                                            {income.bonusMultiplier
                                              .toFixed(2)
                                              .replace(".", ",")}
                                            x
                                          </>
                                        ) : (
                                          formatCurrencySymbol(
                                            income.bonusFixed
                                          )
                                        )}
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Text size="1" weight="bold">
                                        Benefícios:{" "}
                                      </Text>
                                      <Text size="1">
                                        {formatCurrencySymbol(income.benefits)}
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Text size="1" weight="bold">
                                        Jornada:{" "}
                                      </Text>
                                      <Text size="1">
                                        {income.workweekHoursType}
                                      </Text>
                                    </Box>
                                  </Flex>
                                </Box>
                              </Popover.Content>
                            </Popover.Root>
                          </Flex>
                        </Table.Cell>
                        {columns.map(
                          ({ key, bold, isDragHandle, liquidoKey }) =>
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
                                className="valuechange-animated"
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
                          key={`${income.id}-compare-${showLiquido}-${viewType}-${compareType}`}
                          style={{ minWidth: "140px", maxWidth: "140px" }}
                          className="valuechange-animated"
                        >
                          {(() => {
                            const boldKey = getComparableColumnKey();
                            if (
                              !compareBase ||
                              !boldKey ||
                              income.id === compareBase.id
                            ) {
                              return <Text size="2">—</Text>;
                            }
                            const currentValue = income[boldKey] as number;
                            const baseValue = compareBase[boldKey] as number;
                            if (compareType === "absolute") {
                              const difference = currentValue - baseValue;
                              const sign = difference > 0 ? "+" : <>&minus;</>;
                              return (
                                <Text
                                  size="2"
                                  weight="bold"
                                  color={
                                    difference > 0
                                      ? "green"
                                      : difference < 0
                                        ? "red"
                                        : "gray"
                                  }
                                >
                                  {sign}
                                  {formatCurrencySymbol(Math.abs(difference))}
                                </Text>
                              );
                            }
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
                                  onClick={() =>
                                    handleSetCompareBaseId(income.id)
                                  }
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
                          onClick={() => handleSetCompareBaseId(income.id)}
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
            <Dialog.Content aria-describedby={undefined}>
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
                  onSubmit={() => setEditingId(null)}
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
          <Dialog.Content aria-describedby={undefined}>
            <Flex justify="between" align="start" mt="4" px="4">
              <Dialog.Title>Adicionar Renda</Dialog.Title>

              <Dialog.Close>
                <IconButton size="3" variant="ghost">
                  <Cross2Icon width="18" height="18" />
                </IconButton>
              </Dialog.Close>
            </Flex>

            <Box p="4">
              <IncomeForm />
            </Box>
          </Dialog.Content>
        </Dialog.Root>
      </Card>

      <Card style={{ padding: "0" }} className="popup-animated">
        <Flex p="0" gap="1" direction="column">
          <Flex p="4" gap="4" direction="column">
            <Box>
              <Heading size="5">Evolução Salarial</Heading>
              <Text size="2">
                Compare a evolução dos salários ao longo do ano.
              </Text>
            </Box>

            <Flex
              gap="4"
              align="end"
              width={{ initial: "100%", md: "auto" }}
              wrap="wrap"
            >
              <OptionComponent<GrossType>
                label="Tipo"
                value={grossType}
                onChange={(value) => {
                  setGrossType(value as GrossType);
                  saveStringToLocalStorage(GROSS_TYPE_STORAGE, value);
                }}
                options={GROSS_TYPE_OPTIONS}
              />
            </Flex>
          </Flex>

          {/* TODO: show a comparision using bar chart */}

          <Flex pl="0" pb="4" pr="1" gap="4" direction="column">
            <TimeLineChart
              data={timelineData}
              colors={incomes.reduce<Record<string, string>>(
                (acc, { name, color }) => (
                  (acc[name] = color ?? "transparent"),
                  acc
                ),
                {}
              )}
              formatter={(value, _) => formatCurrencySymbol(value)}
              labels={Array.from({ length: 13 }, (_, i) =>
                i === 0 ? "PLR" : formatMonthShort(i)
              )}
            />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
