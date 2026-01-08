import { useState } from "react";
import { Box, Container, Flex, Heading, Card, Button } from "@radix-ui/themes";
import { useLiveQuery } from "dexie-react-hooks";
import type { IncomeEntry, ComputedIncome } from "./types/income";
import { db } from "./db/database";
import { computeIncome } from "./utils/incomeCalculations";
import { IncomeForm } from "./components/IncomeForm";
import { IncomeTable } from "./components/IncomeTable";
import { Header } from "./components/Header";
import { useAlertDialog } from "./components/AlertDialogContext";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "next-themes";
import { exportToCSV } from "./utils/exportCSV";
import { DownloadIcon } from "@radix-ui/react-icons";

export default function App() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const { alert, confirm } = useAlertDialog();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Load all incomes from database, sorted by index
  const incomeEntries = useLiveQuery(
    () => db.incomes.orderBy("index").toArray(),
    []
  );

  const computedIncomes: ComputedIncome[] = (incomeEntries || []).map((entry) =>
    computeIncome(entry)
  );

  const handleAddIncome = async (entry: IncomeEntry) => {
    setIsLoading(true);
    try {
      // Get the next index
      const maxIndexItem = await db.incomes.orderBy("index").last();
      const nextIndex = maxIndexItem ? maxIndexItem.index + 1 : 0;
      await db.incomes.add({ ...entry, index: nextIndex });
    } catch (error) {
      console.error("Error adding income:", error);
      alert("Erro ao adicionar renda");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIncome = async (id: number) => {
    if (await confirm("Tem certeza que deseja remover esta renda?")) {
      try {
        await db.incomes.delete(id);
      } catch (error) {
        console.error("Error deleting income:", error);
        alert("Erro ao remover renda");
      }
    }
  };

  const handleUpdateIncome = async (id: number, entry: IncomeEntry) => {
    setIsLoading(true);
    try {
      await db.incomes.update(id, entry);
    } catch (error) {
      console.error("Error updating income:", error);
      alert("Erro ao atualizar renda");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorderIncomes = async (reorderedIncomes: ComputedIncome[]) => {
    try {
      // Update index for all items based on their new positions
      // TODO: update bulk
      await Promise.all(
        reorderedIncomes.map((income, newIndex) =>
          db.incomes.update(income.id, {
            index: newIndex
          } as Partial<IncomeEntry>)
        )
      );
    } catch (error) {
      console.error("Error reordering incomes:", error);
      alert("Erro ao reordenar rendas");
    }
  };

  return (
    <Box
      className="bg-gradient"
      style={{
        // backgroundColor: "var(--gray-2)",
        minHeight: "100vh",
        transition: "background-color 0.3s ease"
      }}
    >
      <Header>
        <Button
          onClick={() => exportToCSV(computedIncomes)}
          disabled={computedIncomes.length === 0}
          variant="surface"
          style={{
            cursor: computedIncomes.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          <DownloadIcon /> Exportar
        </Button>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </Header>

      <Container size="4">
        <Box p="4" pb="6" style={{ paddingTop: "100px" }}>
          <Flex direction="column" gap="6">
            {computedIncomes.length > 0 && (
              <IncomeTable
                incomes={computedIncomes}
                onDelete={handleDeleteIncome}
                onUpdate={handleUpdateIncome}
                onReorder={handleReorderIncomes}
              />
            )}

            <Card>
              <Box p="4">
                <Heading size="4" mb="4">
                  Adicionar Renda
                </Heading>
                <IncomeForm
                  onSubmit={handleAddIncome}
                  isLoading={isLoading}
                  isEditing={false}
                />
              </Box>
            </Card>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
