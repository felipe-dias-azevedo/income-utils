import { useState } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Spinner,
  DropdownMenu,
  Button
} from "@radix-ui/themes";
import { IncomeForm } from "./components/IncomeForm";
import { CompareIncomes } from "./components/CompareIncomes";
import { Header } from "./components/Header";
import { ThemeToggle } from "./components/ThemeToggle";
import { CompareTax } from "./components/CompareTax";
import { CompareFinancing } from "./components/CompareFinancing";

import { useIncomeContext } from "./contexts/IncomeContext";
import {
  loadStringFromLocalStorage,
  saveStringToLocalStorage
} from "./utils/storage";
import {
  ActivityLogIcon,
  ArrowUpIcon,
  BarChartIcon,
  DrawingPinIcon,
  HamburgerMenuIcon,
  PieChartIcon
} from "@radix-ui/react-icons";
import AppUpdatedDate from "./components/AppUpdatedDate";
import CompareCompoundInterest from "./components/CompareCompoundInterest";
import TimeToGoal from "./components/TimeToGoal";
import ContentCard from "./components/Common/ContentCard";
import Test from "./components/Test";

type Page =
  | "compareIncomes"
  | "compareTaxes"
  | "compareFinancings"
  | "compareCompoundInterest"
  | "timeToGoal"
  | "test"; //TODO: remove test page
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
          {/* <Header.Start /> */}
          <Header.Center>
            <Flex gap="3" align="center">
              {/* TODO: improve */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button variant="surface">
                    <HamburgerMenuIcon />
                    Simulador Financeiro
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
                    <BarChartIcon />
                    Comparar Rendas
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => {
                      setPage("compareTaxes");
                      saveStringToLocalStorage(PAGE_STORAGE, "compareTaxes");
                    }}
                  >
                    <PieChartIcon />
                    Calcular Líquido
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
                    <ActivityLogIcon />
                    Financiamentos
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator />

                  <DropdownMenu.Item
                    onSelect={() => {
                      setPage("compareCompoundInterest");
                      saveStringToLocalStorage(
                        PAGE_STORAGE,
                        "compareCompoundInterest"
                      );
                    }}
                  >
                    <ArrowUpIcon />
                    Juros Compostos
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => {
                      setPage("timeToGoal");
                      saveStringToLocalStorage(PAGE_STORAGE, "timeToGoal");
                    }}
                  >
                    <DrawingPinIcon />
                    Meta
                  </DropdownMenu.Item>

                  {/* TODO: remove test */}
                  <DropdownMenu.Separator />

                  <DropdownMenu.Item
                    onSelect={() => {
                      setPage("test");
                      saveStringToLocalStorage(PAGE_STORAGE, "test");
                    }}
                  >
                    Test
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              <AppUpdatedDate />
            </Flex>

            {/* <Flex
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

              <SegmentedControl.Root
                value={page}
                onValueChange={(value) => {
                  setPage(value as Page);
                  saveStringToLocalStorage(PAGE_STORAGE, value);
                }}
                className="segmented-colored"
              >
                <SegmentedControl.Item value="compareCompoundInterest">
                  Juros Compostos
                </SegmentedControl.Item>
                <SegmentedControl.Item value="timeToGoal">
                  Meta
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Flex> */}
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
                {!isLoading && incomes.length > 0 && <CompareIncomes />}

                {!isLoading && incomes.length === 0 && (
                  <ContentCard p="4" gap="4">
                    <Heading size="4">Adicionar Renda</Heading>

                    <IncomeForm />
                  </ContentCard>
                )}
              </>
            )}

            {page === "compareTaxes" && (
              <CompareTax enableDoubleCompare={false} />
            )}

            {page === "compareFinancings" && <CompareFinancing />}

            {page === "compareCompoundInterest" && <CompareCompoundInterest />}
            {page === "timeToGoal" && <TimeToGoal />}
            {page === "test" && <Test />}
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
