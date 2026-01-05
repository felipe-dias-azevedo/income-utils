import { useState, type ReactNode } from "react";
import {
  AlertDialog as RadixAlertDialog,
  Box,
  Button,
  Flex,
  Text
} from "@radix-ui/themes";
import { AlertContext } from "./AlertDialogContext";

type AlertType = "alert" | "confirm";

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertType;
}

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertState>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert"
  });
  const [confirmResolver, setConfirmResolver] = useState<
    ((value: boolean) => void) | null
  >(null);

  const handleClose = (confirmed: boolean = false) => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (confirmResolver) {
      confirmResolver(confirmed);
      setConfirmResolver(null);
    }
  };

  const alert = (message: string) => {
    setState({
      isOpen: true,
      title: "Aviso",
      message,
      type: "alert"
    });
  };

  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmResolver(() => resolve);
      setState({
        isOpen: true,
        title: "Confirmação",
        message,
        type: "confirm"
      });
    });
  };

  return (
    <AlertContext.Provider value={{ alert, confirm }}>
      {children}
      <RadixAlertDialog.Root open={state.isOpen} onOpenChange={handleClose}>
        <RadixAlertDialog.Content style={{ maxWidth: "450px" }}>
          <RadixAlertDialog.Title>{state.title}</RadixAlertDialog.Title>
          <Box py="4">
            <Text>{state.message}</Text>
          </Box>
          <Flex gap="3" justify="end">
            {state.type === "confirm" && (
              <RadixAlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancelar
                </Button>
              </RadixAlertDialog.Cancel>
            )}
            <RadixAlertDialog.Action>
              <Button
                onClick={() => handleClose(true)}
                color={state.type === "confirm" ? "blue" : undefined}
              >
                {state.type === "confirm" ? "Confirmar" : "OK"}
              </Button>
            </RadixAlertDialog.Action>
          </Flex>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Root>
    </AlertContext.Provider>
  );
}
