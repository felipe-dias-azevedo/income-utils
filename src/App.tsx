import {
  Box,
  Container,
  Flex,
  Spinner,
  DropdownMenu,
  Button
} from "@radix-ui/themes";
import { Header } from "./components/Header";
import { ThemeToggle } from "./components/ThemeToggle";

import { useIncomeContext } from "./contexts/IncomeContext";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import AppUpdatedDate from "./components/AppUpdatedDate";
import { useNavigate } from "react-router-dom";
import { AppRouter } from "./router";
import { NAVIGATION_ITEMS } from "./routes";

export default function App() {
  const {
    isLoading,
    actions: { isLoadingAction }
  } = useIncomeContext();
  const navigate = useNavigate();

  return (
    <Box
      className="bg-gradient"
      style={{
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
                  {NAVIGATION_ITEMS.map((item) => {
                    if (item.type === "separator") {
                      return <DropdownMenu.Separator key={item.key} />;
                    }

                    const Icon = item.icon;

                    return (
                      <DropdownMenu.Item
                        key={item.label}
                        onSelect={() => {
                          navigate(item.route);
                        }}
                      >
                        <Icon />
                        {item.label}
                      </DropdownMenu.Item>
                    );
                  })}
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
            <AppRouter />
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
