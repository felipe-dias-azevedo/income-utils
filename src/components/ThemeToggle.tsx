import { IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

export function ThemeToggle() {
  const { theme, systemTheme, setTheme } = useTheme();

  const isDark = useMemo(
    () => (theme === "system" ? systemTheme === "dark" : theme === "dark"),
    [theme, systemTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [setTheme, isDark]);

  return (
    <IconButton
      onClick={toggleTheme}
      variant="surface"
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
