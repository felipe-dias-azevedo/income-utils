import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./main.css";
import "./styles/animations.css";

// Radix Themes
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { AlertDialogProvider } from "./components/AlertDialog.tsx";
import { IncomeProvider } from "./hooks/IncomeProvider.tsx";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Theme panelBackground="translucent" radius="full" accentColor="blue">
        <AlertDialogProvider>
          <IncomeProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </IncomeProvider>
        </AlertDialogProvider>
      </Theme>
    </ThemeProvider>
  </React.StrictMode>
);
