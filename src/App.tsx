import {
  Box,
  Container,
  Flex,
  Heading,
  Card,
  Button,
  Spinner
} from "@radix-ui/themes";
import { IncomeForm } from "./components/IncomeForm";
import { IncomeTable } from "./components/IncomeTable";
import { Header } from "./components/Header";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "next-themes";
import { exportToCSV } from "./utils/exportCSV";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useIncomeContext } from "./contexts/IncomeContext";
import { useCallback, useMemo } from "react";

export default function App() {
  const { theme, setTheme } = useTheme();
  const {
    incomes,
    isLoading,
    actions: { isLoadingAction }
  } = useIncomeContext();

  const isDark = useMemo(() => theme === "dark", [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [setTheme, isDark]);

  return (
    <Box
      className="bg-gradient"
      style={{
        // backgroundColor: "var(--gray-2)",
        minHeight: "100vh",
        transition: "background-color 0.3s ease"
      }}
    >
      <Container size="4" px="4" pt="4">
        <Header>
          {(isLoading || isLoadingAction) && <Spinner />}
          {theme}
          <Button
            onClick={() => exportToCSV(incomes)}
            disabled={incomes.length === 0}
            variant="surface"
            style={{
              cursor: incomes.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            <DownloadIcon /> Exportar
          </Button>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </Header>

        {/* <Box p="4" pb="6" style={{ paddingTop: "100px" }}> */}
        <Box pt="4" pb="6">
          <Flex direction="column" gap="6">
            {!isLoading && incomes.length > 0 && <IncomeTable />}

            {!isLoading && incomes.length === 0 && (
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">
                    Adicionar Renda
                  </Heading>

                  <IncomeForm />
                </Box>
              </Card>
            )}
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
