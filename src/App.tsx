import { useState } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Card,
  Spinner,
  SegmentedControl,
  DropdownMenu,
  Button,
  Separator
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
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import AppUpdatedDate from "./components/AppUpdatedDate";

type Page = "compareIncomes" | "compareTaxes" | "compareFinancings";
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
            <Flex
              display={{ initial: "flex", sm: "none" }}
              gap="3"
              align="center"
            >
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button variant="surface">
                    <HamburgerMenuIcon />
                    <DropdownMenu.TriggerIcon />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item
                    onSelect={() => {
                      setPage("compareIncomes");
                      saveStringToLocalStorage(PAGE_STORAGE, "compareIncomes");
                    }}
                  >
                    {/* TODO: add icon to item option */}
                    Rendas
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => {
                      setPage("compareTaxes");
                      saveStringToLocalStorage(PAGE_STORAGE, "compareTaxes");
                    }}
                  >
                    Impostos
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator />

                  <DropdownMenu.Item
                    onSelect={() => {
                      setPage("compareFinancings");
                      saveStringToLocalStorage(
                        PAGE_STORAGE,
                        "compareFinancings"
                      );
                    }}
                  >
                    Financiamentos
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <AppUpdatedDate />
            </Flex>

            <Flex
              gap="3"
              align="center"
              display={{ initial: "none", sm: "flex" }}
            >
            <SegmentedControl.Root
              value={page}
              onValueChange={(value) => {
                setPage(value as Page);
                saveStringToLocalStorage(PAGE_STORAGE, value);
              }}
              className="segmented-colored"
            >
              <SegmentedControl.Item value="compareIncomes">
                  Rendas
              </SegmentedControl.Item>
              <SegmentedControl.Item value="compareTaxes">
                  Impostos
                </SegmentedControl.Item>
              </SegmentedControl.Root>

              <Separator orientation="vertical" />

              <SegmentedControl.Root
                value={page}
                onValueChange={(value) => {
                  setPage(value as Page);
                  saveStringToLocalStorage(PAGE_STORAGE, value);
                }}
                className="segmented-colored"
              >
                <SegmentedControl.Item value="compareFinancings">
                  Financiamentos
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            </Flex>
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
