import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./main.css";

// Radix Themes
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { AlertDialogProvider } from "./components/AlertDialog.tsx";
import { IncomeProvider } from "./hooks/IncomeProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Theme panelBackground="solid" radius="full" accentColor="blue">
        <AlertDialogProvider>
          <IncomeProvider>
            <App />
          </IncomeProvider>
        </AlertDialogProvider>
      </Theme>
    </ThemeProvider>
  </React.StrictMode>
);
