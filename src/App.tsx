import { useState } from "react";
import { Box, Container, Flex, Heading, Card, Button } from "@radix-ui/themes";
import { useLiveQuery } from "dexie-react-hooks";
import type { IncomeEntry, ComputedIncome } from "./types/income";
import { db } from "./db/database";
import { computeIncome } from "./utils/incomeCalculations";
import { IncomeForm } from "./components/IncomeForm";
import { IncomeTable } from "./components/IncomeTable";
import { Header } from "./components/Header";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "next-themes";
import { exportToCSV } from "./utils/exportCSV";
import { DownloadIcon } from "@radix-ui/react-icons";

export default function App() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

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
      alert("Erro ao adicionar rendimento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIncome = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este rendimento?")) {
      try {
        await db.incomes.delete(id);
      } catch (error) {
        console.error("Error deleting income:", error);
        alert("Erro ao remover rendimento");
      }
    }
  };

  const handleUpdateIncome = async (id: number, entry: IncomeEntry) => {
    setIsLoading(true);
    try {
      await db.incomes.update(id, entry);
    } catch (error) {
      console.error("Error updating income:", error);
      alert("Erro ao atualizar rendimento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorderIncomes = async (reorderedIncomes: ComputedIncome[]) => {
    try {
      // Update index for all items based on their new positions
      await Promise.all(
        reorderedIncomes.map((income, newIndex) =>
          db.incomes.update(income.id, {
            index: newIndex,
          } as Partial<IncomeEntry>)
        )
      );
    } catch (error) {
      console.error("Error reordering incomes:", error);
      alert("Erro ao reordenar rendimentos");
    }
  };

  return (
    <Box
      style={{
        backgroundColor: isDark ? "#232323" : "#ffffff",
        color: isDark ? "#ffffff" : "#000000",
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
      }}
    >
      <Header isDark={isDark}>
        <Button
          onClick={() => exportToCSV(computedIncomes)}
          disabled={computedIncomes.length === 0}
          variant="soft"
          style={{
            borderRadius: "20px",
            cursor: computedIncomes.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          <DownloadIcon /> Exportar
        </Button>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </Header>

      <Container size="4">
        <Box p="4" style={{ paddingTop: "100px" }}>
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
                  Adicionar Rendimento
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
