import { useState } from "react";
import { Box, Container, Flex, Heading, Card } from "@radix-ui/themes";
import { useLiveQuery } from "dexie-react-hooks";
import type { IncomeEntry, ComputedIncome } from "./types/income";
import { db } from "./db/database";
import { computeIncome } from "./utils/incomeCalculations";
import { IncomeForm } from "./components/IncomeForm";
import { IncomeTable } from "./components/IncomeTable";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "next-themes";

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
            index: newIndex
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
        transition: "background-color 0.3s ease"
      }}
    >
      <Container size="4">
        <Box p="4">
          <Flex justify="between" align="center" mb="6">
            <Heading size="8">Comparador de Rendimentos</Heading>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </Flex>

          <Flex direction="column" gap="6">
            <IncomeTable
              incomes={computedIncomes}
              onDelete={handleDeleteIncome}
              onUpdate={handleUpdateIncome}
              onReorder={handleReorderIncomes}
            />
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
