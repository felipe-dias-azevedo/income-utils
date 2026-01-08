import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./main.css";

// Radix Themes
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { AlertDialogProvider } from "./components/AlertDialog.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Theme panelBackground="solid" radius="full" accentColor="blue">
        <AlertDialogProvider>
          <App />
        </AlertDialogProvider>
      </Theme>
    </ThemeProvider>
  </React.StrictMode>
);
