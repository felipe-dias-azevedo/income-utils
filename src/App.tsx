import { useState } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Card,
  Spinner,
  SegmentedControl
} from "@radix-ui/themes";
import { IncomeForm } from "./components/IncomeForm";
import { IncomeTable } from "./components/IncomeTable";
import { Header } from "./components/Header";
import { ThemeToggle } from "./components/ThemeToggle";
import { CompareTax } from "./components/CompareTax";

import { useIncomeContext } from "./contexts/IncomeContext";
import {
  loadStringFromLocalStorage,
  saveStringToLocalStorage
} from "./utils/storage";

type Page = "compareIncomes" | "compareTaxes";
const PAGE_STORAGE = "page";

export default function App() {
  const {
    incomes,
    isLoading,
    actions: { isLoadingAction }
  } = useIncomeContext();

  const [page, setPage] = useState<Page>(
    () => (loadStringFromLocalStorage(PAGE_STORAGE) as Page) ?? "compareIncomes"
  );

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
          <Header.Start />
          <Header.Center>
            <SegmentedControl.Root
              value={page}
              onValueChange={(value) => {
                setPage(value as Page);
                saveStringToLocalStorage(PAGE_STORAGE, value);
              }}
              className="segmented-colored"
            >
              <SegmentedControl.Item value="compareIncomes">
                Comparar Rendas
              </SegmentedControl.Item>
              <SegmentedControl.Item value="compareTaxes">
                Comparar Impostos
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </Header.Center>
          <Header.End>
            {(isLoading || isLoadingAction) && <Spinner />}
            <ThemeToggle />
          </Header.End>
        </Header>

        {/* <Box p="4" pb="6" style={{ paddingTop: "100px" }}> */}
        <Box pt="4" pb="6">
          <Flex direction="column" gap="6">
            {page === "compareIncomes" && (
              <>
                {!isLoading && incomes.length > 0 && <IncomeTable />}

                {!isLoading && incomes.length === 0 && (
                  <Card>
                    <Box p="2">
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
