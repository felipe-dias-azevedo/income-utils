import { useState } from "react";
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
import { CompareTax } from "./components/CompareTax";
import { exportToCSV } from "./utils/exportCSV";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useIncomeContext } from "./contexts/IncomeContext";

type Page = "compareIncomes" | "compareTaxes";

export default function App() {
  const {
    incomes,
    isLoading,
    actions: { isLoadingAction }
  } = useIncomeContext();

  const [page, setPage] = useState<Page>("compareIncomes");

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
          <Button onClick={() => setPage("compareIncomes")} variant="surface">
            Comparar Rendas
          </Button>
          <Button onClick={() => setPage("compareTaxes")} variant="surface">
            Comparar Impostos
          </Button>

          {(isLoading || isLoadingAction) && <Spinner />}
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

          <ThemeToggle />
        </Header>

        {/* <Box p="4" pb="6" style={{ paddingTop: "100px" }}> */}
        <Box pt="4" pb="6">
          <Flex direction="column" gap="6">
            {page === "compareIncomes" && (
              <>
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
              </>
            )}

            {page === "compareTaxes" && <CompareTax />}
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
