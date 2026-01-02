import { createContext, useContext } from "react";

export interface AlertContextType {
  alert: (message: string) => void;
  confirm: (message: string) => Promise<boolean>;
}

export const AlertContext = createContext<AlertContextType | undefined>(
  undefined
);

export function useAlertDialog() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialogProvider");
  }
  return context;
}
