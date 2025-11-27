import { useEffect, useState } from "react";
import { Box, Container, Flex, Heading, Card } from "@radix-ui/themes";
import { useLiveQuery } from "dexie-react-hooks";
import type { IncomeEntry, ComputedIncome } from "./types/income";
import { db } from "./db/database";
import { computeIncome } from "./utils/incomeCalculations";
import { IncomeForm } from "./components/IncomeForm";
import { IncomeTable } from "./components/IncomeTable";
import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDark(shouldBeDark);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.style.colorScheme = "dark";
    } else {
      htmlElement.style.colorScheme = "light";
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Load all incomes from database
  const incomeEntries = useLiveQuery(() => db.incomes.toArray(), []);

  const computedIncomes: ComputedIncome[] = (incomeEntries || []).map((entry) =>
    computeIncome(entry)
  );

  const handleAddIncome = async (entry: IncomeEntry) => {
    setIsLoading(true);
    try {
      await db.incomes.add(entry);
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

  return (
    <Box
      style={{
        backgroundColor: isDark ? "#232323" : "#ffffff",
        color: isDark ? "#ffffff" : "#000000",
        minHeight: "100vh",
        transition: "background-color 0.3s ease"
      }}
    >
      <Container size="3">
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
